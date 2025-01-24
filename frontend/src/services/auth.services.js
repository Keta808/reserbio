import axios from './root.services.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const decodeToken = (token) => {
  const payload = token.split('.')[1];
  return JSON.parse(atob(payload));
};

export const login = async (dataUser) => {
    try {
        console.log('Datos recibidos: ', dataUser);
        const response = await axios.post('/auth/login', {
            email: dataUser.email,
            password: dataUser.password,
        });

        const { status, data } = response;
        if (status === 200) {
            const { accessToken } = data.data;
            if (!accessToken) {
                throw new Error('Token no recibido o inválido');
            }

            const decodedToken = decodeToken(accessToken);

            const userInfo = {
                email: decodedToken.email,
                kind: decodedToken.kind,
                id: decodedToken.id,
            };

            await AsyncStorage.setItem('token', accessToken); // Guardar token
            await AsyncStorage.setItem('user', JSON.stringify(userInfo)); // Guardar datos del usuario

            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            return userInfo;
        }
    } catch (error) {
        console.log('Error en Login', error);
        throw error.response ? error.response.data : new Error('Error en Inicio de sesión');
    }
};
