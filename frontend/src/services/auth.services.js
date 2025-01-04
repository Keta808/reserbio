import axios from './root.services.js'; 



import cookies from 'js-cookie'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export const login = async (dataUser)=> {
    try { 
        console.log('Datos recibidos: ', dataUser );
        const response = await axios.post('/auth/login', { email :  dataUser.email, password: dataUser.password });
        
        const {status, data} = response;
        if (status === 200) { 
            const { accessToken, user } = data.data;
            await AsyncStorage.setItem('user', JSON.stringify(user)); 
            axios.defaults.headers.common[
                'Authorization'
              ] = `Bearer ${accessToken}`;
            return user;
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
