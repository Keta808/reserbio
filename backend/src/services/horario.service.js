import Horario from "../models/horario.model.js";
import { handleError } from "../utils/errorHandler.js";
import moment from "moment";
import { timeToMinutes, minutesToTime, calcularHoraFin } from '../utils/timeUtils.js'; // Asegúrate de tener estas funciones

import UserModels from "../models/user.model.js";
const { Trabajador } = UserModels;
import Reserva from "../models/reserva.model.js";
import Enlace from "../models/enlace.model.js";
import Servicio from "../models/servicio.model.js";


/**
 * Obtiene el o los horario de un tabajador por su id
 * 
 * @param {*} trabajadorId 
 * @returns 
 */
async function getHorariosByTrabajadorId(trabajadorId) {
  try {

    console.log ("trabajadorId en getHorarios por trabajador", trabajadorId); 
    const horarios = await Horario.find({ trabajador: trabajadorId }).exec();
    if(!horarios)  return [null, 'No se encontraron horarios para el trabajador'];  

    return [horarios, null];    
  } catch (error) {
    throw handleError(error, "horarios.service.js -> getHorariosByTrabajadorId");
    }
}


/**
 * Crea un nuevo horario en la base de datos
 * 
 * 
 */

async function createHorario(data) {
    try {
      console.log("data en createHorario", data);
  
      const { trabajador, dia } = data;
  
      // Verificar si el trabajador existe
      const trabajadorExist = await Trabajador.findById(trabajador).exec();
      if (!trabajadorExist) return [null, 'El trabajador no existe'];
  
      // Validar si ya existe un horario para el mismo día
      const horarioExistente = await Horario.findOne({ trabajador, dia }).exec();
      if (horarioExistente) {
        return [null, `Ya existe un horario para el trabajador en el día ${dia}`];
      }
  
      // Crear nuevo horario si no hay duplicado
      const nuevoHorario = new Horario(data);
  
      await nuevoHorario.save();
  
      return [nuevoHorario, null];
    } catch (error) {
      throw handleError(error, "horarios.service.js -> createHorario");
    }
  }
  

/**
 * Actualiza un horario por su id
 * 
 * 
 */

async function updateHorarioById(horarioId, data) {
    try {
        const horario = await Horario.findByIdAndUpdate(horarioId, data, { new: true }).exec();
        if (!horario) return [null, 'El horario no existe'];
        return [horario, null];
    }
    catch (error) {
        throw handleError(error, "horarios.service.js -> updateHorarioById");
    }
}


/**
 * Elimina un horario por su id
 * 
 * 
 * 
 */

async function deleteHorarioById(horarioId) {
    try {
        const horario = await Horario.findByIdAndDelete(horarioId).exec();
        if (!horario) return [null, 'El horario no existe'];
        return [horario, null];
    }
    catch (error) {
        throw handleError(error, "horarios.service.js -> deleteHorarioById");
    }
}


/**
 * Actualiza los bloques de un horario por día
 */


async function updateBloquesByDia(trabajadorId, dia, nuevosBloques) {
    try {
        console.log("updateBloquesByDia SERVICE:", trabajadorId, dia, nuevosBloques);
        const horario = await Horario.findOneAndUpdate(
            { trabajador: trabajadorId, dia },
            { $set: { bloques: nuevosBloques } },
            { new: true }
        );

        if (!horario) {
            throw new Error(`No se encontró el horario para el día ${dia}.`);
        }

        return horario;
    } catch (error) {
        throw errorHandler(error);
    }
};


/**
 * Funcion para obtener los días de la semana en el cual el trabajador no tiene horarios
 * 
 */

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

async function getDiasSinHorario(trabajadorId) {
  try {
    // Verificar si el trabajador existe
    const trabajadorExist = await Trabajador.findById(trabajadorId).exec();
    if (!trabajadorExist) return [null, 'El trabajador no existe'];

    // Buscar los horarios existentes del trabajador
    const horarios = await Horario.find({ trabajador: trabajadorId }).select('dia').exec();
    const diasConHorario = horarios.map(horario => horario.dia);

    // Filtrar los días que no tienen horario
    const diasSinHorario = DIAS_SEMANA.filter(dia => !diasConHorario.includes(dia));

    return [diasSinHorario, null];
  } catch (error) {
    throw handleError(error, "horarios.service.js -> getDiasSinHorario");
  }
}



const obtenerDiaEnEspañol = (fecha) => {
  const dia = new Date(fecha).getDay(); // Devuelve un número de 0 (domingo) a 6 (sábado)
  return DIAS_SEMANA[dia];
};



//FUNCION DE PRUEBA 

async function getHorasDisponibles(trabajadorId, fecha, duracionServicio) {
  try {
    console.log("getHorasDisponibles SERVICE:", trabajadorId, fecha, duracionServicio);
    // Validar si el trabajador existe
    const trabajadorExist = await Trabajador.findById(trabajadorId).exec();
    if (!trabajadorExist) return [null, 'El trabajador no existe'];


    // Convertir la fecha y obtener el día en español
    const diaEnEspañol = obtenerDiaEnEspañol(fecha);


    // Obtener el horario del trabajador para ese día
    const horario = await Horario.findOne({ trabajador: trabajadorId, dia: diaEnEspañol }).exec();
    if (!horario) return [null, 'No hay horario asignado para ese día'];

    // Obtener las reservas ya existentes en esa fecha
    const reservas = await Reserva.find({
      trabajador: trabajadorId,
      fecha: {
        $gte: new Date(`${fecha}T00:00:00.000Z`),
        $lte: new Date(`${fecha}T23:59:59.999Z`)
      }
    }).exec();

    // Crear slots de tiempo basados en los bloques horarios
    let slotsDisponibles = [];

    for (const bloque of horario.bloques) {
      let inicio = moment(`${fecha}T${bloque.hora_inicio}`);
      const fin = moment(`${fecha}T${bloque.hora_fin}`);

      while (inicio.clone().add(duracionServicio, 'minutes').isSameOrBefore(fin)) {
        const finSlot = inicio.clone().add(duracionServicio, 'minutes');

        // Verificar si el slot se solapa con alguna reserva existente
        const solapado = reservas.some(reserva => {
          const inicioReserva = moment(reserva.hora_inicio);
          const finReserva = inicioReserva.clone().add(reserva.duracion, 'minutes');

          return inicio.isBefore(finReserva) && finSlot.isAfter(inicioReserva);
        });

        if (!solapado) {
          slotsDisponibles.push({
            inicio: inicio.format('HH:mm'),
            fin: finSlot.format('HH:mm')
          });
        }

        inicio.add(duracionServicio, 'minutes'); // Avanzar al siguiente slot
      }
    }

    return [slotsDisponibles, null];
  } catch (error) {
    throw handleError(error, "horarios.service.js -> getHorasDisponibles");
  }
}


// FUNCION DE PRUEBA 
async function getHorariosDisponiblesMicroEmpresa(serviceId, date) {
    try {
      const diasSemana = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
      const parts = date.split("-");
      const fechaConsulta = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      const diaSemana = diasSemana[fechaConsulta.getUTCDay()];
  
      const servicio = await Servicio.findById(serviceId);
      if (!servicio) {
        return [null, "El servicio no existe"];
      }
      const duracionServicio = servicio.duracion;
  
      const trabajadores = await Enlace.find({
        id_microempresa: servicio.idMicroempresa,
        estado: true
      }).populate('id_trabajador');
  
      if (!trabajadores.length) {
        return [null, "No hay trabajadores activos en esta microempresa"];
      }
  
      let disponibilidadGlobal = [];
  
      for (const enlace of trabajadores) {
        const trabajador = enlace.id_trabajador;
  
        const horario = await Horario.findOne({
          trabajador: trabajador._id,
          dia: diaSemana
        });
  
        if (!horario) continue;
  
        for (const bloque of horario.bloques) {
          let tiempoLibre = timeToMinutes(bloque.hora_inicio);
          const horaFinBloque = timeToMinutes(bloque.hora_fin);
  
          const reservas = await Reserva.find({
            trabajador: trabajador._id,
            fecha: fechaConsulta,
            estado: 'Activa'
          }).sort({ hora_inicio: 1 });
  
          reservas.forEach(reserva => {
            const horaInicioReserva = timeToMinutes(reserva.hora_inicio);
            const horaFinReserva = horaInicioReserva + reserva.duracion;
  
            while (tiempoLibre + duracionServicio <= horaInicioReserva) {
              disponibilidadGlobal.push({
                trabajador: {
                  id: trabajador._id,
                  nombre: `${trabajador.nombre} ${trabajador.apellido}`
                },
                slot: {
                  inicio: minutesToTime(tiempoLibre),
                  fin: minutesToTime(tiempoLibre + duracionServicio)
                }
              });
              tiempoLibre += duracionServicio;
            }
            tiempoLibre = Math.max(tiempoLibre, horaFinReserva);
          });
  
          while (tiempoLibre + duracionServicio <= horaFinBloque) {
            disponibilidadGlobal.push({
              trabajador: {
                id: trabajador._id,
                nombre: `${trabajador.nombre} ${trabajador.apellido}`
              },
              slot: {
                inicio: minutesToTime(tiempoLibre),
                fin: minutesToTime(tiempoLibre + duracionServicio)
              }
            });
            tiempoLibre += duracionServicio;
          }
        }
      }
  
      if (!disponibilidadGlobal.length) {
        return [null, "No hay disponibilidad para este servicio en la fecha seleccionada"];
      }
  
      return [disponibilidadGlobal, null];
    } catch (error) {
      console.error("Error al obtener los horarios disponibles:", error);
      return [null, "Ocurrió un error al calcular los horarios disponibles"];
    }
  }


// exporta todas las funciones  
export default {
    getHorariosByTrabajadorId,
    createHorario,
    updateHorarioById,
    deleteHorarioById,
    updateBloquesByDia,
    getDiasSinHorario,
    getHorasDisponibles,
    getHorariosDisponiblesMicroEmpresa


};
