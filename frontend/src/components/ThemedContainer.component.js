// ThemedContainer.js
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../context/theme.context';

const ThemedContainer = ({ children, style }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20, // Puedes ajustar este padding según tus necesidades
  },
});

export default ThemedContainer;
