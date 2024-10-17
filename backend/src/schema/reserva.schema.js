/* eslint-disable quotes */
/* eslint-disable require-jsdoc */
import joi from "joi"; 

//schema para reserva.model.js
const reservaBodySchema = joi.object({
    hora_inicio: joi.string()
      .required()
      .messages({
        "date.base": "La hora de inicio debe ser de tipo Date.",
        "any.required": "La hora de inicio es obligatoria.",
      }),
    cliente: joi.string()
      .required()
      .pattern(/^(?:[0-9a-fA-F]{24}|[0-9a-fA-F]{12})$/)
      .messages({
        "string.empty": "El id del cliente no puede estar vacío.",
        "any.required": "El id del cliente es obligatorio.",
        "string.base": "El id del cliente debe ser de tipo string.",
        "string.pattern.base": "El id del cliente proporcionado no es un ObjectId válido.",
      }),
    trabajador: joi.string()
      .required()
      .pattern(/^(?:[0-9a-fA-F]{24}|[0-9a-fA-F]{12})$/)
      .messages({
        "string.empty": "El id del trabajador no puede estar vacío.",
        "any.required": "El id del trabajador es obligatorio.",
        "string.base": "El id del trabajador debe ser de tipo string.",
        "string.pattern.base": "El id del trabajador proporcionado no es un ObjectId válido.",
      }),
    servicio: joi.string()
      .required()
      .pattern(/^(?:[0-9a-fA-F]{24}|[0-9a-fA-F]{12})$/)
      .messages({
        "string.empty": "El id del servicio no puede estar vacío.",
        "any.required": "El id del servicio es obligatorio.",
        "string.base": "El id del servicio debe ser de tipo string.",
        "string.pattern.base": "El id del servicio proporcionado no es un ObjectId válido.",
      }),
    estado: joi.string()
      .required()
      .messages({
        "string.empty": "El estado no puede estar vacío.",
        "any.required": "El estado es obligatorio.",
      }),
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

