import React, { useState } from 'react';
import { View, Text } from 'react-native';
import CalendarStrip from 'react-native-calendar-strip';
import moment from 'moment';
import 'moment/locale/es';

moment.locale('es');

const MinimalCalendarStrip = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <View style={{ flex: 1, paddingTop: 50, backgroundColor: '#fff' }}>
      <Text style={{ textAlign: 'center', marginBottom: 10 }}>Prueba de CalendarStrip</Text>
      <CalendarStrip
        selectedDate={selectedDate}
        onDateSelected={(date) => {
          console.log("Fecha seleccionada:", date.format("YYYY-MM-DD"));
          setSelectedDate(date.toDate());
        }}
        style={{ height: 150 }}
      />
    </View>
  );
};

export default MinimalCalendarStrip;