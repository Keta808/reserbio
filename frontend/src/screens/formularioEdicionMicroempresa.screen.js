import React, { useState, useEffect, useRef } from "react";
import { 
    View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity 
} from "react-native";
import { Image } from "expo-image"; 
import MicroempresaService from "../services/microempresa.service.js";
import ActionSheet from "react-native-actions-sheet";

const CATEGORIAS = [
    "Barberia", "Peluqueria", "Estetica", "Masajes", "Manicure",
    "Pedicure", "Depilacion", "Tatuajes", "Piercing", "Clases particulares", "Consultoria"
];

const EditarMicroempresaScreen = ({ route, navigation }) => {
    const { id, userId, modo } = route.params || {};
    console.log("📝 ID recibido en edición:", id);
    console.log("🔄 User ID recibido:", userId);
    console.log("✏️ Modo recibido:", modo);

    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [telefono, setTelefono] = useState("");
    const [direccion, setDireccion] = useState("");
    const [email, setEmail] = useState("");
    const [categoria, setCategoria] = useState("");
    const [fotoPerfil, setFotoPerfil] = useState(null);
    const [errors, setErrors] = useState({});

    // 📌 Referencia para ActionSheet
    const actionSheetRef = useRef(null);

    // ⚡ Cargar datos de la microempresa
    useEffect(() => {
        if (!id) {
            console.error("⚠️ Error: No hay ID de microempresa.");
            Alert.alert("Error", "No se pudo cargar la microempresa.");
            return;
        }

        const fetchMicroempresa = async () => {
            try {
                console.log("📥 Obteniendo datos de la microempresa:", id);
                const { data } = await MicroempresaService.getMicroempresaData(id);

                setNombre(data.nombre);
                setDescripcion(data.descripcion);
                setTelefono(data.telefono);
                setDireccion(data.direccion);
                setEmail(data.email);
                setCategoria(data.categoria);
                setFotoPerfil(data.fotoPerfil?.url || null);
            } catch (error) {
                console.error("❌ Error al cargar datos de la microempresa:", error);
                Alert.alert("Error", "No se pudieron cargar los datos.");
            }
        };
        fetchMicroempresa();
    }, [id]);

    // ✅ Validar y enviar datos al backend
    const handleSubmit = async () => {
        let valid = true;
        const newErrors = {};

        if (!nombre.trim()) {
            newErrors.nombre = "El nombre es obligatorio.";
            valid = false;
        } else if (nombre.length < 3) {
            newErrors.nombre = "El nombre debe tener al menos 3 caracteres.";
            valid = false;
        }

        if (!descripcion.trim() || descripcion.length < 10) {
            newErrors.descripcion = "La descripción debe tener al menos 10 caracteres.";
            valid = false;
        }

        if (!telefono.trim() || !/^\d{9}$/.test(telefono)) {
            newErrors.telefono = "El teléfono debe tener 9 dígitos.";
            valid = false;
        }

        if (!direccion.trim()) {
            newErrors.direccion = "La dirección es obligatoria.";
            valid = false;
        }

        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = "El email no tiene un formato válido.";
            valid = false;
        }

        if (!categoria) {
            newErrors.categoria = "Debe seleccionar una categoría.";
            valid = false;
        }

        setErrors(newErrors);
        if (!valid) return;

        try {
            const datosActualizados = { 
                nombre, 
                descripcion, 
                telefono, 
                direccion, 
                email, 
                categoria, 
                userId
            };

            console.log("📦 Enviando datos actualizados al backend:", datosActualizados);
            await MicroempresaService.updateMicroempresa(id, datosActualizados);

            console.log("✅ Microempresa actualizada con éxito.");

            Alert.alert("Éxito", "Microempresa actualizada correctamente.");

            navigation.reset({
                index: 0,
                routes: [{ name: "Microempresa", params: { id, userId } }],
            });
        } catch (error) {
            console.error("❌ Error al actualizar la microempresa:", error.response?.data || error.message);
            Alert.alert("Error", "No se pudo actualizar la microempresa.");
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Editar Microempresa</Text>

            {/* 📷 Foto de perfil */}
            <TouchableOpacity onPress={() => navigation.navigate("SubirFotoPerfil", { id, modo: "editar" })}>
                {fotoPerfil ? (
                    <Image source={{ uri: fotoPerfil }} style={styles.image} />
                ) : (
                    <View style={styles.placeholderImage}>
                        <Text>📷 Agregar Foto</Text>
                    </View>
                )}
            </TouchableOpacity>

            <TextInput style={styles.input} value={nombre} onChangeText={setNombre} placeholder="Nombre" />
            {errors.nombre && <Text style={styles.error}>{errors.nombre}</Text>}

            <TextInput style={styles.input} value={descripcion} onChangeText={setDescripcion} placeholder="Descripción" />
            {errors.descripcion && <Text style={styles.error}>{errors.descripcion}</Text>}

            <TextInput style={styles.input} value={telefono} onChangeText={setTelefono} placeholder="Teléfono" keyboardType="phone-pad" />
            {errors.telefono && <Text style={styles.error}>{errors.telefono}</Text>}

            <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} placeholder="Dirección" />
            {errors.direccion && <Text style={styles.error}>{errors.direccion}</Text>}

            <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" />
            {errors.email && <Text style={styles.error}>{errors.email}</Text>}

            {/* 📌 Selector de categoría con ActionSheet */}
<TouchableOpacity style={styles.pickerButton} onPress={() => actionSheetRef.current?.show()}>
    <Text>{categoria || "Selecciona una categoría..."}</Text>
</TouchableOpacity>
{errors.categoria && <Text style={styles.error}>{errors.categoria}</Text>}

<ActionSheet ref={actionSheetRef}>
    {CATEGORIAS.map((item) => (
        <TouchableOpacity
            key={item}
            style={styles.option}
            onPress={() => {
                setCategoria(item);
                actionSheetRef.current?.hide();
            }}
        >
            <Text style={styles.optionText}>{item}</Text>
        </TouchableOpacity>
    ))}
</ActionSheet>


            <Button title="Actualizar Microempresa" onPress={handleSubmit} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    pickerButton: {
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        backgroundColor: "#f9f9f9",
        marginBottom: 15,
    },
    option: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        alignItems: "center",
    },
    optionText: {
        fontSize: 16,
    },
    error: {
        color: "red",
        fontSize: 12,
        marginBottom: 10,
    },
});


export default EditarMicroempresaScreen;


