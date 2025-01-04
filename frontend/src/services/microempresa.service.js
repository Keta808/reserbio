import instance from './root.services';

// Obetener microempresa por id
async function obtenerMicroempresa(id){
    try{
        const response = await instance.get(`/microempresas/${id}`);
        return response.data;
    }catch(error){
        console.error(`Error al obtener la microempresa con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
}

// Obtener todas las microempresas
async function obtenerMicroempresas(){
    try{
        const response = await instance.get('/microempresas/');
        return response.data;
    }catch(error){
        console.error('Error al obtener las microempresas:', error.response?.data || error.message);
        throw error;
    }
}

// Crear microempresa
async function crearMicroempresa(data){
    try{
        const response = await instance.post('/microempresas/', data);
        return response.data;
    }catch(error){
        console.error('Error al crear la microempresa:', error.response?.data || error.message);
        throw error;
    }
}

// Actualizar microempresa
async function actualizarMicroempresa(id, data){
    try{
        const response = await instance.put(`/microempresas/${id}`, data);
        return response.data;
    }catch(error){
        console.error(`Error al actualizar la microempresa con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
}

// Eliminar microempresa
async function eliminarMicroempresa(id){
    try{
        const response = await instance.delete(`/microempresas/${id}`);
        return response.data;
    }catch(error){
        console.error(`Error al eliminar la microempresa con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
}

// Obtener microempresas por categoria
async function obtenerMicroempresasPorCategoria(categoria) {
    try {
        const response = await instance.get(`/microempresa/categoria/${categoria}`);
        return response.data;
    } catch (error) {
        console.error(`Error al obtener las microempresas de la categoría ${categoria}:`, error.response?.data || error.message);
        throw error;
    }
}

// Obtener nombre de la microempresa (pendiente en backend)
async function obtenerNombreMicroempresa(id){
    try{
        const response = await instance.get(`/microempresas/nombre/${id}`);
        return response.data;
    }catch(error){
        console.error(`Error al obtener el nombre de la microempresa con ID ${id}:`, error.response?.data || error.message);
        throw error;
    }
}

export {
    obtenerMicroempresa,
    obtenerMicroempresas,
    crearMicroempresa,
    actualizarMicroempresa,
    eliminarMicroempresa,
    obtenerMicroempresasPorCategoria,
    obtenerNombreMicroempresa
};
