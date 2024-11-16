/* eslint-disable no-console */
/* eslint-disable max-len */
/* eslint-disable quotes */
/* eslint-disable require-jsdoc */
import suscripcionService from '../services/suscripcion.service.js';    

 
async function crearSuscripcionBasica(req, res) {
    try {
        const [suscripcion, error] = await suscripcionService.crearSuscripcionBasica(req.user, req.body.cardTokenId);
        if (error) return res.status(400).json({ message: error });
        return res.status(201).json(suscripcion);
    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: error });
    }
}
export default { crearSuscripcionBasica };
