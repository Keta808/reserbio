import Disponibilidad from "../models/disponibilidad.model.js";
import { handleError } from "../utils/errorHandler.js";

import UserModels from "../models/user.model.js";
const { Trabajador, Cliente, User } = UserModels;

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

export default { 
    getDisponibilidadByTrabajador, 
    createDisponibilidad, 
    updateDisponibilidad,
    deleteDisponibilidad, 
};
