import { firebase } from '@react-native-firebase/database';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import messaging from '@react-native-firebase/messaging';


const FormContainer = ({ onSend, onBack, userData }) => {

  const [name, setName] = useState('');
  const [vehiclesNum, setVehiclesNum] = useState([]);
  const [vehiclesVal, setVehiclesVal] = useState({});

  console.log('HOLAAA:', userData);
  const groupsRef = firebase
    .app()
    .database('https://elcartua-default-rtdb.europe-west1.firebasedatabase.app/')
    .ref('/groups/');

  const usersRef = firebase
    .app()
    .database('https://elcartua-default-rtdb.europe-west1.firebasedatabase.app/')
    .ref('/users/');

  const handleSend = () => {

    if (name != '' && vehiclesVal != {}) {
      //Genero un número random de 5 digitos
      const id = Math.floor(Math.random() * 100000);
      const idString = id.toString();
      console.log(vehiclesVal);
      //Añado el grupo a la db
      groupsRef.child(idString)
        .set({
          name: name,
          users: [userData],
          vehicles: vehiclesVal,
          books: 'null'
        }).then(console.log('Añadido grupo:', idString))
        .catch(error => console.error('Error updating data: ', error));

      //Añado el grupo al usuario
      usersRef.child(userData.userID)
        .update({
          group: idString,
        }).then(console.log('Grupo añadido al usuario:', userData.userID),
          subscribeToGroupNotifications(idString)
        )
        .catch(error => console.error('Error updating data: ', error));

      // Limpia los campos después de enviar los datos
      setName('');
      setVehiclesVal({});
      setVehiclesNum([]);


      // Ejecuta la función proporcionada en las props para manejar el evento de envío
      onSend();
    } else {
      Alert.alert('Rellene todos los campos por favor')
    }

  };

  const subscribeToGroupNotifications = (topic) => {
    messaging()
      .getToken()
      .then(token => {
        // Suscribir al dispositivo al tema
        messaging()
          .subscribeToTopic(topic)
          .then(() => {
            console.log('Dispositivo suscrito al topic ' + topic);
          })
          .catch(error => {
            console.log('Error al suscribir el dispositivo al tema:', error);
          });
      })
      .catch(error => {
        console.log('Error al obtener el token de registro:', error);
      });
  }

  const handleInputChange = (campo, valor) => {
    console.log('VahiclesVal: ', vehiclesVal);
    console.log('VehiclesNum: ', vehiclesNum);
    setVehiclesVal(prevState => ({
      ...prevState,
      [campo]: valor
    }));
  };

  const addVehicle = () => {
    setVehiclesNum(prevState => [...prevState, prevState.length]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.text}>Completa los campos</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del grupo"
        value={name}
        onChangeText={text => setName(text)}
      />


      {
        vehiclesNum.map(index => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder={"Nombre del vehiculo"}
            value={vehiclesVal[index] || ''}
            onChangeText={text => handleInputChange(index, text)}
          />
        ))}

      {vehiclesNum.length < 4 && (
        <TouchableOpacity style={styles.button} onPress={addVehicle}>
          <Text style={styles.buttonText}>Añadir vehículo +</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttoncontainer}>
        <TouchableOpacity style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSend}>
          <Text style={styles.buttonText}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: "#262b2f"
  },

  safeArea: {
    backgroundColor: "#262b2f",
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  buttoncontainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    width: 250,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  button: {
        width: 'auto',
        height: 50,
        borderRadius: 5,
        alignItems: 'center',
        margin: 10,
        padding:10,
        justifyContent: 'center',
        borderWidth: 2,
        backgroundColor: 'blue'
  },
  buttonText: {
    fontSize:18,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FormContainer;