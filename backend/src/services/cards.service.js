/* eslint-disable no-console */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable keyword-spacing */
/* eslint-disable quotes */
import axios from "axios";  
import { handleError } from "../utils/errorHandler.js"; 
import Card from "../models/card.model.js"; 

import { ACCESS_TOKEN } from '../config/configEnv.js';

// Funciones BD
async function createCard(data) {
    try {
        const { userId, customerId, cardTokenId, lastFourDigits, paymenthMethod, expirationDate } = data;
        const newCard = new Card({ userId, customerId, cardTokenId, lastFourDigits, paymenthMethod, expirationDate });
        await newCard.save();
        return [newCard, null];
    } catch (error) {
        handleError(error, "cards.service -> createCard");
        console.log(error);
    }
} 
async function getCardByCustomerId(customerId) { 
    try { 
        if (!customerId) return [null, "El customerId es requerido"];
        const card = await Card.findOne({ customerId }).exec();
        if (!card) return [null, "No se encontró la tarjeta"];
        return [card, null];     
    } catch (error) {
            handleError(error, "cards.service -> getCardByCustomerId");
            console.log(error); 
        }
} 
async function getCardById(id) {
    try {
        if (!id) return [null, "El ID de tarjeta es requerido"];
        const card = await Card.findById(id).exec();
        if (!card) return [null, "No se encontró la tarjeta"];
        return [card, null];
    } catch (error) {
        handleError(error, "cards.service -> getCardById");
        console.log(error);
    } 
} 
async function getCardByCardTokenId(cardTokenId) {
    try {
        if (!cardTokenId) return [null, "El cardTokenId es requerido"];
        const card = await Card
            .findOne({ cardTokenId })
            .exec(); 
        if (!card) return [null, "No se encontró la tarjeta"];
        return [card, null];
    } catch (error) {
        handleError(error, "cards.service -> getCardByCardTokenId");
        console.log(error);
    }
} 
async function getCards() {
    try {
        const cards = await Card.find().exec();
        if (!cards || cards.length === 0) return [null, "No hay tarjetas"];
        return [cards, null];
    } catch (error) {
        handleError(error, "cards.service -> getCards");
        console.log(error);
    }
}
async function getCardByUserId(userId) {
    try {
        if (!userId) return [null, "El userId es requerido"];
        const card = await Card
            .findOne({ userId })
            .exec();
        if (!card) return [null, "No se encontró la tarjeta"];
        return [card, null];
    } catch (error) {
        handleError(error, "cards.service -> getCardByUserId");
        console.log(error);
    }
} 
async function updateCardByUserId(userId, data) { 
    try {
        if (!userId) return [null, "El userId es requerido"]; 
        const existingCard = await Card.findOne({ userId }).exec();    
        if (!existingCard) return [null, "No se encontró la tarjeta"];
        const { customerId, cardTokenId, lastFourDigits, paymenthMethod, expirationDate } = data; 
        const updatedCard = await Card.findOneAndUpdate({ userId }, { customerId, cardTokenId, lastFourDigits, paymenthMethod, expirationDate }, { new: true }).exec();
        return [updatedCard, null];
    } catch (error) {
        handleError(error, "cards.service -> updateCardByUserId");
        console.log(error);
    } 
}
async function updateCard(id, data) {
    try {
        if (!id) return [null, "El cardId es requerido"]; 
        const existingCard = await Card.findById(id).exec();    
        if (!existingCard) return [null, "No se encontró la tarjeta"];
        const { userId, customerId, cardTokenId, lastFourDigits, paymenthMethod, expirationDate } = data; 
        const updatedCard = await Card.findByIdAndUpdate(id, { userId, customerId, cardTokenId, lastFourDigits, paymenthMethod, expirationDate }, { new: true }).exec();
        return [updatedCard, null];
    } catch (error) {
        handleError(error, "cards.service -> updateCard");
        console.log(error);
    } 
}
async function deleteCard(id) { 
    try {
        if (!id) return [null, "El cardId es requerido"];    
         
        const card = await Card.findOneAndDelete(id).exec();
        if (!card) return [null, "No se encontró la tarjeta"]; 
        return [card, null];
    } catch (error) {
        handleError(error, "cards.service -> deleteCard");
        console.log(error);
    }
}
async function deleteCardByUserId(userId) {
    try {
        if (!userId) return [null, "El userId es requerido"];
        const card = await Card.findOneAndDelete({ userId }).exec();
        if (!card) return [null, "No se encontró la tarjeta"];
        return [card, null];    
    } catch (error) {
        handleError(error, "cards.service -> deleteCardByUserId");
        console.log(error);
    }
}
// Funciones Mercado Pago 
// Funcion para guardar Tajeta de credito de cliente (id)  
async function createCardMP(customerId, cardTokenId, user) { 
    try {  
        const response = await axios.post(`https://api.mercadopago.com/v1/customers/${customerId}/cards`, { 
            token: cardTokenId,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
              },
        });
        const card = response.data;  
        console.log(card); 
        const [newCard, error] = await createCard({ userId: user._id, customerId, cardTokenId, lastFourDigits: card.last_four_digits, paymenthMethod: card.payment_method, expirationDate: `${card.expiration_month}/${card.expiration_year}` }); 
        if (error) {
            return [null, error];
        }
        return [newCard, null];
    } catch (error) {
        handleError(error, "cards.service -> createCardMP");
        console.log(error);
    }
}
// Funcion para obtener Tarjeta de credito cliente 
async function getCardByIdMP(customerId) { 
    try {
        const response = await axios.get(`https://api.mercadopago.com/v1/customers/${customerId}/cards`, { 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
              },
        });
        const card = response.data;  
        console.log(card); 
        return [card, null];
    } catch (error) {
        handleError(error, "cards.service -> getCardByIdMP");
        console.log(error);
    }
}
// Obtener tarjeta por cliente  
async function getCardByClient(customerId, cardId) { 
    try {
        const response = await axios.get(`https://api.mercadopago.com/v1/customers/${customerId}/cards/${cardId}`, { 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
              },
        });
        const card = response.data;  
        console.log(card); 
        return [card, null];
    } catch (error) {
        handleError(error, "cards.service -> getCardByClient");
        console.log(error);
    }
} 
async function updateCardMP(customerId, cardTokenId, data, user) { 
    try {
        const response = await axios.put(`https://api.mercadopago.com/v1/customers/${customerId}/cards/${cardTokenId}`, { 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
              },
        });
        const card = response.data;  
        console.log(card);
        const updatedCard = await updateCardByUserId(user._id, data);  
        return [updatedCard, null];
    } catch (error) {
        handleError(error, "cards.service -> updateCardMP");
        console.log(error);
    }
}
// Eliminar tarjeta de credito de cliente  
async function deleteCardMP(customerId, cardTokenId) {
    try {
        const response = await axios.delete(`https://api.mercadopago.com/v1/customers/${customerId}/cards/${cardTokenId}`, { 
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
              },
        });
        const card = response.data;  
        console.log(card); 
        const deletedCard = await deleteCardByUserId(user._id);
        return [deletedCard, null];
    } catch (error) {
        handleError(error, "cards.service -> deleteCardMP");
        console.log(error);
    }
} 
 

export default { createCardMP, getCardByIdMP, getCardByClient, updateCardMP, deleteCardMP, 
createCard, getCardByCustomerId, getCardById, getCardByCardTokenId, getCards, 
getCardByUserId, updateCardByUserId, updateCard, deleteCard, deleteCardByUserId, 
};
