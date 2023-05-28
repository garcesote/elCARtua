import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


const CarContainer = ({ nombre, groupId, navigation}) => {
  return (
    <TouchableOpacity onPress={() => navigation.navigate("Reserva", {vehicle: nombre})}>
        <View style={styles.container}>
            <Icon name="car" size={30} color="black" />
            <Text style={styles.text}>{nombre}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("AddPicture", {vehicle: nombre, groupId: groupId})}>
              <Icon name="camera" size={30} color="black" />
            </TouchableOpacity>
        </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin:5,
    backgroundColor: '#ADD8E6',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    marginLeft: 10,
    color: 'black',
    fontSize: 18,
  },
});

export default CarContainer;
