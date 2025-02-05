import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { Agenda, LocaleConfig } from 'react-native-calendars';
import reservaService from '../services/reserva.service';

// Configurar idioma al español
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy',
};
LocaleConfig.defaultLocale = 'es';

const ReservationItem = ({ item }) => (
  <View style={styles.item}>
    <Text style={styles.itemText}>{item.name}</Text>
    <Text style={styles.itemTime}>Hora: {item.time}</Text>
    <Text style={styles.itemClient}>Cliente: {item.client}</Text>
    <Text style={styles.itemStatus}>Estado: {item.status}</Text>
  </View>
);

const TestScreen = () => {
  const [items, setItems] = useState({}); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReservations = async () => {  
      try {
        const workID = "66f317aed93617760be2bd14";
        const response = await reservaService.getReservasByTrabajadorId(workID);
        const reservations = response?.data || response; 

        if (!Array.isArray(reservations)) {
          console.error("Error: La respuesta de la API no es un array", response);
          return;
        }

        const newItems = {};
        reservations.forEach((reservation) => {
          if (!reservation.fecha || !reservation.servicio || !reservation.cliente) return;
          const date = reservation.fecha.split('T')[0];
          if (!newItems[date]) newItems[date] = [];
          newItems[date].push({
            id: reservation._id,
            name: reservation.servicio.nombre || "Sin nombre",
            time: new Date(reservation.fecha).toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" }),
            client: reservation.cliente.nombre || "Desconocido",
            status: reservation.estado || "Sin estado",
          });
        });
        setItems(newItems);
      } catch (error) {
        console.error("Error al cargar las reservas:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReservations();
  }, []);

  const renderItem = (item) => <ReservationItem item={item} />;

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando reservas...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Agenda
        items={items}
        renderItem={renderItem}
        selected={new Date().toISOString().split('T')[0]} // Fecha seleccionada inicial
        showClosingKnob={true}
        theme={{
          agendaKnobColor: '#000',
          selectedDayBackgroundColor: '#1E90FF',
          dotColor: '#1E90FF',
        }}
      
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    marginRight: 10,
    marginTop: 17,
  },
  itemText: { fontSize: 16, fontWeight: 'bold' },
  itemTime: { fontSize: 14, color: '#555' },
  itemClient: { fontSize: 14, color: '#888' },
  itemStatus: { fontSize: 14, color: '#888' },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TestScreen;
