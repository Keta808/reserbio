import Invitacion from "../models/invitacion.model.js";
import Enlace from "../models/enlace.model.js";
import EnlaceService from "../services/enlace.service.js";
const { updateEnlaceParcial } = EnlaceService;
import Microempresa from "../models/microempresa.model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import mongoose from "mongoose";
import UserService from "../services/user.service.js"; // ✅ Importar el servicio completo
import UserModels from "../models/user.model.js";
const { User } = UserModels;

dotenv.config(); // Cargar variables de entorno

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Genera un código numérico de 6 dígitos para la invitación
 */
function generateInvitationCode() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
}

/**
 * Crea una nueva invitación con código numérico
 */
async function crearInvitacion({ idMicroempresa, email }) {
    try {
        // 🔄 **Actualizar invitaciones expiradas antes de continuar**
        await actualizarInvitacionesExpiradas();
        
        // 🔎 **Validar si el correo ya está registrado**
        const usuarioExistente = await User.findOne({ email });
        if (!usuarioExistente) {
            throw new Error("El correo no está registrado en el sistema, no se puede enviar invitación.");
        }

        // 🏢 **Verificar que la microempresa existe**
        const microempresa = await Microempresa.findById(idMicroempresa);
        if (!microempresa) throw new Error("La microempresa no existe");

        // 🛠 **Verificar si ya tiene 10 trabajadores (solo los activos)**
        const totalTrabajadoresActivos = await Enlace.countDocuments({
            id_microempresa: idMicroempresa,
            estado: true, // 📌 Filtra solo trabajadores activos
        });

        if (totalTrabajadoresActivos >= 10) {
            throw new Error("La microempresa ya alcanzó el límite de 10 trabajadores");
        }

        // 🛠 **Actualizar invitaciones expiradas antes de continuar**
        await Invitacion.updateMany(
            { idMicroempresa, email, estado: "pendiente", fechaExpiracion: { $lte: new Date() } },
            { $set: { estado: "expirada" } }
        );

        // 🛠 **Verificar si ya existe una invitación activa para el mismo email**
        const invitacionActiva = await Invitacion.findOne({
            idMicroempresa,
            email,
            estado: "pendiente",
        });

        if (invitacionActiva) {
            throw new Error("Ya existe una invitación activa para este usuario.");
        }

        // 🔑 **Generar el código único para la nueva invitación**
        const codigoInvitacion = generateInvitationCode();
        if (!codigoInvitacion) throw new Error("Error: codigoInvitacion no se generó correctamente.");

        // 📌 **Guardar la nueva invitación en la base de datos**
        const nuevaInvitacion = await Invitacion.create({
            idMicroempresa,
            email,
            id_role: new mongoose.Types.ObjectId("67a4f4fd19fd800efa096295"), // ID del rol "Trabajador"
            estado: "pendiente",
            codigoInvitacion,
            fechaExpiracion: new Date(Date.now() + 10 * 60 * 1000), // Expira en 10 minutos
        });

        // 📩 **Enviar email con el nuevo código**
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Código de invitación a una microempresa",
            html: `
                <p>Has sido invitado a unirte a la microempresa <strong>${microempresa.nombre}</strong>.</p>
                <p>Para aceptar la invitación, ingresa el siguiente código en la app:</p>
                <h2 style="color: #008CBA; text-align: center;">${codigoInvitacion}</h2>
                <p>Este código es válido por 10 minutos.</p>
            `,
        });

        console.log("📩 Código enviado a:", email);

        return { message: "Invitación enviada con éxito", data: nuevaInvitacion };
    } catch (error) {
        console.error("❌ Error al enviar la invitación:", error.message);
        throw new Error(error.message);
    }
}

/**
 * Verifica si un código de invitación es válido
 */
async function verificarCodigoInvitacion(codigo) {
    try {
        const invitacion = await Invitacion.findOne({ codigoInvitacion: codigo });

        if (!invitacion) {
            return { success: false, message: "Código inválido o inexistente" };
        }

        if (new Date() > invitacion.fechaExpiracion) {
            return { success: false, message: "El código ha expirado" };
        }

        return { success: true, data: invitacion };
    } catch (error) {
        console.error("❌ Error al verificar el código de invitación:", error.message);
        throw new Error(error.message);
    }
}

/**
 * Acepta una invitación y añade al trabajador a la microempresa
 */
async function aceptarInvitacionPorCodigo(codigo, userId) {
    try {
        const invitacion = await Invitacion.findOne({ codigoInvitacion: codigo });
        if (!invitacion) throw new Error("Código inválido o inexistente");

        const microempresa = await Microempresa.findById(invitacion.idMicroempresa);
        if (!microempresa) {
            throw new Error("La microempresa asociada a la invitación no existe.");
        }

        let trabajadorId = userId; // Por defecto, usar el mismo ID recibido

        // 📌 **Verificar si el usuario es Cliente y transformarlo en Trabajador**
        const user = await UserModels.Cliente.findById(userId);
        if (user) { // ✅ Si existe, convertirlo en Trabajador
            console.log(`🔄 Transformando Cliente ${user.email} en Trabajador...`);
            const [nuevoTrabajador, error] = await UserService.userChange(userId);
            if (error) throw new Error(error);
            trabajadorId = nuevoTrabajador._id; // ✅ Actualizar ID del trabajador
        }

        // 📌 **Crear un nuevo enlace para el historial**
        const nuevoEnlace = await Enlace.create({
            id_trabajador: trabajadorId,
            id_role: invitacion.id_role,
            id_microempresa: invitacion.idMicroempresa,
            fecha_inicio: new Date(),
            estado: true,
        });

        // 📌 **Actualizar la microempresa para incluir el nuevo enlace**
        await Microempresa.findByIdAndUpdate(
            invitacion.idMicroempresa,
            { $addToSet: { trabajadores: nuevoEnlace._id } }, // ✅ Agregar solo el ID del Enlace
            { new: true },
        );

        // 📌 **Actualizar estado de la invitación**
        invitacion.estado = "aceptada";
        await invitacion.save();

        // 📌 **Enviar correo de confirmación**
        await enviarCorreoConfirmacion(invitacion.email, "aceptada", microempresa.nombre);

        return { message: "Invitación aceptada y trabajador añadido" };
    } catch (error) {
        throw new Error(error.message);
    }
}


/**
 * Obtiene las invitaciones pendientes de una microempresa
 */
async function obtenerInvitaciones(idMicroempresa) {
    try {
        const invitaciones = await Invitacion.find({ idMicroempresa, estado: "pendiente" });
        return invitaciones;
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * Envia un correo al usuario dependiendo del estado de la invitación
 */
async function enviarCorreoConfirmacion(email, estado, microempresaNombre) {
    let subject = "";
    let message = "";

    switch (estado) {
        case "aceptada":
            subject = "Invitación aceptada";
            message = `Has aceptado la invitación para unirte a ${microempresaNombre}. Ya puedes acceder a la plataforma.`;
            break;
        case "expirada":
            subject = "Invitación expirada";
            message = `Tu invitación para unirte a ${microempresaNombre} ha expirado. Si deseas unirte, solicita una nueva invitación.`;
            break;
        default:
            return;
    }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text: message,
    });
}

/**
 * Actualiza el estado de las invitaciones pendientes que han expirado
 */
async function actualizarInvitacionesExpiradas() {
    await Invitacion.updateMany(
        { estado: "pendiente", fechaExpiracion: { $lt: new Date() } },
        { estado: "expirada" },
    );
}

export default {
    crearInvitacion,
    verificarCodigoInvitacion,
    aceptarInvitacionPorCodigo,
    obtenerInvitaciones,
};
