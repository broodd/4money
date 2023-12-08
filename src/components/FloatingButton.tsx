import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const FloatingButton = ({ text = '+', onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 10,
    bottom: 16,
    right: 16,
  },
  button: {
    backgroundColor: '#BDD2B6',
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  buttonText: {
    color: '#fefefe',
    marginLeft: 2,
    fontSize: 24,
    fontWeight: 'bold',
  },
});
