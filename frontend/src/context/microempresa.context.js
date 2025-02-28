import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MicroempresaService from "../services/microempresa.service";

// Crear el contexto
export const MicroempresaContext = createContext();

// Hook para usar el contexto
export const useMicroempresa = () => useContext(MicroempresaContext);

// Proveedor del contexto
export const MicroempresaProvider = ({ children }) => {
    const [microempresa, setMicroempresa] = useState(null);

    const fetchMicroempresa = async (userId) => {
        try {
            if (!userId) return;
            const response = await MicroempresaService.getMicroempresasByUser(userId);
            if (Array.isArray(response.data) && response.data.length > 0) {
                setMicroempresa(response.data[0]); // Guardamos la microempresa en el contexto
            } else {
                setMicroempresa(null);
            }
        } catch (error) {
            console.error("❌ Error al obtener la microempresa:", error);
            setMicroempresa(null);
        }
    };

    return (
        <MicroempresaContext.Provider value={{ microempresa, fetchMicroempresa }}>
            {children}
        </MicroempresaContext.Provider>
    );
};
