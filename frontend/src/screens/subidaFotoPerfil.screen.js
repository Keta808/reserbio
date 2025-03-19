import React, { useState } from "react";
import { 
    View, 
    Text, 
    StyleSheet, 
    Alert, 
    TouchableOpacity 
} from "react-native";
import MicroempresaService from "../services/microempresa.service";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { useTheme } from "../context/theme.context";

export default function SubirFotoPerfilScreen({ route, navigation }) {
    const { theme } = useTheme();
    const { id, modo = "crear" } = route.params || {};
    const [image, setImage] = useState(null);
    const [loading, setLoading] = useState(false);

    console.log("🚀 ID de la microempresa:", id);

    const handlePickImage = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== "granted") {
                Alert.alert("Permiso denegado", "Se necesita acceso a la galería para seleccionar una imagen.");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 4],
                quality: 1,
            });

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
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
        } catch (error) {
            console.error("❌ Error al subir la imagen:", error);
            Alert.alert("Error", "Hubo un problema al subir la imagen.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>  
            <Text style={[styles.title, { color: theme.text }]}>
                {modo === "crear" ? "Subir" : "Editar"} Foto de Perfil
            </Text>
            
            {image ? (
                <Image source={{ uri: image }} style={styles.image} />
            ) : (
                <Text style={[styles.placeholder, { color: theme.text }]}>No hay imagen seleccionada</Text>
            )}
            
            <TouchableOpacity style={styles.button} onPress={handlePickImage}>
                <Text style={styles.buttonText}>Seleccionar Imagen</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                style={[styles.button, loading && styles.buttonDisabled]} 
                onPress={handleUploadImage} 
                disabled={loading}
            >
                <Text style={styles.buttonText}>Subir Imagen</Text>
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
    image: {
        width: 150,
        height: 150,
        borderRadius: 75,
        marginBottom: 20,
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




