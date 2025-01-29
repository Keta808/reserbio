import React from 'react';
import { ScrollView, View, Image, Text } from 'react-native';

const TestScreen = () => {
  const images = [
    { id: 1, uri: 'https://via.placeholder.com/150', label: 'Imagen 1' },
    { id: 2, uri: 'https://via.placeholder.com/150', label: 'Imagen 2' },
    { id: 3, uri: 'https://via.placeholder.com/150', label: 'Imagen 3' },
  ];

  console.log('Images array:', images);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f3f4f6', padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Pantalla de Pruebas</Text>
      <View style={{ gap: 16 }}>
        {images.map((image) => {
          console.log('Rendering image:', image);
          let validSource;

          try {
            validSource = { uri: image.uri };
            if (!validSource.uri) throw new Error('Invalid URI');
          } catch (error) {
            console.error('Error rendering image:', error);
            validSource = null; // Si falla, no mostramos la imagen
          }

          return (
            <View
              key={image.id}
              style={{
                borderRadius: 16,
                backgroundColor: '#fff',
                shadowColor: '#000',
                shadowOpacity: 0.1,
                shadowRadius: 8,
                padding: 16,
              }}
            >
              {validSource ? (
                <Image
                  source={validSource}
                  style={{ width: '100%', height: 160, borderRadius: 8 }}
                  resizeMode="cover"
                />
              ) : (
                <Text style={{ textAlign: 'center', color: '#ff0000' }}>
                  Imagen no disponible
                </Text>
              )}
              <Text style={{ textAlign: 'center', marginTop: 8, color: '#4b5563' }}>
                {image.label}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default TestScreen;
