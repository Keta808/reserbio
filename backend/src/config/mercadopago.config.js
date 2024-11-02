import mercadopago from "mercadopago";
import { ACCESS_TOKEN } from "./configEnv.js";

// Configura el token de acceso como una propiedad
mercadopago.configurations = {
  access_token: ACCESS_TOKEN,
};

export default mercadopago;
