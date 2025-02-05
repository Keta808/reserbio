import Invitacion from "../models/invitacion.model.js";
import Enlace from "../models/enlace.model.js";
import Microempresa from "../models/microempresa.model.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import crypto from "crypto";
import mongoose from "mongoose";

dotenv.config(); // Cargar variables de entorno

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Genera un token aleatorio para la invitación
 */
const generateToken = () => crypto.randomBytes(32).toString("hex");

/**
 * Crea una nueva invitación para un trabajador
 */
export async function crearInvitacion({ idMicroempresa, email, role }) {
    try {
        // Verificar que la microempresa existe
        const microempresa = await Microempresa.findById(idMicroempresa);
        if (!microempresa) throw new Error("La microempresa no existe");

        // Verificar si ya tiene 10 trabajadores
        const totalTrabajadores = await Enlace.countDocuments({ id_microempresa: idMicroempresa });
        if (totalTrabajadores >= 10) throw new Error("La microempresa ya alcanzó el límite de 10 trabajadores");

        // Crear la invitación con estado "pendiente"
        const nuevaInvitacion = await Invitacion.create({
            idMicroempresa,
            email,
            id_role: new mongoose.Types.ObjectId(role),
            estado: "pendiente",
            token: generateToken(),
            fechaExpiracion: new Date(Date.now() + 24 * 60 * 60 * 1000), // Expira en 24h
        });

        // Enviar email de invitación
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Invitación a unirse a una microempresa",
            text: `Has sido invitado a unirte a la microempresa ${microempresa.nombre}. Para aceptar, usa este enlace: ${process.env.BACKEND_URL}/api/invitaciones/aceptar-invitacion/${nuevaInvitacion.token}`,
        });

        return { message: "Invitación enviada con éxito", data: nuevaInvitacion };
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * Obtiene una invitación por su token
 */
export async function obtenerInvitacionPorToken(token) {
    return await Invitacion.findOne({ token });
}

/**
 * Acepta una invitación y añade al trabajador a la microempresa
 */
export async function aceptarInvitacion(token, userId) {
    try {
        const invitacion = await obtenerInvitacionPorToken(token);
        if (!invitacion) throw new Error("Invitación no encontrada");

        // Verificar si ya expiró
        if (new Date() > invitacion.fechaExpiracion) {
            invitacion.estado = "expirada";
            await invitacion.save();
            throw new Error("La invitación ha expirado");
        }

        // Crear enlace de trabajador
        await Enlace.create({
            id_trabajador: userId,
            id_role: invitacion.id_role,
            id_microempresa: invitacion.idMicroempresa,
            fecha_inicio: new Date(),
            estado: true,
        });

        // Actualizar estado de la invitación
        invitacion.estado = "aceptada";
        await invitacion.save();

        return { message: "Invitación aceptada y trabajador añadido" };
    } catch (error) {
        throw new Error(error.message);
    }
}

/**
 * Obtiene las invitaciones pendientes de una microempresa
 */
export async function obtenerInvitaciones(idMicroempresa) {
    try {
        const invitaciones = await Invitacion.find({ idMicroempresa, estado: "pendiente" });
        return invitaciones;
    } catch (error) {
        throw new Error(error.message);
    }
}

/** */
