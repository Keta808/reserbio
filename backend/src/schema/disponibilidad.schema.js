"use strict";

import Joi from "joi";

/**
 * 
 * Esquema de validación para el cuerpo de la solicitud de disponibilidad.
 * @constant {Object}
 */


const disponibilidadBodySchema = Joi.object({

    trabajador: Joi.string().required().messages({
        "string.empty": "El trabajador no puede estar vacío.",
        "any.required": "El trabajador es obligatorio.",
        "string.base": "El trabajador debe ser de tipo string.",
    }),

    dia: Joi.string().required().messages({
        "string.empty": "El día no puede estar vacío.",
        "any.required": "El día es obligatorio.",
        "string.base": "El día debe ser de tipo string.",
    }),

    hora_inicio: Joi.string().required().messages({
        "string.empty": "La hora de inicio no puede estar vacía.",
        "any.required": "La hora de inicio es obligatoria.",
        "string.base": "La hora de inicio debe ser de tipo string.",
    }),

    hora_fin: Joi.string().required().messages({
        "string.empty": "La hora de fin no puede estar vacía.",
        "any.required": "La hora de fin es obligatoria.",
        "string.base": "La hora de fin debe ser de tipo string.",
    }),

    excepciones: Joi.array().items(Joi.object({
        inicio_no_disponible: Joi.string().required().messages({
            "string.empty": "La hora de inicio no puede estar vacía.",
            "any.required": "La hora de inicio es obligatoria.",
            "string.base": "La hora de inicio debe ser de tipo string.",
        }),
        fin_no_disponible: Joi.string().required().messages({
            "string.empty": "La hora de fin no puede estar vacía.",
            "any.required": "La hora de fin es obligatoria.",
            "string.base": "La hora de fin debe ser de tipo string.",
        }),
    })).messages({
        "array.base": "Las excepciones deben ser de tipo array.",
        "any.required": "Las excepciones son obligatorias.",
        "string.base": "Las excepciones deben ser de tipo string.",
    }),

}).messages({

    "object.unknown": "No se permiten propiedades adicionales.",
});


const disponibilidadIdSchema = Joi.object({
    id: Joi.string().required().messages({
        "string.empty": "El id no puede estar vacío.",
        "any.required": "El id es obligatorio.",
        "string.base": "El id debe ser de tipo string.",
    }),
}).messages({
    "object.unknown": "No se permiten propiedades adicionales.",
});


export { disponibilidadBodySchema, disponibilidadIdSchema };

