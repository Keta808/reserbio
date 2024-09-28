/* eslint-disable quotes */
/* eslint-disable require-jsdoc */
import joi from "joi"; 

const objectIdValidator = (value, helpers) => {
    if (!mongoose.Types.ObjectId.isValid(value)) {
        return helpers.message("El valor proporcionado no es un ObjectId válido.");
    }
    return value;
};
const reservaBodySchema = joi.object({

    hora_inicio: joi.string().required().messages({
        "string.empty": "La hora de inicio no puede estar vacía.",
        "any.required": "La hora de inicio es obligatoria.",
        "string.base": "La hora de inicio debe ser de tipo string.",
    }), 
    cliente: joi.string().required().custom(objectIdValidator).messages({
        "string.empty": "El cliente no puede estar vacío.",
        "any.required": "El cliente es obligatorio.",
        "string.base": "El cliente debe ser de tipo string.",
    }), 
    trabajador: joi.string().required().custom(objectIdValidator).messages({
        "string.empty": "El trabajador no puede estar vacío.",
        "any.required": "El trabajador es obligatorio.",
        "string.base": "El trabajador debe ser de tipo string.",
    }),
    servicio: joi.string().required().custom(objectIdValidator).messages({
        "string.empty": "El servicio no puede estar vacío.",
        "any.required": "El servicio es obligatorio.",
        "string.base": "El servicio debe ser de tipo string.",
    }),
    estado: joi.string().valid('disponible', 'cancelada', 'finalizada').required().messages({
        "string.empty": "El estado no puede estar vacío.",
        "any.required": "El estado es obligatorio.",
        "string.base": "El estado debe ser de tipo string.",
        "any.only": "El estado proporcionado no es válido.",
    }), 
}).messages({
    "object.unknown": "No se permiten propiedades adicionales.",
  });

  const reservaIdSchema = joi.object({
    id: joi.string()
      .required()
      .pattern(/^(?:[0-9a-fA-F]{24}|[0-9a-fA-F]{12})$/)
      .messages({
        "string.empty": "El id no puede estar vacío.",
        "any.required": "El id es obligatorio.",
        "string.base": "El id debe ser de tipo string.",
        "string.pattern.base": "El id proporcionado no es un ObjectId válido.",
      }),
  });

export { reservaBodySchema, reservaIdSchema };

