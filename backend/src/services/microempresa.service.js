"use strict";

import Microempresa from "../models/microempresa.model.js";

import { handleError } from "../utils/errorHandler.js";

/**
 * Obtiene todas las microempresas de la base de datos
 * @returns {Promise} Promesa con el objeto de las microempresas
 */
async function getMicroempresas() {
    try {
        const microempresas = await Microempresa.find().exec();
        if (!microempresas || microempresas.length === 0) return [null, "No hay microempresas"];
    
        const shuffledMicroempresas = microempresas.sort(() => Math.random() - 0.5);
        
        return [shuffledMicroempresas, null];
    } catch (error) {
        handleError(error, "microempresa.service -> getMicroempresas");
    }
}

/**
 * Crea una nueva microempresa en la base de datos
 * @param {Object} microempresa Objeto de microempresa
 * @returns {Promise} Promesa con el objeto de microempresa creado
 */
async function createMicroempresa(microempresa) {
    try {
        const {
            nombre,
            descripcion,
            telefono,
            direccion,
            email,
            categoria,
            idPlan,
            idTrabajador,
        } = microempresa;

        const microempresaFound = await Microempresa.findOne({ email: microempresa.email });
        if (microempresaFound) return [null, "La microempresa ya existe"];

        const newMicroempresa = new Microempresa({
            nombre,
            descripcion,
            telefono,
            direccion,
            email,
            categoria,
            idPlan,
            idTrabajador,
        });
        await newMicroempresa.save();

        return [newMicroempresa, null];
    } catch (error) {
        handleError(error, "microempresa.service -> createMicroempresa");
    }
}

/**
 * Obtiene una microempresa por su id de la base de datos
 */
async function getMicroempresaById(id) {
    try {
        const microempresa = await Microempresa.findById(id).exec();
        if (!microempresa) return [null, "La microempresa no existe"];

        return [microempresa, null];
    } catch (error) {
        handleError(error, "microempresa.service -> getMicroempresaById");
    }
}

/**
 * Actualiza una microempresa por su id de la base de datos
 * @param {string} id Id de la microempresa
 * @param {Object} microempresa Objeto de microempresa
 */
async function updateMicroempresaById(id, microempresa) {
    try {
        const {
            nombre,
            descripcion,
            telefono,
            direccion,
            email,
            categoria,
            idPlan,
            idTrabajador,
        } = microempresa;
        const microempresaFound = await Microempresa.findById(id).exec();
        if (!microempresaFound) return [null, "La microempresa no existe"];

        microempresaFound.nombre = nombre;
        microempresaFound.descripcion = descripcion;
        microempresaFound.telefono = telefono;
        microempresaFound.direccion = direccion;
        microempresaFound.email = email;
        microempresaFound.categoria = categoria;
        microempresaFound.idPlan = idPlan;
        microempresaFound.idTrabajador = idTrabajador;

        await microempresaFound.save();
        return [microempresaFound, null];
    } catch (error) {
        handleError(error, "microempresa.service -> updateMicroempresaById");
    }
}

/**
 * Elimina una microempresa por su id de la base de datos
 * @param {string} id Id de la microempresa
 * @returns {Promise} Promesa con el objeto de microempresa eliminado
 */
async function deleteMicroempresaById(id) {
    try {
        const deletedMicroempresa = await Microempresa.findByIdAndDelete(id);
        if (!deletedMicroempresa) return [null, "La microempresa no existe"];

        return [deletedMicroempresa, null];
    } catch (error) {
        handleError(error, "microempresa.service -> deleteMicroempresaById");
        return [null, "Error al eliminar la microempresa"];
    }
}

export default {
    getMicroempresas,
    createMicroempresa,
    getMicroempresaById,
    updateMicroempresaById,
    deleteMicroempresaById,
};

