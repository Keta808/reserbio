import instance from './root.services.js';

async function getMicroempresaData(idMicroempresa) {
  try {
    const response = await instance.get(`/microempresas/${idMicroempresa}`);
    console.log('📋 Datos de la microempresa obtenidos:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener los datos de la microempresa:', error.response?.data || error.message);
    throw error;
  }
}

async function getMicroempresasByUser(trabajadorId){
  try {
    const response = await instance.get('/microempresas/user/${trabajadorId}');
    console.log('📡 Microempresas obtenidas:', response);
    return response.data;
  } catch (error) {
    console.error(
      'Error al obtener datos de la microempresa:',
      error.response?.data || error.message
    );
    throw error;
  }
}

export default {
  getMicroempresaData,
  getMicroempresasByUser,
};
