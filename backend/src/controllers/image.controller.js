import cloudinary from "../config/cloudinary.js";
import { respondSuccess, respondError } from "../utils/resHandler.js";
import Microempresa from "../models/microempresa.model.js";
import upload from "../middlewares/upload.middleware.js";

/**
 * Maneja la subida de una imagen a Cloudinary
 */
async function uploadFotoPerfil(req, res) {
    try {
        // console.log("Archivo recibido:", req.file);
        // console.log("Datos recibidos:", req.body);
        if (!req.file) {
            return respondError(req, res, 400, "No se ha proporcionado ninguna imagen");
        }

        // Subir la imagen a Cloudinary
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder: "microempresas", // Carpeta en Cloudinary
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                },
            );
            stream.end(req.file.buffer);
        });

        // Actualizar la Microempresa con la foto de perfil
        const microempresa = await Microempresa.findById(req.body.microempresaId);
        if (!microempresa) {
            return respondError(req, res, 404, "Microempresa no encontrada");
        }

        microempresa.fotoPerfil = {
            url: result.secure_url,
            public_id: result.public_id,
        };

        await microempresa.save();

        return respondSuccess(req, res, 200, { url: result.secure_url });
    } catch (error) {
        console.error(error);
        return respondError(req, res, 500, "Error al subir la imagen");
    }
}

/**
 * Maneja la subida de imágenes adicionales
 */
async function uploadImagenes(req, res) {
    try {
        console.log("Archivos recibidos:", req.files);
        console.log("Datos recibidos:", req.body);

        if (!req.files || req.files.length === 0) {
            return respondError(req, res, 400, "No se ha proporcionado ninguna imagen");
        }

        // Encuentra la microempresa
        const microempresa = await Microempresa.findById(req.body.microempresaId);
        if (!microempresa) {
            return respondError(req, res, 404, "Microempresa no encontrada");
        }

        // Limitar el número de imágenes
        if (microempresa.imagenes.length + req.files.length > 5) { // Límite de 5 imágenes
            return respondError(req, res, 400, "Has alcanzado el límite de imágenes permitidas");
        }

        const uploadedImages = [];

        for (const file of req.files) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    {
                        folder: "microempresas/imagenes",
                        resource_type: "image",
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    },
                );
                stream.end(file.buffer);
            });

            // Añadir cada imagen subida al array de imágenes
            uploadedImages.push({
                url: result.secure_url,
                public_id: result.public_id,
            });

            // Añadir la imagen a la microempresa
            microempresa.imagenes.push({
                url: result.secure_url,
                public_id: result.public_id,
            });
        }

        await microempresa.save();

        return respondSuccess(req, res, 200, {
            message: "Imágenes subidas con éxito",
            data: uploadedImages,
        });
    } catch (error) {
        console.error(error);
        return respondError(req, res, 500, "Error al subir las imágenes");
    }
}


/**
 * Maneja la eliminación de una imagen
 */
async function eliminarImagen(req, res) {
    try {
        console.log("Archivos recibidos:", req.files);
        console.log("Datos recibidos:", req.body);
        const { public_id, microempresaId } = req.body;

        // Validar que se haya proporcionado el public_id y microempresaId
        if (!public_id || !microempresaId) {
            return respondError(req, res, 400, "Falta el public_id o el microempresaId");
        }

        // Eliminar la imagen de Cloudinary
        const result = await cloudinary.uploader.destroy(public_id);
        if (result.result !== "ok") {
            return respondError(req, res, 500, "Error al eliminar la imagen de Cloudinary");
        }

        // Buscar la microempresa y eliminar la imagen del array de imágenes
        const microempresa = await Microempresa.findById(microempresaId);
        if (!microempresa) {
            return respondError(req, res, 404, "Microempresa no encontrada");
        }

        // Filtrar la imagen eliminada del array de imágenes
        microempresa.imagenes = microempresa.imagenes.filter(
            (img) => img.public_id !== public_id
        );

        // Guardar los cambios
        await microempresa.save();

        return respondSuccess(req, res, 200, "Imagen eliminada correctamente");
    } catch (error) {
        console.error(error);
        return respondError(req, res, 500, "Error al eliminar la imagen");
    }
}

export default {
    uploadFotoPerfil,
    uploadImagenes,
    eliminarImagen,
};
