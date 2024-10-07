/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
import Servicio from "../models/servicio.model.js"; 


import { handleError } from "../utils/errorHandler.js"; 


async function getServicios() { 
    try { 
        const servicios = await Servicio.find().exec(); 
        if (!servicios) return [null, "No hay servicios"]; 
        return [servicios, null]; 
    } catch (error) { 
        handleError(error, "servicio.service -> getServicios"); 
    } 
} 

async function createServicio(servicio) { 
    try { 
        const { idReserva, nombre, precio, duracion, descripcion } = servicio; 
        const newServicio = new Servicio({
            idReserva, 
            nombre, 
            precio, 
            duracion, 
            descripcion, 
        }); 
        await newServicio.save(); 
        return [newServicio, null]; 
    } catch (error) { 
        handleError(error, "servicio.service -> createServicio"); 
    } 
} 

async function deleteServicio(id) { 
    try { 
        const servicio = await Servicio.findByIdAndDelete(id).exec(); 
        if (!servicio) return [null, "El servicio no existe"]; 
        return [servicio, null]; 
    } catch (error) { 
        handleError(error, "servicio.service -> deleteServicio"); 
    } 
} 

async function updateServicio(id, servicio) { 
    try { 
        const { idReserva, nombre, precio, duracion, descripcion } = servicio; 
        const updatedServicio = await Servicio.findByIdAndUpdate(id, { 
            idReserva,
            nombre, 
            precio, 
            duracion, 
            descripcion, 
        }, { new: true }).exec(); 
        if (!updatedServicio) return [null, "El servicio no existe"]; 
        return [updatedServicio, null]; 
    } catch (error) { 
        handleError(error, "servicio.service -> updateServicio"); 
    } 
} 

async function getServicioById(id) { 
    try { 
        const servicio = await Servicio.findById(id).exec();
        if (!servicio) return [null, "El servicio no existe"];
        return [servicio, null];
    } catch (error) {
        handleError(error, "servicio.service -> getServicioById");
    }
}

// añadir get por reserva o microempresa posiblemente segun MER

export default { getServicios, createServicio, deleteServicio, updateServicio, getServicioById }; 
