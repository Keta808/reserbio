import axios from './root.services.js'; 
import { jwtDecode } from 'jwt-decode'; 
import cookies from 'js-cookie'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (dataUser)=> {
    try { 
        //console.log('Datos recibidos: ', dataUser );
        const response = await axios.post('/auth/login', { email :  dataUser.email, password: dataUser.password });
        
        const {status, data} = response;
        if (status === 200) { 
            const { accessToken } = data.data;
            const decodedToken = jwtDecode(accessToken);

            const userInfo = { email: decodedToken.email , kind: decodedToken.kind, id: decodedToken.id };
            //console.log('Datos de usuario: ', userInfo);
            
            await AsyncStorage.setItem('user', JSON.stringify(userInfo)); // Guardar sin `{userInfo}`
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            //console.log('Usuario autenticado login service:', userInfo);
            return userInfo;
        }
    
    }catch(error){
        console.log("Error en Login", error);
        throw error.response ? error.response.data : new Error("Error en Inicio de sesion");
    }
};

export const logout = async () => {
    await AsyncStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
    cookies.remove('jwt'); 
    console.log('Cierre de sesión exitoso');
}; 
