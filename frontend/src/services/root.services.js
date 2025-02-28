import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:3000/api/'; 
// const API_URL = 'http://192.168.1.10:3000/api/';
// const API_URL = 'http://localhost:3000/api/'; 
// const API_URL = 'http://192.168.1.9:3000/api/';
// const API_URL = 'http://192.168.18.65:3000/api/';
// URL SERVER:
// const API_URL = 'https://backendtesis-eyge.onrender.com/api';
// const API_URL = 'http://localhost:3000/api/';
// const API_URL = 'https://backendtesis-eyge.onrender.com/api/'; 

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token en cada solicitud
instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
