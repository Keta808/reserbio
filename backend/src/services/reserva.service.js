import Reserva from '../models/reserva.model.js'; 
import { handleError } from "../utils/errorHandler.js"; 

//Importa el modelo de User
import UserModels from "../models/user.model.js";
const { Trabajador, Cliente, User } = UserModels;

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
        const reservas = await Reserva.find({ trabajador: id })
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


function stringToDate(horaString) {
    const [horas, minutos] = horaString.split(':').map(Number);
    const ahora = new Date();
    ahora.setHours(horas);
    ahora.setMinutes(minutos);
    ahora.setSeconds(0);
    ahora.setMilliseconds(0);
    return ahora;
}


async function createReserva(reserva) {
    try {
        const { hora_inicio, cliente, trabajador, servicio, estado } = reserva;

        // Convertir hora de inicio de string a Date
        const horaInicioDate = stringToDate(hora_inicio);
        
        // Validacion de que no exista una reserva con la misma hora de inicio y trabajador
        const reservaFound = await Reserva.findOne({ hora_inicio: horaInicioDate, trabajador });
        if (reservaFound) return [null, "Ya existe una reserva con la misma hora de inicio y trabajador"];
        
        // Validacion de que no exista otra reserva que sume la duración del servicio
        const servicioFound = await Servicio.findById(servicio);
        if (!servicioFound) return [null, "El servicio no existe"];
        
        const duracion = servicioFound.duracion;
        const horaFin = new Date(horaInicioDate);
        horaFin.setMinutes(horaFin.getMinutes() + duracion);
        
        // Obtener reservas existentes
        const reservas = await Reserva.find({ trabajador });
        
        for (let reservaExistente of reservas) {
            const horaInicioReserva = new Date(reservaExistente.hora_inicio);
            const horaFinReserva = new Date(horaInicioReserva);
            horaFinReserva.setMinutes(horaFinReserva.getMinutes() + servicioFound.duracion);
            
            // Verificar colisiones
            if (
                (horaInicioDate >= horaInicioReserva && horaInicioDate < horaFinReserva) ||
                (horaFin > horaInicioReserva && horaFin <= horaFinReserva) ||
                (horaInicioDate <= horaInicioReserva && horaFin >= horaFinReserva)
            ) {
                return [null, "Ya existe una reserva que choca con este horario"];
            }
        }

        const trabajadorFound = await Trabajador.findById(trabajador);
        if (!trabajadorFound) return [null, "El trabajador no existe"];

        const clienteFound = await Cliente.findById(cliente);
        if (!clienteFound) return [null, "El cliente no existe"];

        const newReserva = new Reserva({
            hora_inicio: horaInicioDate, // Aquí guardamos el Date
            cliente,
            trabajador,
            servicio,
            estado
        });
        await newReserva.save();

        return [newReserva, null];
    } catch (error) {
        handleError(error, "reserva.service -> createReserva");
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

export default { getReservas, getReservasByTrabajador, createReserva, deleteReserva, updateReserva };




