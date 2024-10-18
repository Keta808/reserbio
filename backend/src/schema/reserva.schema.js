import joi from "joi"; 

const fechaFormatoValido = (value, helpers) => {
  const regex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-(\d{4})$/; // Regex para DD-MM-YYYY
  if (!regex.test(value)) {
    return helpers.error("date.format", { message: "El campo día debe ser en formato DD-MM-YYYY." });
  }
  
  const [day, month, year] = value.split("-");
  const fecha = new Date(`${year}-${month}-${day}T00:00:00Z`);

  // Verificar si la fecha es válida
  if (isNaN(fecha.getTime())) {
    return helpers.error("date.base", { message: "El campo día debe ser una fecha válida." });
  }
  
  return fecha; // Retorna la fecha como un objeto Date
};

//schema para reserva.model.js
const reservaBodySchema = joi.object({
    hora_inicio: joi.string()
      .required()
      .messages({
        "date.base": "La hora de inicio debe ser de tipo Date.",
        "any.required": "La hora de inicio es obligatoria.",
      }),
    fecha: joi.string()
      .required()
      .custom(fechaFormatoValido)
      .messages({
        "any.required": "El día es obligatorio.",
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
