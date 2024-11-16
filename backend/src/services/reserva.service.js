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

        

      
        //Valida que la hora sea una hora valida
        const horaInicio = hora_inicio.split(':');
        if (horaInicio.length !== 2) return [null, "La hora de inicio no es válida"];
        

        // Validaciones adicionales de existencia de trabajador y cliente
        const trabajadorFound = await Trabajador.findById(trabajador);
        if (!trabajadorFound) return [null, "El trabajador no existe"];
        const clienteFound = await Cliente.findById(cliente);
        if (!clienteFound) return [null, "El cliente no existe"];

        // Convertir la fecha y hora de inicio a objeto Date
        const fechaReserva = stringToDateOnly(fecha);  // Fecha en formato DD-MM-YYYY
        const horaInicioDate = stringToDate(hora_inicio, fecha);  // Hora en formato HH:MM

        // Obtener el día de la semana como string (ej: "lunes")
        const diaSemana = diasSemana[fechaReserva.getDay()];

        // Validación de que el trabajador esté disponible en ese día
        const disponibilidad = await Disponibilidad.findOne({ trabajador: trabajador, dia: diaSemana });
        if (!disponibilidad || disponibilidad.length === 0) {
            return [null, "El trabajador no está disponible en este día"];
        }
       
        // Verificar si la hora de inicio está dentro del rango de disponibilidad
        const [inicioDisponible, finDisponible] = [
            new Date(`${fechaReserva.toDateString()} ${disponibilidad.hora_inicio}`),
            new Date(`${fechaReserva.toDateString()} ${disponibilidad.hora_fin}`)
        ];


         // Verificar si la hora de inicio está dentro del rango de las excepciones
         const excepciones = disponibilidad.excepciones; // Accede al array de excepciones
         //console.log(excepciones);
         if (excepciones && excepciones.length > 0) {

             for (let excepcion of excepciones) {
                 const excepcionInicio = new Date(`${fechaReserva.toDateString()} ${excepcion.inicio_no_disponible}`);
                 const excepcionFin = new Date(`${fechaReserva.toDateString()} ${excepcion.fin_no_disponible}`);
 
                 // Comprobar si la hora de inicio de la reserva choca con las excepciones
                 if (
                    console.log(horaInicioDate),
                        console.log(excepcionInicio),
                        console.log(excepcionFin),
                        
                     (horaInicioDate >= excepcionInicio && horaInicioDate < excepcionFin) || 
                     (horaFin > excepcionInicio && horaFin <= excepcionFin) ||
                     (horaInicioDate <= excepcionInicio && horaFin >= excepcionFin)
                 ) {
                     return [null, "La hora ingresada choca con las excepciones del trabajador"];
                 }
             }
         }
         
        // Validación de que no exista una reserva con la misma hora de inicio y trabajador
        const reservaFound = await Reserva.findOne({ hora_inicio: horaInicioDate, trabajador });
        if (reservaFound) return [null, "Ya existe una reserva con la misma hora de inicio y trabajador"];

        // Validación de que no exista otra reserva que sume la duración del servicio
        const servicioFound = await Servicio.findById(servicio);
        if (!servicioFound) return [null, "El servicio no existe"];
        //Saca la duracion del servicio

        const duracion = servicioFound.duracion;
        const horaFin = new Date(horaInicioDate);
        horaFin.setMinutes(horaFin.getMinutes() + duracion);

        // Obtener reservas existentes del trabajador en el día
        const reservas = await Reserva.find({ trabajador, fecha: fechaReserva });

        for (let reservaExistente of reservas) {
            const horaInicioReserva = new Date(reservaExistente.hora_inicio);
            const horaFinReserva = new Date(horaInicioReserva);
            horaFinReserva.setMinutes(horaFinReserva.getMinutes() + servicioFound.duracion);

            // Verificar colisiones de horarios
            if (
                (horaInicioDate >= horaInicioReserva && horaInicioDate < horaFinReserva) ||
                (horaFin > horaInicioReserva && horaFin <= horaFinReserva) ||
                (horaInicioDate <= horaInicioReserva && horaFin >= horaFinReserva)
            ) {
                return [null, "Ya existe una reserva que choca con este horario"];
            }
        }

        
        console.log("¿lleggo");
        // Crear la nueva reserva
        const newReserva = new Reserva({
            hora_inicio: horaInicioDate,  // Guardamos el Date de la hora
            fecha: fechaReserva,  // Guardamos el Date de la fecha
            cliente,
            trabajador,
            servicio,
            duracion,
            estado
        });
        console.log(newReserva);
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




