"use strict";

import Joi from "joi";

const planBodySchema = Joi.object({
    tipo_plan: Joi.string().required().messages({
        "string.empty": "El tipo_plan no puede estar vacío.",
        "any.required": "El tipo_plan es obligatorio.",
        "string.base": "El tipo_plan debe ser de tipo string.",
    }),
    precio: Joi.number().required().messages({
        "number.base": "El precio debe ser de tipo numérico.",
        "any.required": "El precio es obligatorio.",
    }),
    descripcion: Joi.string().required().messages({
        "string.empty": "La descripción no puede estar vacía.",
        "any.required": "La descripción es obligatoria.",
        "string.base": "La descripción debe ser de tipo string.",
    }),
    
    
}).messages({
    "object.unknown": "No se permiten propiedades adicionales.",
});
const planIdSchema = Joi.object({
    id: Joi.string().required().messages({
        "string.empty": "El id no puede estar vacío.",
        "any.required": "El id es obligatorio.",
        "string.base": "El id debe ser de tipo string.",
    }),
}).messages({
    "object.unknown": "No se permiten propiedades adicionales.",
}); 


export { planBodySchema, planIdSchema };
