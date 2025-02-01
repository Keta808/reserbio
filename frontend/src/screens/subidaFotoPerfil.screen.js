import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import MicroempresaService from "../services/microempresa.service";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image"; // ✅ Usar expo-image para mostrar imágenes

export default function SubirFotoPerfilScreen({ route, navigation }) {
    const { id, modo = "crear" } = route.params || {};
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    console.log("🚀 ID de la microempresa:", id);

    // ✅ FUNCIÓN PARA SELECCIONAR IMAGEN DESDE LA GALERÍA
    const handlePickImage = async () => {
        try {
            // 1️⃣ Pedir permisos antes de abrir la galería
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "Se necesita acceso a la galería para seleccionar una imagen.");
                return;
            }

            // 2️⃣ Abrir la galería para seleccionar una imagen
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 4],
                quality: 1,
            });

            // 3️⃣ Validar si el usuario canceló
            if (result.canceled) {
                console.log("⚠️ Selección de imagen cancelada");
                return;
            }

            console.log("📸 Imagen seleccionada:", result.assets[0].uri);
            setImage(result.assets[0].uri);

        } catch (error) {
            console.error("❌ Error al seleccionar imagen:", error.message);
            Alert.alert("Error", "No se pudo seleccionar la imagen.");
        }
    };

    // ✅ FUNCIÓN PARA SUBIR LA IMAGEN AL BACKEND
    const handleUploadImage = async () => {
        if (!image) {
            Alert.alert("Aviso", "Por favor selecciona una imagen antes de subirla.");
            return;
        }
        if (!id) {
            console.error("⚠️ Error: No se recibió el ID de la microempresa.");
            Alert.alert("Error", "No se pudo obtener el ID de la microempresa.");
            return;
        }
        
        setLoading(true);
        try {
            console.log("📤 Subiendo imagen a la microempresa:", id);
            const response = await MicroempresaService.uploadFotoPerfil(id, image);
            
            if (response) {
                Alert.alert("Éxito", "Foto de perfil subida correctamente.", [
                    { text: "OK", onPress: () => navigation.replace("Microempresa", { id }) }
                ]);
            }
        } catch (error) {
            console.error("❌ Error al subir la imagen:", error);
            Alert.alert("Error", "Hubo un problema al subir la imagen.");
        } finally {
            setLoading(false);
        }
    };

    // ✅ FUNCIÓN PARA OMITIR LA SUBIDA Y PASAR A LA SIGUIENTE PANTALLA
    const handleSkip = () => {
        navigation.replace("Microempresa", { id });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{modo === "crear" ? "Subir" : "Editar"} Foto de Perfil</Text>
            
            {image ? (
                <Image source={{ uri: image }} style={styles.image} />
            ) : (
                <Text style={styles.placeholder}>No hay imagen seleccionada</Text>
            )}
            
            <Button title="Seleccionar Imagen" onPress={handlePickImage} />
            <Button title="Subir Imagen" onPress={handleUploadImage} disabled={loading} />
            <Button title="Omitir" onPress={handleSkip} color="gray" />
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
    image: {
        width: 200,
        height: 200,
        borderRadius: 100,
        marginBottom: 20,
    },
    placeholder: {
        fontSize: 16,
        color: "gray",
        marginBottom: 20,
    },
});



