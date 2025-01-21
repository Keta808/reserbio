/* eslint-disable max-len */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
import { respondSuccess, respondError } from "../utils/resHandler.js";
import cardsService from "../services/cards.service.js"; 
import { handleError } from "../utils/errorHandler.js";
import { cardBodySchema, cardIdSchema } from "../schema/card.schema.js"; 

async function createCard(req, res) {
    try {
        // Validar el cuerpo de la petición
        const { error } = cardBodySchema.validate(req.body);
        if (error) return respondError( req, res, 400, error.message);

        // Crear la tarjeta
        const [card, errorCard] = await cardsService.createCard(req.body);
        if (errorCard) return respondError(req, res, 400, errorCard);

        respondSuccess(req, res, 201, card);
    } catch (error) {
        handleError(error, "cards.controller -> createCard");
        respondError(req, res, 400, error.message);
    }
} 
async function getCardByCustomerId(req, res) {
    try {
        const { error } = cardIdSchema.validate(req.params);
        if (error) return respondError(res, 400, error.message);
        const [card, serviceError] = await cardsService.getCardByCustomerId(req.params.id);
        if (serviceError) return respondError(res, 404, serviceError);

        respondSuccess(res, 200, card);
    } catch (error) {
        handleError(error, "cards.controller -> getCardByCustomerId");
        respondError(res, 400, error.message);
    }
} 
async function getCardById(req, res) {
    try {
        const { error } = cardIdSchema.validate(req.params); 
        if (error) return respondError(res, 400, error.message);
        const [card, serviceError] = await cardsService.getCardById(req.params.id);
        if (serviceError) return respondError(res, 404, serviceError);

        respondSuccess(res, 200, card);
    } catch (error) {
        handleError(error, "cards.controller -> getCardById");
        respondError(res, 400, error.message);
    }
}
async function getCardByCardTokenId(req, res) {
    try {
        const { error } = cardIdSchema.validate(req.params);
        if (error) return respondError(res, 400, error.message);
        const [card, serviceError] = await cardsService.getCardByCardTokenId(req.params.id);
        if (serviceError) return respondError(res, 404, serviceError);

        respondSuccess(res, 200, card);
    } catch (error) {
        handleError(error, "cards.controller -> getCardByCardTokenId");
        respondError(res, 400, error.message);
    }
} 
async function getCards(req, res) {
    try {
        const [cards, error] = await cardsService.getCards();
        if (error) return respondError(res, 404, error);

        cards.length === 0
            ? respondSuccess(res, 204)
            : respondSuccess(res, 200, cards);
    } catch (error) {
        handleError(error, "cards.controller -> getCards");
        respondError(res, 400, error.message);
    }
} 
async function getCardByUserId(req, res) {
    try {
        const { error } = cardIdSchema.validate(req.params);
        if (error) return respondError(res, 400, error.message);
        const [card, serviceError] = await cardsService.getCardByUserId(req.params.id);
        if (serviceError) return respondError(res, 404, serviceError);

        respondSuccess(res, 200, card);
    } catch (error) {
        handleError(error, "cards.controller -> getCardByUserId");
        respondError(res, 400, error.message);
    }
} 
async function updateCardByUserId(req, res) {
    try {
        const { error } = cardIdSchema.validate(req.params);
        if (error) return respondError(res, 400, error.message);
        const { error: errorBody } = cardBodySchema.validate(req.body);
        if (errorBody) return respondError(res, 400, errorBody.message);
        const [updatedCard, serviceError] = await cardsService.updateCardByUserId(req.params.id, req.body);
        if (serviceError) return respondError(res, 400, serviceError);
        respondSuccess(res, 200, updatedCard);
    } catch (error) {
        handleError(error, "cards.controller -> updateCardByUserId");
        respondError(res, 400, error.message);
    }
}
async function updateCard(req, res) {
    try {
        const { error } = cardIdSchema.validate(req.params);
        if (error) return respondError(res, 400, error.message);
        const { error: errorBody } = cardBodySchema.validate(req.body);
        if (errorBody) return respondError(res, 400, errorBody.message);
        const [updatedCard, serviceError] = await cardsService.updateCard(req.params.id, req.body);
        if (serviceError) return respondError(res, 400, serviceError);
        respondSuccess(res, 200, updatedCard);
    } catch (error) {
        handleError(error, "cards.controller -> updateCard");
        respondError(res, 400, error.message);
    }
}

async function deleteCard(req, res) {
    try {
        const { error } = cardIdSchema.validate(req.params);
        if (error) return respondError(res, 400, error.message);
        const [card, serviceError] = await cardsService.deleteCard(req.params.id);
        if (serviceError) return respondError(res, 400, serviceError);

        respondSuccess(res, 200, card);
    } catch (error) {
        handleError(error, "cards.controller -> deleteCard");
        respondError(res, 400, error.message);
    }
}
async function deleteCardByUserId(req, res) {
    try {
        const { error } = cardIdSchema.validate(req.params);
        if (error) return respondError(res, 400, error.message);
        const [card, serviceError] = await cardsService.deleteCardByUserId(req.params.id);
        if (serviceError) return respondError(res, 400, serviceError);

        respondSuccess(res, 200, card);
    } catch (error) {
        handleError(error, "cards.controller -> deleteCardByUserId");
        respondError(res, 400, error.message);
    }
}

// Controladores de tarjetas MP
async function createCardMP(req, res) {
    const { customerId } = req.params; 
    
    const { cardTokenId, user } = req.body;
    const { error } = cardBodySchema.validate(req.body); 
    if (error) {
        return respondError(res, 400, "Datos inválidos", error.details);
    }
    try {
       const [newCard, serviceError] = await cardsService.createCardMP(customerId, cardTokenId, user);
       if (serviceError) {
        return respondError(res, 500, "Error al guardar la tarjeta", serviceError);
        }

        return respondSuccess( res, 201, { card: newCard });
    } catch (error) {
        handleError(error, "cards.controller -> createCardMP");
        return respondError( res, 400, error.message);
    }
} 
async function getCardByIdMP(req, res) {
    const { customerId } = req.params; 
    const { error } = cardIdSchema.validate(req.params);
    if (error) {
        return respondError(res, 400, "Datos inválidos", error.details);
    }
    try {
        const [card, error] = await cardsService.getCardByIdMP(customerId);
        if (error) return respondError( res, 400, error);

        return respondSuccess( res, 200, card);
    } catch (error) {
        handleError(error, "cards.controller -> getCardByIdMP");
        return respondError( res, 400, error.message);
    }
} 
async function getCardByClient(req, res) { 
    const { customerId, cardId } = req.params;
    try {
        const [card, error] = await cardsService.getCardByClient(customerId, cardId);
        if (error) return respondError( res, 400, error);

        return respondSuccess( res, 200, card);
    } catch (error) {
        handleError(error, "cards.controller -> getCardByClient");
        return respondError(res, 400, error.message);
    }
} 
async function deleteCardMP(req, res) { 
    const { customerId, cardTokenId } = req.params;
    try {
        const [card, error] = await cardsService.deleteCardMP(customerId, cardTokenId);
        if (error) return respondError( res, 400, error);

        return respondSuccess( res, 200, card);
    } catch (error) {
        handleError(error, "cards.controller -> deleteCard");
        return respondError( res, 400, error.message);
    }
} 
async function updateCardMP(req, res) { 
    const { customerId, cardTokenId } = req.params; // Obtener customerId y cardTokenId de los parámetros de la URL
    const { data, user } = req.body; 
    const { error } = cardBodySchema.validate(req.body);
    if (error) {
        return respondError( res, 400, "Datos inválidos", error.details);
    }
    try {
        const [card, error] = await cardsService.updateCardMP( customerId, cardTokenId, data, user);
        if (error) return respondError( res, 400, error);

        return respondSuccess( res, 200, card);
    } catch (error) {
        handleError(error, "cards.controller -> updateCardMP");
        return respondError( res, 400, error.message);
    }
}
export default { createCardMP, getCardByIdMP, getCardByClient, updateCardMP, deleteCardMP, createCard, getCardById, getCardByCustomerId, getCardByCardTokenId, getCards, getCardByUserId, updateCardByUserId, updateCard, deleteCard, deleteCardByUserId };
