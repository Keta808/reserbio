import Reserva from '../models/reserva.model.js'; 
import { handleError } from "../utils/errorHandler.js"; 

//Importa el modelo de User
import UserModels from "../models/user.model.js";
const { Trabajador, Cliente, User } = UserModels;

//Importa el modelo de Disponibilidad
import Disponibilidad from "../models/disponibilidad.model.js";


//Importa el modelo de Servicio
import Servicio from "../models/servicio.model.js";

/*
Obtiene todas las reservas de la base de datos 
*/

async function getReservas() {
    try {
        const reservas = await Reserva.find()
            .populate('cliente')
            .populate('trabajador')
            .populate('servicio')
            .exec();
        if (!reservas) return [null, "No hay reservas"];

        return [reservas, null];
    } catch (error) {
        handleError(error, "reserva.service -> getReservas");
    }
}

/*
Obtiene todas las reservas de la base de datos por id del trabajador
*/

async function getReservasByTrabajador(id) {
    try {
        console.log("id", id);
        const reservas = await Reserva.find({ trabajador: id, estado: { $ne: 'Cancelada' } })
            .populate('cliente')
            .populate('trabajador')
            .populate('servicio')
            .exec();
        if (!reservas) return [null, "No hay reservas"];

        return [reservas, null];
    } catch (error) {
        handleError(error, "reserva.service -> getReservasByTrabajador");
    }
}

/**
 * Crea una nueva reserva en la base de datos teniendo en cuenta las validaciones de: 
 *
 * 
 */



const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

// Función para convertir hora_inicio a Date
function stringToDate(hora, fecha) {
    const [horaStr, minutoStr] = hora.split(':');
    const [dia, mes, año] = fecha.split("-");
    return new Date(año, mes - 1, dia, horaStr, minutoStr);
}

// Función para convertir la fecha de formato DD-MM-YYYY a Date
function stringToDateOnly(fecha) {
    const [dia, mes, año] = fecha.split("-");
    return new Date(año, mes - 1, dia);
}

async function createReserva(reserva) {
    try {
        const { hora_inicio, fecha, cliente, trabajador, servicio, estado } = reserva;

        // Validar formato de la hora de inicio
        const horaInicio = hora_inicio.split(':');
        if (horaInicio.length !== 2) return [null, "La hora de inicio no es válida"];

        // Validar existencia de trabajador y cliente
        const trabajadorFound = await Trabajador.findById(trabajador);
        if (!trabajadorFound) return [null, "El trabajador no existe"];
        const clienteFound = await Cliente.findById(cliente);
        if (!clienteFound) return [null, "El cliente no existe"];

        // Convertir fecha y hora a objetos Date
        const fechaReserva = stringToDateOnly(fecha); // Convertir DD-MM-YYYY a Date
        const horaInicioDate = stringToDate(hora_inicio, fecha); // Convertir HH:MM con fecha a Date

        // Validar existencia del servicio y calcular duración
        const servicioFound = await Servicio.findById(servicio);
        if (!servicioFound) return [null, "El servicio no existe"];

        const duracion = servicioFound.duracion;
        const horaFin = new Date(horaInicioDate);
        horaFin.setMinutes(horaFin.getMinutes() + duracion);

        // Obtener día de la semana
        const diaSemana = diasSemana[fechaReserva.getDay()];

        // Verificar disponibilidad del trabajador en el día
        const disponibilidad = await Disponibilidad.findOne({ trabajador: trabajador, dia: diaSemana });
        if (!disponibilidad) return [null, "El trabajador no está disponible en este día"];

        // Rango de disponibilidad
        const [inicioDisponible, finDisponible] = [
            new Date(`${fechaReserva.toDateString()} ${disponibilidad.hora_inicio}`),
            new Date(`${fechaReserva.toDateString()} ${disponibilidad.hora_fin}`)
        ];

        // Validar que la hora de inicio esté dentro del rango disponible
        if (horaInicioDate < inicioDisponible || horaInicioDate >= finDisponible) {
            return [null, "La hora ingresada está fuera del rango de disponibilidad del trabajador"];
        }

        // Validar contra excepciones
        const excepciones = disponibilidad.excepciones;
        if (excepciones && excepciones.length > 0) {
            for (let excepcion of excepciones) {
                const excepcionInicio = new Date(`${fechaReserva.toDateString()} ${excepcion.inicio_no_disponible}`);
                const excepcionFin = new Date(`${fechaReserva.toDateString()} ${excepcion.fin_no_disponible}`);

                if (
                    (horaInicioDate >= excepcionInicio && horaInicioDate < excepcionFin) ||
                    (horaFin > excepcionInicio && horaFin <= excepcionFin) ||
                    (horaInicioDate <= excepcionInicio && horaFin >= excepcionFin)
                ) {
                    return [null, "La hora ingresada choca con las excepciones del trabajador"];
                }
            }
        }

        // Validar que no exista una reserva que choque en horario
        const reservas = await Reserva.find({ trabajador, fecha: fechaReserva });
        for (let reservaExistente of reservas) {
            const horaInicioReserva = new Date(reservaExistente.hora_inicio);
            const horaFinReserva = new Date(horaInicioReserva);
            horaFinReserva.setMinutes(horaFinReserva.getMinutes() + reservaExistente.duracion);

            if (
                (horaInicioDate >= horaInicioReserva && horaInicioDate < horaFinReserva) ||
                (horaFin > horaInicioReserva && horaFin <= horaFinReserva) ||
                (horaInicioDate <= horaInicioReserva && horaFin >= horaFinReserva)
            ) {
                return [null, "Ya existe una reserva que choca con este horario"];
            }
        }

        // Crear la nueva reserva
        const newReserva = new Reserva({
            hora_inicio: horaInicioDate,
            fecha: fechaReserva,
            cliente,
            trabajador,
            servicio,
            duracion,
            estado
        });

        await newReserva.save();
        return [newReserva, null];
    } catch (error) {
        handleError(error, "reserva.service -> createReserva");
        return [null, "Ocurrió un error al crear la reserva"];
    }
}






/**
 * Elimina una reserva de la base de datos por su id
 * 
 */

async function deleteReserva(id) {
    try {
        return await Reserva.findByIdAndDelete(id);
    } catch (error) {
        handleError(error, "reserva.service -> deleteReserva");
    }
}

/**
 * Cambia el estado de la reserva
 * 
 */

async function updateReserva(id, estado) {
    try {
        return await Reserva.findByIdAndUpdate(id
            , { estado }
            , { new: true });
    }
    catch (error) {
        handleError(error, "reserva.service -> updateReserva");
    }

}


/**
 * Cambia el estado de una reserva a Cancelado
 * 
 */
async function cancelReserva(id) {
    try {
        // Actualiza la reserva y cambia su estado a "Cancelada"
        const reserva = await Reserva.findByIdAndUpdate(
            id,
            { estado: 'Cancelada' },
            { new: true, runValidators: true }
        );

        // Si no se encuentra la reserva, devuelve un error
        if (!reserva) {
            return [null, 'Reserva no encontrada'];
        }

        // Devuelve la reserva actualizada y un error nulo
        return [reserva, null];
    } catch (error) {
        console.error('Error en cancelReserva:', error.message || error);
        return [null, error.message];
    }
}


//get reservas cliente

async function getReservasByCliente(id) {
    try {
        console.log("id en servicio", id);
        
        const reservas = await Reserva.find({ cliente: id })
            .select("hora_inicio fecha estado trabajador servicio") // Solo los campos necesarios de la reserva
            .populate({
                path: "trabajador",
                select: "nombre apellido", // Solo traemos el nombre y apellido del trabajador
            })
            .populate({
                path: "servicio",
                select: "nombre", // Solo traemos el nombre del servicio
            })
            .exec();

        if (!reservas || reservas.length === 0) return [null, "No hay reservas"];

        return [reservas, null];
    } catch (error) {
        handleError(error, "reserva.service -> getReservasByCliente");
    }
}



export default { getReservas, getReservasByTrabajador, createReserva, deleteReserva, updateReserva, cancelReserva, getReservasByCliente };




