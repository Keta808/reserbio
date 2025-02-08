import { useEffect } from "react";
import * as Linking from "expo-linking";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/AppNavigator";
import { AuthProvider } from "./context/auth.context";
import { ThemeProvider } from "./context/theme.context";

const prefix = Linking.createURL("/");

export default function App() {
  useEffect(() => {
    const handleDeepLink = (event) => {
      let { url } = event;
      console.log("🔗 Deep Link Detectado:", url);

      if (url) {
        const { path, queryParams } = Linking.parse(url);
        console.log("📌 Path:", path, "🆔 QueryParams:", queryParams);

        // Extraer el token de la URL
        if (path === "invitaciones/aceptar" && queryParams.token) {
          // Redirigir manualmente a la screen correspondiente
          navigation.navigate("AceptarInvitacion", { token: queryParams.token });
        }
      }
    };

    const eventListener = Linking.addEventListener("url", handleDeepLink);

    return () => {
      eventListener.remove(); // 🔥 Nueva forma correcta de eliminar el listener
    };
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer linking={{ prefixes: [prefix] }}>
          <AppNavigator />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}

