import React from 'react';
import { View, Text } from 'react-native';
import TablaReservas from '../components/TablaReservas';

const Reserva = () => {
  return (
    <View>
      <TablaReservas vehicle="car1" book_time="12"></TablaReservas>
    </View>
  );
};

export default Reserva;