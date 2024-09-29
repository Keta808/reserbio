"use strict";

//Importa el modelo de enlace
import EnlaceModels from "../models/enlace.model.js";
const { Enlace } = EnlaceModels;

import { handleError } from "../utils/errorHandler.js";

async function getEnlaces() {
    try {
        const enlaces = await Enlace.find().exec();
        if (!enlaces) return [null, "No hay enlaces"];
    
        return [enlaces, null];
    } catch (error) {
        handleError(error, "enlace.service -> getEnlaces");
    }
}

async function createEnlace(enlace) {
    try {
        const { id_trabajador, id_role, id_microempresa, fecha_inicio, estado } = enlace;
    
        const enlaceFound = await Enlace.findOne({ id_trabajador: enlace.id_trabajador });
        if (enlaceFound) return [null, "El enlace ya existe"];
    
        const newEnlace = new Enlace({
            id_trabajador,
            id_role,
            id_microempresa,
            fecha_inicio,
            estado,
        });
        await newEnlace.save();
    
        return [newEnlace, null];
    } catch (error) {
        handleError(error, "enlace.service -> createEnlace");
    }
}

async function deleteEnlace(id) {
    try {
        const enlace = await Enlace.findByIdAndDelete(id).exec();
        if (!enlace) return [null, "El enlace no existe"];
    
        return [enlace, null];
    } catch (error) {
        handleError(error, "enlace.service -> deleteEnlace");
    }
}

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

export default { getEnlaces, createEnlace, deleteEnlace, updateEnlace };
