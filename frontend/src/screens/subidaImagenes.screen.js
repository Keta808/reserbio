import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  FlatList, 
  TouchableOpacity 
} from "react-native";
import MicroempresaService from "../services/microempresa.service";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useTheme } from "../context/theme.context";

export default function SubirImagenesScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { id } = route.params || {};
  const [imagenes, setImagenes] = useState([]);
  const [loading, setLoading] = useState(false);

  console.log("🚀 ID de la microempresa:", id);

  const handlePickImages = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se necesita acceso a la galería para seleccionar imágenes.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 5,
        quality: 1,
      });

      if (result.canceled) {
        console.log("⚠️ Selección de imágenes cancelada");
        return;
      }

      // Evitar que se seleccionen más de 5 imágenes
      const nuevasImagenes = result.assets.slice(0, 5 - imagenes.length);
      setImagenes([...imagenes, ...nuevasImagenes]);

      console.log("📸 Imágenes seleccionadas:", nuevasImagenes.map(img => img.uri));
    } catch (error) {
      console.error("❌ Error al seleccionar imágenes:", error.message);
      Alert.alert("Error", "No se pudieron seleccionar imágenes.");
    }
  };

  const handleUploadImages = async () => {
    if (!imagenes.length) {
      Alert.alert("Aviso", "Por favor selecciona al menos una imagen.");
      return;
    }
  
    console.log("🚀 ID de la microempresa:", id);
  
    const formData = new FormData();
    imagenes.forEach((imagen, index) => {
      const imageObject = {
        uri: imagen.uri,
        type: "image/jpeg",
        name: `imagen_${index}.jpg`,
      };
  
      console.log("📸 Imagen añadida a FormData:", imageObject);
      formData.append("imagenes", imageObject);
    });
  
    formData.append("microempresaId", id);
    console.log("📤 FormData final antes de enviar:", formData);
  
    try {
      const response = await MicroempresaService.uploadImagenes(formData);
      console.log("✅ Respuesta del backend:", response);
      Alert.alert("Éxito", "Imágenes subidas correctamente.", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          }
        }
      ]);
    } catch (error) {
      console.error("❌ Error al subir imágenes:", error);
      Alert.alert("Error", "No se pudieron subir las imágenes.");
    }
  };
  
  const handleRemoveImage = (index) => {
    const nuevasImagenes = [...imagenes];
    nuevasImagenes.splice(index, 1);
    setImagenes(nuevasImagenes);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Subir Imágenes</Text>
      
      {imagenes.length > 0 ? (
        <FlatList
          data={imagenes}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.imageContainer}>
              <Image source={{ uri: item.uri }} style={styles.image} />
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemoveImage(index)}>
                <Text style={styles.deleteButtonText}>✖</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text style={[styles.placeholder, { color: theme.text }]}>No hay imágenes seleccionadas</Text>
      )}

      <TouchableOpacity style={styles.button} onPress={handlePickImages}>
        <Text style={styles.buttonText}>Seleccionar Imágenes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleUploadImages} disabled={loading}>
        <Text style={styles.buttonText}>Subir Imágenes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  deleteButton: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 10,
    padding: 5,
  },
  deleteButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  placeholder: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
  },
  buttonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "gray",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});





