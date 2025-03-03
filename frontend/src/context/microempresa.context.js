import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./auth.context";
import MicroempresaService from "../services/microempresa.service";
import enlaceService from "../services/enlace.service";

export const MicroempresaContext = createContext();

export const useMicroempresa = () => useContext(MicroempresaContext);

export const MicroempresaProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [microempresa, setMicroempresa] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchMicroempresa = async () => {
    setLoading(true);
  
    if (!user || !isAuthenticated) {
      setMicroempresa(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
  
    if (user.kind !== "Trabajador") {
      console.log("ℹ️ Usuario es Cliente, no se buscarán microempresas.");
      setMicroempresa(null);
      setIsAdmin(false);
      setLoading(false);
      return;
    }
  
    try {
      if (user.isAdmin) {
        // Para trabajadores admin, usamos el endpoint tradicional
        try {
          const response = await MicroempresaService.getMicroempresasByUser(user.id);
          if (Array.isArray(response.data) && response.data.length > 0) {
            setMicroempresa(response.data[0]);
          } else {
            setMicroempresa(null);
          }
        } catch (error) {
          console.error("Error obteniendo microempresa para admin:", error.message);
          setMicroempresa(null);
        }
        setIsAdmin(true);
      } else {
        // Para trabajadores no admin, usamos el servicio de enlaces
        const result = await enlaceService.obtenerEnlacesPorTrabajador(user.id);
        const microEmpData = result.data || result;
        if (Array.isArray(microEmpData) && microEmpData.length > 0) {
          // Tomamos directamente el primer objeto devuelto, que se espera contenga la microempresa.
          setMicroempresa(microEmpData[0]);
        } else {
          setMicroempresa(null);
        }
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("❌ Error al obtener la microempresa:", error);
      setMicroempresa(null);
      setIsAdmin(false);
    }
    setLoading(false);
  };
  
  

  useEffect(() => {
    // Dependencia basada en user.id para evitar re-ejecuciones innecesarias
    if (user?.id) {
      console.log("Usuario recibido en MicroempresaContext:", user);
      fetchMicroempresa();
    }
  }, [user?.id, isAuthenticated]);

  return (
    <MicroempresaContext.Provider value={{ microempresa, isAdmin, loading, fetchMicroempresa }}>
      {children}
    </MicroempresaContext.Provider>
  );
};

export default MicroempresaProvider;
