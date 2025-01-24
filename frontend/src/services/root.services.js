

import axios from 'axios';

const API_URL = 'http://10.0.2.2:3000/api';
// const API_URL = 'http://localhost:3000/api/';

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // withCredentials: true,
});

export default instance;

