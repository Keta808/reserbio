// Formulario para guardar, eliminar, actualizar y obtener tarjetas de crédito de un cliente 
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native"; 
import { Picker } from '@react-native-picker/picker'; 

const CardForm = ({ onSubmit, fetchDynamicData }) => {
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
    const formattedInput = input.replace(/\D/g, ""); // Solo números
    let month = "";
    let year = "";
  
    if (formattedInput.length >= 1) {
      month = formattedInput.slice(0, 2);
    }
  
    if (formattedInput.length >= 3) {
      year = formattedInput.slice(2, 4);
    }
  
    // Validar que el mes sea válido (01 a 12)
    if (month && (parseInt(month, 10) < 1 || parseInt(month, 10) > 12)) {
      return; // No actualizar si el mes no es válido
    }
  
    setExpirationMonth(month);
    setExpirationYear(year);
  
    const formattedDate = month + (year ? `/${year}` : "");
    setExpirationDate(formattedDate);
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
    if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rut)) return false;
    const [body, verifier] = rut.split("-");
    let sum = 0;
    let multiplier = 2;
  
    for (let i = body.length - 1; i >= 0; i--) {
      sum += body[i] * multiplier;
      multiplier = multiplier === 7 ? 2 : multiplier + 1;
    }
  
    const expectedVerifier = 11 - (sum % 11);
    const verifierChar = expectedVerifier === 11 ? "0" : expectedVerifier === 10 ? "K" : expectedVerifier.toString();
  
    return verifier.toUpperCase() === verifierChar;
  };
  

  const formatRut = (input) => {
    const cleanInput = input.replace(/[^0-9kK]/g, ""); // Elimina todo lo que no sea números o 'k/K'
    const body = cleanInput.slice(0, -1); // Parte numérica
    const verifier = cleanInput.slice(-1).toUpperCase(); // Dígito verificador en mayúscula
    return `${body}${verifier}`;
  };
  const handleIdentificationNumberChange = (input) => { 
    if (identificationType === "RUT") {
      const formattedRut = formatRut(input);
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
    
    if (!cardNumber || !expirationDate || !securityCode || !cardholderName || !identificationNumber || !cardholderEmail) {
      Alert.alert("Error", "Por favor complete todos los campos.");
      return;
    } 
    if (!issuer || !identificationType) {
      Alert.alert("Error", "Seleccione el banco y el tipo de documento.");
      return;
    }  
    if (identificationType === "RUT" && !validarRut(identificationNumber)) {
      Alert.alert("Error", "El RUT ingresado no es válido.");
      return;
    }
    
    const cleanCardNumber = cardNumber.replace(/\s/g, ""); // cardNumber sin espacios  
    const fullExpirationYear = `20${expirationYear}`; 

    console.log("datos enviados desde el formulario de tarjeta", {
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
      <Text style={styles.title}>Formulario de Tarjeta</Text> 
       
      {/* Formulario */}
      <TextInput style={styles.input} placeholder="Número de tarjeta"  keyboardType="numeric" maxLength={19}  value={cardNumber} onChangeText={handleCardNumberChange} />
      <TextInput style={styles.input} placeholder="MM/YY" value={expirationDate} onChangeText={handleExpirationDateChange} keyboardType="numeric" maxLength={5} />
      <TextInput style={styles.input} placeholder="Código de seguridad" value={securityCode} onChangeText={handleSecurityCodeChange} keyboardType="numeric" maxLength={4} />
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
      <Button title="Actualizar" onPress={handleSubmit}/>
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
});

export default CardForm; 

