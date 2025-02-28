import instance from "./root.services";
import moment from "moment";

async function getReservasByTrabajadorId(trabajadorId) {
    try {
      const response = await instance.get(`/reservas/trabajador/${trabajadorId}`);
      const backendData = response.data; // Se asume que es un array de arrays
      console.log("Datos del backend:", backendData);
  
      // Transformamos la data al formato que requiere Agenda.
      const agendaData = {};
  
      backendData.forEach(innerArray => {
        // Suponemos que cada innerArray contiene al menos una reserva.
        const reserva = innerArray[0];
  
        // Convertimos "hora_inicio" a un objeto Date y luego a una cadena ISO
        const startDate = new Date(reserva.hora_inicio);
        const isoStart = startDate.toISOString();
        
        // Ahora formateamos la fecha a "YYYY-MM-DD" usando Moment, asegurando un input ISO
        const dateKey = moment(isoStart).format('YYYY-MM-DD');
  
        if (!agendaData[dateKey]) {
          agendaData[dateKey] = [];
        }
  
        // Calculamos la hora de fin sumándole la duración (en minutos) a la hora de inicio.
        const endDate = new Date(startDate.getTime() + reserva.duracion * 60000);
  
        // Agregamos el evento con toda la información requerida.
        agendaData[dateKey].push({
          id: reserva.id,
          name: `${reserva.servicio.nombre} - ${reserva.cliente.nombre}`,
          start: startDate,
          end: endDate,
          servicioNombre: reserva.servicio.nombre,
          clienteNombre: reserva.cliente.nombre,
        });
      });
  
      console.log("Data transformada para Agenda:", agendaData);
      return agendaData;
    } catch (error) {
      console.error(
        "Error al obtener las reservas del trabajador:",
        error.response?.data || error.message
      );
      throw error;
    }
  }

//eliminar una reserva 

async function deleteReserva(id) {
    try {
        const response = await instance.delete(`/reservas/${id}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al eliminar la reserva:",
        error.response?.data || error.message
        );
        throw error;
    }
}



//cancelar una reserva

async function cancelReserva(id) {
    try {
        const response = await instance.put(`/reservas/cancelar/${id}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al cancelar la reserva:",
        error.response?.data || error.message
        );
        throw error;
    }
}

//get reservas by cliente id

async function getReservasByCliente(clienteId) {
    try {
        const response = await instance.get(`/reservas/cliente/${clienteId}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al obtener las reservas del cliente:",
        error.response?.data || error.message
        );
        throw error;
    }
}

// Obtiene las reservas activas para un trabajador en una fecha determinada.

async function getReservasPorFechaTrabajador(workerId, date) {
    try {
    
        const response = await instance.get(`/reservas/horas/trabajador/${workerId}/${date}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al obtener las reservas del trabajador en la fecha:",
        error.response?.data || error.message
        );
        throw error;
    }
}

//Obtiene las reservas activas para un trabajador en una fecha determinada.

async function getReservasPorFechaMicroempresa(serviceId, date) {
    try {
        console.log("DATOS QUE LLEGAN A LA FUNCION DE MICROEMPRESA");
        console.log(serviceId, date);
        const response = await instance.get(`/reservas/horas/microempresa/${serviceId}/${date}`);
        return response.data;
    } catch (error) {
        console.error(
        "Error al obtener las reservas de la microempresa en la fecha:",
        error.response?.data || error.message
        );
        throw error;
    }
}


// crear una reserva /crear-reserva-horario

async function createReservaHorario(data) {
    try {
        const response = await instance.post("/reservas/crear-reserva-horario", data);
        return response.data;
    } catch (error) {
        console.error(
        "Error al crear la reserva:",
        error.response?.data || error.message
        );
        throw error;
    }
}


export default {
    getReservasByTrabajadorId,
    deleteReserva,
    cancelReserva,
    getReservasByCliente,
    getReservasPorFechaTrabajador,
    getReservasPorFechaMicroempresa,
    createReservaHorario
};
