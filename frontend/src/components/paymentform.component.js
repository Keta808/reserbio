import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { Picker } from '@react-native-picker/picker';

const PaymentForm = ({ onSubmit, fetchDynamicData, selectedPlan }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [issuer, setIssuer] = useState(""); // Banco emisor
  const [identificationType, setIdentificationType] = useState(""); // Tipo de identificación
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [cardholderEmail, setCardholderEmail] = useState("");
  // fecha de expiracion 
  const [expirationMonth, setExpirationMonth] = useState("");
  const [expirationYear, setExpirationYear] = useState("");
  
  const [issuers, setIssuers] = useState([]);
  const [identificationTypes, setIdentificationTypes] = useState([]); 
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    fetchDynamicData()
      .then(({ issuers, identificationTypes }) => {
        setIssuers(issuers.length ? issuers : [{ id: "", name: "No disponible" }]);
        setIdentificationTypes(identificationTypes.length ? identificationTypes : [{ id: "", name: "No disponible" }]);
        
      })
      .catch(() => {
        Alert.alert("Error", "No se pudieron cargar los datos dinámicos");
      });
  }, []); 
  // Formatear el numero de tarjeta con espacios cada 4 digitos 
  const formatCardNumber = (input) => {
    return input
      .replace(/\D/g, "")            // Eliminar todo lo que no sea dígito
      .replace(/(.{4})/g, "$1 ")     // Agregar un espacio cada 4 dígitos
      .trim();                       // Eliminar espacios al final
  }; 
  
  // Formatear el input que recibe cardForm 
  const handleCardNumberChange = (input) => {
    const formatted = formatCardNumber(input);
    setCardNumber(formatted);
  }; 
  // handler para la fecha de expiracion
  const handleExpirationDateChange = (input) => {
    const formattedInput = input.replace(/\D/g, ""); // Eliminar caracteres no numéricos
    let month = "";
    let year = "";

    if (formattedInput.length > 0) {
        month = formattedInput.slice(0, 2);
    }

    if (formattedInput.length > 2) {
        year = formattedInput.slice(2, 4);
    }

    // Solo validar cuando el usuario haya ingresado los dos primeros dígitos del mes
    if (month.length === 2) {
        const monthNumber = parseInt(month, 10);
        if (monthNumber < 1 || monthNumber > 12) {
            return; // Si es inválido, no actualizar el estado (pero no bloquear la entrada)
        }
    }
  
    
  
    const formattedDate = month + (year ? `/${year}` : "");
    setExpirationDate(formattedDate);
    setExpirationMonth(month);
    setExpirationYear(year);
  }; 
  // handler para el codigo de seguridad
  const handleSecurityCodeChange = (input) => {
    const formattedInput = input.replace(/\D/g, ""); // Solo números
  
    // Máximo 4 dígitos (3 para Visa/Mastercard, 4 para AMEX)
    if (formattedInput.length <= 4) {
      setSecurityCode(formattedInput);
    }
  }; 
  // Validar si el Rut ingresado es valido con Algoritmo
  const validarRut = (rut) => { 
    console.log("validarRut:", rut); 
    if (!/^[0-9]+-[0-9kK]{1}$/.test(rut)) {
      console.log("Formato de RUT incorrecto");
      return false;
    }
    const [body, verifier] = rut.split("-");
    let sum = 0;
    let multiplier = 2;
  
    for (let i = body.length - 1; i >= 0; i--) {
      sum += parseInt(body[i], 10) * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
  
    const expectedVerifier = 11 - (sum % 11);
    const verifierChar = expectedVerifier === 11 ? "0" : expectedVerifier === 10 ? "K" : expectedVerifier.toString();

    console.log("verifierChar esperado:", verifierChar);
    console.log("verifier ingresado:", verifier.toUpperCase());

    return verifier.toUpperCase() === verifierChar;
  };
  

  const formatRut = (input) => {
    // Eliminar todo lo que no sea números o la letra K/k
    const cleanInput = input.replace(/[^0-9kK]/g, "");
    
    if (cleanInput.length <= 1) return cleanInput; // Si hay solo un dígito, retornar tal cual
    
    const body = cleanInput.slice(0, -1); // Números del RUT
    const verifier = cleanInput.slice(-1).toUpperCase(); // Último dígito (verificador)
  
    return `${body}-${verifier}`;
  }; 

  const handleIdentificationNumberChange = (input) => { 
    if (identificationType === "RUT") {
      
     
      const formattedRut = formatRut(input);
      console.log("formattedRut:", formattedRut);
      setIdentificationNumber(formattedRut);
    } else {
      setIdentificationNumber(input);
    }
  };

  const handleEmailChange = (input) => {
    setCardholderEmail(input);
    setEmailError(""); // Limpiar el error al cambiar el texto
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cardholderEmail)) {
      setEmailError("Por favor ingrese un correo electrónico válido.");
      return false;
    }
    return true;
  };   
  

  const handleSubmit = () => { 
    console.log("handleSubmit..."); 
    
    if (!cardNumber || !expirationDate || !securityCode || !cardholderName || !identificationNumber || !cardholderEmail) {
      console.log("Faltan campos por completar");
      Alert.alert("Error", "Por favor complete todos los campos.");
      return;
    } 
    
    if (!issuer || !identificationType) {
      console.log("Banco o tipo de documento no seleccionado");
      Alert.alert("Error", "Seleccione el banco y el tipo de documento.");
      return;
    }  
    
    if (identificationType === "RUT" && !validarRut(identificationNumber)) {
      console.log("RUT no válido");
      Alert.alert("Error", "El RUT ingresado no es válido.");
      return;
    } 
    
    
    const cleanCardNumber = cardNumber.replace(/\s/g, ""); // cardNumber sin espacios  
    const fullExpirationYear = `20${expirationYear}`; 

    console.log("datos enviados desde el formulario de pago", {
      cardNumber: cleanCardNumber,
      expirationMonth,
      expirationYear: fullExpirationYear,
      securityCode,
      cardholderName,
      issuer,
      installments: "1",
      identificationType,
      identificationNumber,
      cardholderEmail,
    });
      
    onSubmit({
      cardNumber: cleanCardNumber,
      expirationMonth,
      expirationYear: fullExpirationYear,
      securityCode,
      cardholderName,
      issuer,
      installments: "1",
      identificationType,
      identificationNumber: identificationNumber,
      cardholderEmail,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formulario de Pago</Text> 
       {/* Información del plan seleccionado */}
       {selectedPlan && (
        <View style={styles.planInfo}>
          <Text style={styles.planTitle}>Plan Seleccionado:</Text>
          <Text style={styles.planName}>{selectedPlan.tipo_plan}</Text>
          <Text style={styles.planPrice}>Precio: ${selectedPlan.precio}</Text>
        </View>
      )} 
      {/* Resto del formulario */}
      <TextInput style={styles.input} placeholder="Número de tarjeta"  keyboardType="numeric" maxLength={19}  value={cardNumber} onChangeText={handleCardNumberChange} />
      <TextInput style={styles.input} placeholder="MM/YY" value={expirationDate} onChangeText={handleExpirationDateChange} keyboardType="numeric" maxLength={5} />
      <TextInput style={styles.input} placeholder="Código de seguridad (CVV)" value={securityCode} onChangeText={handleSecurityCodeChange} keyboardType="numeric" maxLength={4} />
      <TextInput style={styles.input} placeholder="Titular de la tarjeta" value={cardholderName} onChangeText={setCardholderName} />
      
      <Picker selectedValue={issuer} onValueChange={(value) => setIssuer(value)} style={styles.picker}>
        <Picker.Item label="Seleccione un banco" value="" />
        {issuers.map((issuer) => (
          <Picker.Item key={issuer.id} label={issuer.name} value={issuer.id} />
        ))}
      </Picker> 
      <Picker selectedValue={identificationType} onValueChange={(value) => setIdentificationType(value)} style={styles.picker}>
          <Picker.Item label="Seleccione un tipo de documento" value="" />
          {identificationTypes.map((identificationType) => (
            <Picker.Item key={identificationType.id} label={identificationType.name} value={identificationType.id} />
        ))}
       </Picker> 

      <TextInput style={styles.input} placeholder="Número de documento" value={identificationNumber} onChangeText={handleIdentificationNumberChange} keyboardType="default" autoCapitalize="characters"  />
      <TextInput style={styles.input} placeholder="Correo electrónico" value={cardholderEmail} onChangeText={handleEmailChange} keyboardType="email-address" onBlur={validateEmail} />
      {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

      <Button title="Pagar" onPress={handleSubmit}/> 
      <View style={styles.disclaimerContainer}>
            <Text style={styles.disclaimerText}>
              Nota: La suscripción al plan seleccionado se cobrará de manera mensual una vez obtenido el plan. 
              Puedes gestionar tu suscripción a través de la aplicación. {"\n\n"}
              
              IMPORTANTE: Si decides cancelar tu suscripción, tu microempresa será eliminada y deberás volver a suscribirte a un plan para seguir utilizando la aplicación como Microempresa.
            </Text>
          </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    height: 50,
    marginBottom: 10,
  },
  planInfo: {
    marginBottom: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  planName: {
    fontSize: 16,
  },
  planPrice: {
    fontSize: 16,
    color: '#888',
  },
  disclaimerContainer: {
    marginTop: 20,
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
});

export default PaymentForm; 

