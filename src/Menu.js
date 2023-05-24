import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const Menu = ({ navigation }) => {

  useEffect(() => {
    console.log('hola');
  }, [])

  return (
    <View>
      <TouchableOpacity style={{ width: 'auto', height: 50, alignItems: 'center', margin: 2, justifyContent: 'center', borderWidth: 2 }} onPress={() => navigation.navigate('Login')}>
        <Text >Pantalla Login</Text>
      </TouchableOpacity>
      <TouchableOpacity style={{ width: 'auto', height: 50, alignItems: 'center', margin: 2, justifyContent: 'center', borderWidth: 2 }} onPress={() => navigation.navigate('Reserva')}>
        <Text>Pantalla Reserva</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Menu;