import React, { useContext } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar, Alert,
} from "react-native";
import { AuthContext } from "../context/auth.context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/theme.context";
import { Ionicons } from "@expo/vector-icons";

export default function HomeClienteScreen() {
  const { logout } = useContext(AuthContext);
  const navigation = useNavigation();
  const { theme, toggleTheme } = useTheme();
 
  const handleLogout = async () => {
    await logout();
  };

  const handleGoToListaMicroempresas = () => {
    navigation.navigate("ListaMicroempresas");
  };

  const handleGoToAceptarInvitacion = async () => {
    try {
      const user = await AsyncStorage.getItem("user");

      if (!user) {
        Alert.alert("Error", "No se encontró información del usuario.");
        return;
      }

      const parsedUser = JSON.parse(user);
      if (!parsedUser?.id) {
        Alert.alert("Error", "No se pudo obtener el ID del usuario.");
        return;
      }

      navigation.navigate("AceptarInvitacion", { userId: parsedUser.id });
    } catch (error) {
      console.error("❌ Error al obtener el ID del usuario:", error);
      Alert.alert("Error", "Ocurrió un problema al obtener los datos del usuario.");
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>

        <Text style={[styles.title, { color: theme.text }]}>¡Bienvenido Cliente!</Text>

        <TouchableOpacity
          style={[styles.button, styles.greenButton]}
          onPress={handleGoToListaMicroempresas}
        >
          <Text style={[styles.buttonText, { color: "#FFF" }]}>
            Ver Lista de Microempresas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.blueButton]}
          onPress={handleGoToAceptarInvitacion}
        >
          <Text style={[styles.buttonText, { color: "#FFF" }]}>
            Aceptar Invitación
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.redButton]}
          onPress={handleLogout}
        >
          <Text style={[styles.buttonText, { color: "#FFF" }]}>
            Cerrar Sesión
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 20,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  toggleIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    borderRadius: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "Inter",
    textAlign: "center",
    marginBottom: 120,
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 5,
  },
  button: {
    width: "80%",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Inter",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  greenButton: {
    backgroundColor: "#28A745",
  },
  blueButton: {
    backgroundColor: "#007BFF",
  },
  redButton: {
    backgroundColor: "#FF0000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



