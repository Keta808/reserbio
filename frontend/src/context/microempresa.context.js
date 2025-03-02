import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth.context"; // Importamos el AuthContext
import MicroempresaService from "../services/microempresa.service";

// Crear el contexto
export const MicroempresaContext = createContext();

// Hook para usar el contexto
export const useMicroempresa = () => useContext(MicroempresaContext);

// Proveedor del contexto
export const MicroempresaProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth(); // Obtenemos el usuario autenticado
    const [microempresa, setMicroempresa] = useState(null);
    const [loading, setLoading] = useState(false);

    // Función para obtener la microempresa del usuario
    const fetchMicroempresa = async () => {
        setLoading(true);
        if (!user || !isAuthenticated) {
            setMicroempresa(null); // Si no hay usuario, limpiar estado
            setLoading(false);
            return;
        }

        // 📌 **Solo cargar microempresa si el usuario es Trabajador o Admin**
        if (user.kind !== "Trabajador") {
            console.log("ℹ️ Usuario es Cliente, no se buscarán microempresas.");
            setMicroempresa(null);
            return;
        }
        
        try {
            const response = await MicroempresaService.getMicroempresasByUser(user.id);
            if (Array.isArray(response.data) && response.data.length > 0) {
                setMicroempresa(response.data[0]); // Guardamos la microempresa en el contexto
            } else {
                setMicroempresa(null);
            }
        } catch (error) {
            console.error("❌ Error al obtener la microempresa:", error);
            setMicroempresa(null);
        }
        setLoading(false);
    };

    // Ejecutar automáticamente cada vez que cambia el usuario autenticado
    useEffect(() => {
        fetchMicroempresa();
    }, [user, isAuthenticated]);

    return (
        <MicroempresaContext.Provider value={{ microempresa, loading, fetchMicroempresa }}>
            {children}
        </MicroempresaContext.Provider>
    );
};
