import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';


const CarContainer = ({ nombre, groupId, navigation, book}) => {
  
  let backgroundColor='lightgreen'

  if(book != 'null'){
    console.log(book);
    console.log('HOLAAAA');
  }else{
    console.log('ADIOS');
  }

  return (

        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Reserva", {vehicle: nombre})}>
              <Icon name="car" size={30} color="black" />
            </TouchableOpacity>
            
            <Text style={styles.text}>{nombre}</Text>
            <TouchableOpacity style={styles.button}onPress={() => navigation.navigate("AddPicture", {vehicle: nombre, groupId: groupId})}>
              <Icon name="camera" size={30} color="black" />
            </TouchableOpacity>
        </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    margin: 15,
    borderRadius: 6,
    backgroundColor: '#333333', // Color de fondo predeterminado
  },
  text: {
    margin:15,
    marginHorizontal:30,
    color: 'white',
    fontSize: 18,
  },
  button: {
    borderRadius: 6,
    borderColor:'black',
    borderWidth: 1,
    backgroundColor:'lightgray',
    padding:5
  }
});

export default CarContainer;