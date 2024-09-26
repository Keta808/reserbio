"use strict";

import UserModels from "../models/user.model.js"; // Importas el objeto por defecto

const { Trabajador, Cliente, Administrador } = UserModels; 
import State from "../models/state.model.js";

/**
 * Crea los roles por defecto en la base de datos.
 * @async
 * @function createState
 * @returns {Promise<void>}
 */
async function createState() {
  try {
    // Busca todos los roles en la base de datos
    const count = await State.estimatedDocumentCount();
    // Si no hay roles en la base de datos los crea
    if (count > 0) return;

    await Promise.all([
      new State({ name: "activo" }).save(),
      new State({ name: "inactivo" }).save(),
    ]);
    console.log("* => Estados creados exitosamente");
  } catch (error) {
    console.error(error);
  }
}

/**
 * Crea los usuarios por defecto en la base de datos.
 * @async
 * @function createUsers
 * @returns {Promise<void>}
 */
async function createUsers() {
  try {
    const count = await Administrador.estimatedDocumentCount();
    if (count > 0) return;
    const count1 = await Trabajador.estimatedDocumentCount();
    if (count1 > 0) return;

    await Promise.all([
      new Administrador({
        nickname: "admin",
        email: "admin@email.com",
        password: await Administrador.encryptPassword("admin123"),
        state: await State.findOne({ name: "activo" }),
      }).save(),
      new Trabajador({
        nombre: "Trabajador",
        apellido: "Trabajador",
        telefono: "123456789",
        email: "trabajador@email.com",
        password: await Trabajador.encryptPassword("trabajador123"),
        state: await State.findOne({ name: "activo" }),
      }).save(),
    ]);
    console.log("* => Users creados exitosamente");
  } catch (error) {
    console.error(error);
  }
}

export { createUsers, createState };
