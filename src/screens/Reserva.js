import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import TablaReservas from '../components/TablaReservas';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContextBooks } from '../comun/ContextBooks';
import messaging from '@react-native-firebase/messaging';
import axios from 'axios';

const Reserva = ({ route }) => {

  const { vehicle } = route.params;
  const [todayBand, setTodayBand] = useState("");
  const { booksToday, setBooksToday } = useContext(ContextBooks);
  const [booksRef, setBooksRef] = useState("");
  const [userName, setUserName] = useState("");
  const [groupId, setGroupId] = useState("");
  const book_time = "4";

  useEffect(() => {
    // Obtiene la banda de hoy, calculada en app.js
    getLocalUserData();
    getLocalTodayBand();
    getBooksRef();
    messaging()
      .getToken()
      .then(token => {
        // Suscribir al dispositivo al tema
        messaging()
          .subscribeToTopic("test")
          .then(() => {
            console.log('Dispositivo suscrito al topic ' + "test");
          })
          .catch(error => {
            console.log('Error al suscribir el dispositivo al tema:', error);
          });
      })
      .catch(error => {
        console.log('Error al obtener el token de registro:', error);
      });
  }, []);

  useEffect(() => {
    // Recoge las reservas del coche "hoy"
    checkCloudToday();
    getCloudTodayBooks();
  }, [todayBand, booksRef]);

  const getLocalUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("user_data");
      // console.log('USER LOCAL:', JSON.parse(userData));
      setUserName(JSON.parse(userData).userName);
      return (JSON.parse(userData));
    } catch (error) {
      console.error('Error al consultar AsyncStorage: ', error);
      throw error;
    }
  }
  const getLocalTodayBand = async () => {
    try {
      const today_band = await AsyncStorage.getItem("today_band");
      setTodayBand(today_band);
      // console.log('today_band:', today_band)
    } catch (error) {
      console.error('Error al consultar AsyncStorage: ', error);
      throw error;
    }
  }

  const getBooksRef = async () => {
    try {
      const id = await AsyncStorage.getItem("groupId");
      const ref = firebase
        .app()
        .database('https://elcartua-default-rtdb.europe-west1.firebasedatabase.app/')
        .ref('/groups/' + id + '/books/');

      setGroupId(id);
      setBooksRef(ref);
    } catch (error) {
      console.error('Error al consultar AsyncStorage: ', error);
      throw error;
    }
  }

  const checkCloudToday = async () => {
    // Recoge si existe el día de hoy en la BBDD
    if (todayBand && booksRef) {
      try {
        const snapshot = await booksRef.orderByKey().equalTo(vehicle + "_" + todayBand).once('value', (snapshot) => {
          if (!snapshot.exists()) {
            // Añadir el día de hoy a la BBDD, esto se hace porque si se eliminan todos los books de hoy, el último en eliminar no se detecta
            booksRef.child(vehicle + "_" + todayBand)
              .set({
                id: vehicle + "_" + todayBand
              }).then()
              .catch(error => console.error('Error updating data: ', error));
          } else {
            // console.log("Existe el día de hoy");
          }
        });
      } catch (error) {
        console.error('Error al consultar la base de datos: ', error);
        throw error;
      }
    }
  }

  const getCloudTodayBooks = async () => {
    if (todayBand && booksRef) {
      try {
        const snapshot = await booksRef.orderByKey().startAt(vehicle + "_" + todayBand).on('value', (snapshot) => {
          if (snapshot.exists()) {
            const booksData = snapshot.val();
            const updatedBooks = Object.entries(booksData).map(([id, book]) => ({ id, ...book }));
            setBooksToday(updatedBooks);
            console.log("\nUpdatedBooks:")
            console.log(updatedBooks);
          } else {
            // console.log("No hay datos nuevos");
          }
        });
      } catch (error) {
        console.error('Error al consultar la base de datos: ', error);
        throw error;
      }
    }
  }

  const setCloudNewBooks = (books) => {
    let reservado = false;
    console.log("userName: " + userName);
    let notificationData = [];
    books.map((item) => {
      if (item.booked === 2) {
        booksRef.child(item.id)
          .set({
            bookedBy: userName,
            bookedVehicle: vehicle,
          }).then(
            reservado = true,
            notificationData.push(item)
          )
          .catch(error => console.error('Error updating data: ', error));
      }
    })

    if (reservado) {
      sendNotificationToGroup(notificationData, userName, vehicle);
      Alert.alert(
        "Atención",
        "Reserva realizada con éxito"
      )
    }
    else {
      Alert.alert(
        "Atención",
        "Selecciona franjas para reservar"
      )
    }
  }

  const sendNotificationToGroup = (notificationData, userName, vehicle) => {
    console.log("notificationData: ");
    console.log(notificationData);
    let body = userName + " ha reservado " + vehicle + " las siguientes horas: ";
    notificationData.map((item) => {
      body += item.start_time.toString() + " - " + item.end_time.toString();
    })

    const data = {
      title: 'Nueva reserva!',
      body: body,
      topic: groupId,
    };
    console.log(data);

    return fetch('https://us-central1-elcartua.cloudfunctions.net/sendNotificationToTopic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(response => response.text())
      .then(result => console.log('Notificación enviada:', result))
      .catch(error => console.error('Error al enviar la notificación:', error));
  }

  const deleteCloudBook = (item) => {
    booksRef.child(item.id)
      .remove()
      .then(() => {
        Alert.alert(
          "Atención",
          "Cancelación realizada con éxito"
        )
      })
      .catch((error) => {
        Alert.alert(
          "Error",
          "Error cancelando la reserva"
        )
        console.error('Error updating data: ', error)
      });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{vehicle}</Text>
      <TablaReservas
        vehicle={vehicle}
        book_time={book_time}
        booksToday={booksToday}
        todayBand={todayBand}
        setCloudNewBooks={setCloudNewBooks}
        deleteCloudBook={deleteCloudBook}
        user={userName}
      >
      </TablaReservas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    paddingVertical: 8,
    backgroundColor: '#61dafb',
    color: '#20232a',
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
  },
});

export default Reserva;