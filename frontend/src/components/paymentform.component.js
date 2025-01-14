import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Picker, StyleSheet, Alert } from "react-native";

const PaymentForm = ({ onSubmit, fetchDynamicData }) => {
  const [cardNumber, setCardNumber] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [securityCode, setSecurityCode] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [issuer, setIssuer] = useState(""); // Banco emisor
  const [installments, setInstallments] = useState("1"); // Cuotas (siempre 1)
  const [identificationType, setIdentificationType] = useState(""); // Tipo de documento
  const [identificationNumber, setIdentificationNumber] = useState("");
  const [cardholderEmail, setCardholderEmail] = useState("");

  const [issuers, setIssuers] = useState([]);
  const [identificationTypes, setIdentificationTypes] = useState([]);

  useEffect(() => {
    fetchDynamicData()
      .then(({ issuers, identificationTypes }) => {
        setIssuers(issuers.length ? issuers : [{ id: "", name: "No disponible" }]);
        setIdentificationTypes(
          identificationTypes.length ? identificationTypes : [{ id: "", name: "No disponible" }]
        );
      })
      .catch(() => {
        Alert.alert("Error", "No se pudieron cargar los datos dinámicos");
      });
  }, []);

  const handleSubmit = () => {
    if (!cardNumber || !expirationDate || !securityCode || !cardholderName || !identificationNumber || !cardholderEmail) {
      Alert.alert("Error", "Por favor complete todos los campos.");
      return;
    }

    onSubmit({
      cardNumber,
      expirationDate,
      securityCode,
      cardholderName,
      issuer,
      installments,
      identificationType,
      identificationNumber,
      cardholderEmail,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Formulario de Pago</Text>
      <TextInput style={styles.input} placeholder="Número de tarjeta" value={cardNumber} onChangeText={setCardNumber} />
      <TextInput style={styles.input} placeholder="MM/YY" value={expirationDate} onChangeText={setExpirationDate} />
      <TextInput style={styles.input} placeholder="Código de seguridad" value={securityCode} onChangeText={setSecurityCode} />
      <TextInput style={styles.input} placeholder="Titular de la tarjeta" value={cardholderName} onChangeText={setCardholderName} />
      
      <Picker selectedValue={issuer} onValueChange={(value) => setIssuer(value)} style={styles.picker}>
        <Picker.Item label="Seleccione un banco" value="" />
        {issuers.map((issuer) => (
          <Picker.Item key={issuer.id} label={issuer.name} value={issuer.id} />
        ))}
      </Picker>

      <Picker selectedValue={installments} onValueChange={(value) => setInstallments(value)} style={styles.picker}>
        <Picker.Item label="1 cuota" value="1" />
      </Picker>

      <Picker selectedValue={identificationType} onValueChange={(value) => setIdentificationType(value)} style={styles.picker}>
        <Picker.Item label="Seleccione un tipo de documento" value="" />
        {identificationTypes.map((type) => (
          <Picker.Item key={type.id} label={type.name} value={type.id} />
        ))}
      </Picker>

      <TextInput style={styles.input} placeholder="Número de documento" value={identificationNumber} onChangeText={setIdentificationNumber} />
      <TextInput style={styles.input} placeholder="Correo electrónico" value={cardholderEmail} onChangeText={setCardholderEmail} />

      <Button title="Pagar" onPress={handleSubmit} />
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

export default PaymentForm;
