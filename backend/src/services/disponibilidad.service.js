import Disponibilidad from "../models/disponibilidad.model.js";
import { handleError } from "../utils/errorHandler.js";

import UserModels from "../models/user.model.js";
const { Trabajador, Cliente, User } = UserModels;

import Reserva from "../models/reserva.model.js";

/**
 * Obtiene la disponibilidad de un trabajador por su id
 * 
 */

async function getDisponibilidadByTrabajador(id) {
    try {
        const disponibilidad = await Disponibilidad.find({ trabajador: id }).exec();
        if (!disponibilidad) return [null, "No hay disponibilidad"];

        return [disponibilidad, null];
    } catch (error) {
        handleError(error, "disponibilidad.service -> getDisponibilidadByTrabajador");
    }
}

/**
 * Crea una nueva disponibilidad en la base de datos teniendo en cuenta las validaciones de: 
 * 
 * 
 */

async function createDisponibilidad(disponibilidadData) {
    try {

        const { trabajador, dia, hora_inicio, hora_fin, excepciones } = disponibilidadData;

        //Valida si el trabajador existe
        const trabajadorFound = await Trabajador.findById(trabajador);
        if (!trabajadorFound) return [null, "El trabajador no existe"];

        //Valida si la disponibilidad en ese dia ya existe
        const disponibilidadFound = await Disponibilidad.findOne({ trabajador, dia });
        if (disponibilidadFound) return [null, "La disponibilidad ya existe"];

        const disponibilidad = new Disponibilidad({
            trabajador,
            dia,
            hora_inicio,
            hora_fin,
            excepciones
        });

        await disponibilidad.save();

        return [disponibilidad, null];
    }
    catch (error) {
        handleError(error, "disponibilidad.service -> createDisponibilidad");
    }
}

/**
 * Actualiza la disponibilidad de un trabajador
 * 
 */


async function updateDisponibilidad(id, disponibilidad) {
    try {
        const { dia, hora_inicio, hora_fin, excepciones } = disponibilidad;

        const disponibilidadFound = await Disponibilidad.findById(id);
        if (!disponibilidadFound) return [null, "La disponibilidad no existe"];

        disponibilidadFound.dia = dia;
        disponibilidadFound.hora_inicio = hora_inicio;
        disponibilidadFound.hora_fin = hora_fin;
        disponibilidadFound.excepciones = excepciones;

        await disponibilidadFound.save();

        return [disponibilidadFound, null];
    } catch (error) {
        handleError(error, "disponibilidad.service -> updateDisponibilidad");
    }
}

/**
 * Elimina una disponibilidad de la base de datos por su id
 * 
 */

async function deleteDisponibilidad(id) {
    try {
        return await Disponibilidad.findByIdAndDelete(id);
    } catch (error) {
        handleError(error, "disponibilidad.service -> deleteDisponibilidad");
    }
}

// Función para convertir la fecha de formato DD-MM-YYYY a Date
function stringToDateOnly(fecha) {
    const [dia, mes, año] = fecha.split("-");
    return new Date(año, mes - 1, dia); // Retorna solo la fecha, sin la hora
}


// Función para convertir una hora en formato HH:MM a minutos
function timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    return hours * 60 + minutes;
}

// Función para calcular la hora de fin a partir de la hora de inicio y la duración
function calcularHoraFin(horaInicio, duracion) {
    const [hora, minuto] = horaInicio.split(':').map(num => parseInt(num, 10));
    const fechaInicio = new Date();
    fechaInicio.setHours(hora, minuto); // Establecemos la hora de inicio en un objeto Date temporal
    fechaInicio.setMinutes(fechaInicio.getMinutes() + duracion); // Sumamos la duración a la hora de inicio
    return formatTimeToString(fechaInicio);
}

// Función para formatear la hora a string "HH:MM"
function formatTimeToString(time) {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}


  async function getAvailableSlots(workerId, date) {
    try {
        const fechaConsulta = stringToDateOnly(date);
        //console.log("Fecha de consulta:", fechaConsulta);

        const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
        const diaSemana = diasSemana[fechaConsulta.getDay()];
        //console.log("Día de la semana:", diaSemana);

        // Obtener la disponibilidad del trabajador
        const disponibilidad = await Disponibilidad.findOne({ trabajador: workerId, dia: diaSemana });
        if (!disponibilidad) {
            return [null, "El trabajador no tiene disponibilidad en este día"];
        }

        const horaInicioDisponible = disponibilidad.hora_inicio;
        const horaFinDisponible = disponibilidad.hora_fin;
        //console.log("Hora de inicio disponible:", horaInicioDisponible);
        //console.log("Hora de fin disponible:", horaFinDisponible);


        // Obtener las reservas del trabajador en la fecha consultada
        const reservas = await Reserva.find({ trabajador: workerId, fecha: fechaConsulta }).sort({ "hora_inicio": 1 });
        //console.log("Reservas encontradas:", reservas);

        let slotsDisponibles = [];
        let tiempoLibre = horaInicioDisponible;

        // Recorremos las reservas para calcular los intervalos libres
        for (let i = 0; i < reservas.length; i++) {
            const reserva = reservas[i];
            const horaInicioReserva = new Date(reserva.hora_inicio);
            const horaInicioStr = formatTimeToString(horaInicioReserva);  // Convertimos la hora a "HH:MM"
            
            // Obtener la duración del servicio asociado
            const duracionReserva = reserva.duracion;  // 60 minutos por defecto si no se encuentra
            const horaFinReserva = calcularHoraFin(horaInicioStr, duracionReserva);
            //console.log("Reserva - Hora inicio:", horaInicioStr, "Hora fin:", horaFinReserva);

            // Verificamos si hay un intervalo libre antes de la reserva
            if (timeToMinutes(tiempoLibre) < timeToMinutes(horaInicioStr)) {
                slotsDisponibles.push({
                    inicio: tiempoLibre,
                    fin: horaInicioStr
                });
            }

            // El próximo intervalo libre será después de la última reserva
            tiempoLibre = horaFinReserva;
        }

        // Si hay tiempo libre después de la última reserva
        if (timeToMinutes(tiempoLibre) < timeToMinutes(horaFinDisponible)) {
            slotsDisponibles.push({
                inicio: tiempoLibre,
                fin: horaFinDisponible
            });
        }


        // Retornar los intervalos disponibles encontrados
        if (slotsDisponibles.length === 0) {
            return [null, "No hay intervalos disponibles en el día seleccionado"];
        }

        return [slotsDisponibles, null];

    } catch (error) {
        console.error("Error al obtener los intervalos disponibles:", error);
        return [null, "Ocurrió un error al calcular los horarios disponibles"];
    }
}







export default { 
    getDisponibilidadByTrabajador, 
    createDisponibilidad, 
    updateDisponibilidad,
    deleteDisponibilidad,
    getAvailableSlots,

};
