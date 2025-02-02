import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert, FlatList, TouchableOpacity } from "react-native";
import MicroempresaService from "../services/microempresa.service";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

export default function SubirImagenesScreen({ route, navigation }) {
    const { id } = route.params || {};
    const [imagenes, setImagenes] = useState([]);
    const [loading, setLoading] = useState(false);

    console.log("🚀 ID de la microempresa:", id);

    // ✅ FUNCIÓN PARA SELECCIONAR VARIAS IMÁGENES DESDE LA GALERÍA
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

    // ✅ FUNCIÓN PARA SUBIR LAS IMÁGENES AL BACKEND
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
                    // Navega de regreso a la pantalla de microempresa
                    navigation.navigate("Microempresa", { id });
                  }
                }
              ]);
        } catch (error) {
            console.error("❌ Error al subir imágenes:", error);
            Alert.alert("Error", "No se pudieron subir las imágenes.");
        }
    };
    

    // ✅ FUNCIÓN PARA ELIMINAR UNA IMAGEN SELECCIONADA
    const handleRemoveImage = (index) => {
        const nuevasImagenes = [...imagenes];
        nuevasImagenes.splice(index, 1);
        setImagenes(nuevasImagenes);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Subir Imágenes</Text>
            
            {/* 📂 Galería de imágenes seleccionadas */}
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
                <Text style={styles.placeholder}>No hay imágenes seleccionadas</Text>
            )}

            <Button title="Seleccionar Imágenes" onPress={handlePickImages} />
            <Button title="Subir Imágenes" onPress={handleUploadImages} disabled={loading} />
            <Button title="Cancelar" onPress={() => navigation.goBack()} color="gray" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#fff",
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
        color: "gray",
        marginBottom: 20,
    },
});


