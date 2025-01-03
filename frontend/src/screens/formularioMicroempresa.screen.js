import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Picker, ScrollView } from 'react-native';

const FormularioMicroempresa = ({ navigation }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    telefono: '',
    direccion: '',
    email: '',
    categoria: '',
  });

  const categorias = ['Tecnología', 'Alimentos', 'Ropa', 'Educación', 'Otros']; // Ejemplo de categorías

  const handleChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleNext = () => {
    navigation.navigate('SubirFoto', { formData });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Registrar Microempresa</Text>

      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={formData.nombre}
        onChangeText={(value) => handleChange('nombre', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Descripción"
        value={formData.descripcion}
        onChangeText={(value) => handleChange('descripcion', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={formData.telefono}
        onChangeText={(value) => handleChange('telefono', value)}
        keyboardType="phone-pad"
      />

      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={formData.direccion}
        onChangeText={(value) => handleChange('direccion', value)}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={formData.email}
        onChangeText={(value) => handleChange('email', value)}
        keyboardType="email-address"
      />

      <Picker
        selectedValue={formData.categoria}
        style={styles.input}
        onValueChange={(value) => handleChange('categoria', value)}
      >
        <Picker.Item label="Selecciona una categoría" value="" />
        {categorias.map((categoria, index) => (
          <Picker.Item key={index} label={categoria} value={categoria} />
        ))}
      </Picker>

      <TouchableOpacity style={styles.boton} onPress={handleNext}>
        <Text style={styles.textoBoton}>Siguiente</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  boton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FormularioMicroempresa;
