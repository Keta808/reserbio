import React, { useContext, useEffect } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Platform, StatusBar 
} from "react-native";
import { AuthContext } from "../context/auth.context";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../context/theme.context";
import { MicroempresaContext } from "../context/microempresa.context";
import { Ionicons } from "@expo/vector-icons";

export default function HomeTrabajadorScreen() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useContext(AuthContext);
  const { microempresa, fetchMicroempresa } = useContext(MicroempresaContext);
  const navigation = useNavigation();

  useEffect(() => {
    if (user && !microempresa) {
      fetchMicroempresa(user.id);
    }
  }, [user, microempresa, fetchMicroempresa]);

  const handleGoToPerfilTrabajador = () => {
    if (!user) {
      Alert.alert("Error", "No hay información del trabajador disponible.");
      return;
    }
    navigation.navigate("Perfil");
  };

  const handleGoToPerfilMicroempresa = () => {
    if (!microempresa) {
      Alert.alert("Error", "No tienes una microempresa asociada.");
      return;
    }
    navigation.navigate("Microempresa", { id: microempresa._id, userId: user.id });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.container}>
        {/* Toggle de modo oscuro */}
        <TouchableOpacity style={styles.toggleIcon} onPress={toggleTheme}>
          <Ionicons
            name={theme.background === "#FFFFFF" ? "moon" : "sunny"}
            size={25}
            color={theme.text}
          />
        </TouchableOpacity>
        
        <Text style={[styles.title, { color: theme.text }]}>¡Bienvenido Trabajador!</Text>

        {microempresa && (
          <TouchableOpacity style={[styles.button, styles.blueButton]} onPress={handleGoToPerfilMicroempresa}>
            <Text style={styles.buttonText}>Ver Microempresa</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.button, styles.lightBlueButton]} onPress={handleGoToPerfilTrabajador}>
          <Text style={styles.buttonText}>Ver Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.redButton]} onPress={logout}>
          <Text style={styles.buttonText}>Cerrar Sesión</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    fontFamily: "Inter",
    textAlign: "center",
    marginBottom: 60,
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
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.5)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  blueButton: {
    backgroundColor: "#1e90ff",
  },
  lightBlueButton: {
    backgroundColor: "#00bfff",
  },
  redButton: {
    backgroundColor: "#FF0000",
  },
  toggleIcon: {
    position: "absolute",
    top: 20,
    right: 20,
    padding: 10,
    borderRadius: 20,
  },
});

