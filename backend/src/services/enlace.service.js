"use strict";

// Importa el modelo de enlace
import Enlace from "../models/enlace.model.js";

// Importa el modelo de User
import UserModels from "../models/user.model.js";
const { Trabajador } = UserModels;

import Role from "../models/role.model.js";
import Microempresa from "../models/microempresa.model.js";

import { handleError } from "../utils/errorHandler.js";

/** */
async function getEnlaces() {
    try {
        const enlaces = await Enlace.find().exec();
        if (!enlaces) return [null, "No hay enlaces"];
    
        return [enlaces, null];
    } catch (error) {
        handleError(error, "enlace.service -> getEnlaces");
    }
}

/**
 * 
 * @param {*} enlace 
 * @returns 
 */
async function createEnlace(enlace) {
    try {
        const { id_trabajador, id_role, id_microempresa, fecha_inicio, estado } = enlace;
        
        // Restricciones Enlace:
        // 1. Debe existir un trabajador en la base de datos
        const enlaceTrabajador = await Trabajador.findById(id_trabajador).exec();
        if (!enlaceTrabajador) return [null, "El trabajador no existe"];

        // 2. Debe existir un role en la base de datos
        const enlaceRole = await Role.findById(id_role).exec();
        if (!enlaceRole) return [null, "El role no existe"];

        // 3. Debe existir una microempresa en la base de datos
        const enlaceMicroempresa = await Microempresa.findById(id_microempresa).exec();
        if (!enlaceMicroempresa) return [null, "La microempresa no existe"];

        // 4. No puede haber dos enlaces con el mismo id_role con estado activo
        const enlaceFound = await Enlace.findOne({ id_role: enlace.id_role, estado: true });
        if (enlaceFound) return [null, "El enlace ya existe"];

        const newEnlace = new Enlace({
            id_trabajador,
            id_role,
            id_microempresa,
            fecha_inicio,
            estado,
        });
        await newEnlace.save();

        // Actualizar la microempresa con el nuevo trabajador
        enlaceMicroempresa.trabajadores.addToSet(id_trabajador); // addToSet evita duplicados
        await enlaceMicroempresa.save();
    
        return [newEnlace, null];
    } catch (error) {
        handleError(error, "enlace.service -> createEnlace");
    }
}

/** */
async function deleteEnlace(id) {
    try {
        const enlace = await Enlace.findByIdAndDelete(id).exec();
        if (!enlace) return [null, "El enlace no existe"];
    
        return [enlace, null];
    } catch (error) {
        handleError(error, "enlace.service -> deleteEnlace");
    }
}

/** */
async function updateEnlace(id, enlace) {
    try {
        const { id_trabajador, id_role, id_microempresa, fecha_inicio, estado } = enlace;
    
        const enlaceFound = await Enlace.findById(id);
        if (!enlaceFound) return [null, "El enlace no existe"];
    
        enlaceFound.id_trabajador = id_trabajador;
        enlaceFound.id_role = id_role;
        enlaceFound.id_microempresa = id_microempresa;
        enlaceFound.fecha_inicio = fecha_inicio;
        enlaceFound.estado = estado;
    
        await enlaceFound.save();
    
        return [enlaceFound, null];
    } catch (error) {
        handleError(error, "enlace.service -> updateEnlace");
    }
}

/** Obtener todos los trabajadores que pertenecen a una microempresa */
async function getTrabajadoresPorMicroempresa(id_microempresa) {
    try {
        // Buscar todos los enlaces asociados a la microempresa
        const enlaces = await Enlace.find({ id_microempresa }).populate("id_trabajador").exec();
        if (!enlaces || enlaces.length === 0) {
            return [null, "No se encontraron trabajadores para esta microempresa."];
        }   

        // Extraer y devolver solo la información de los trabajadores
        const trabajadores = enlaces.map(enlace => enlace.id_trabajador);

        return [trabajadores, null];
    } catch (error) {
        handleError(error, "enlace.service -> getTrabajadoresPorMicroempresa");
        return [null, "Error al obtener trabajadores"];
    }
}

/** Actualizar parcialmente el enlace */
async function updateEnlaceParcial(id, fieldsToUpdate) {
    try {
        const enlaceFound = await Enlace.findById(id);
        if (!enlaceFound) return [null, "El enlace no existe"];
        
        // Actualiza solo los campos proporcionados
        Object.keys(fieldsToUpdate).forEach((key) => {
            enlaceFound[key] = fieldsToUpdate[key];
        });

        await enlaceFound.save();
        return [enlaceFound, null];
    } catch (error) {
        handleError(error, "enlace.service -> updateEnlaceParcial");
        return [null, error.message];
    }
}


export default {
    getEnlaces,
    createEnlace,
    deleteEnlace,
    updateEnlace,
    getTrabajadoresPorMicroempresa,
    updateEnlaceParcial,
};
