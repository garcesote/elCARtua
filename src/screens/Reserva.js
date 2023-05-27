import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import TablaReservas from '../components/TablaReservas';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContextBooks } from '../comun/ContextBooks';

const Reserva = () => {

  const [todayBand, setTodayBand] = useState("");
  const { booksToday, setBooksToday } = useContext(ContextBooks);
  const vehicle = "car1";
  const user = "yo";
  const book_time = "6";

  useEffect(() => {
    // Obtiene la banda de hoy, calculada en app.js
    getLocalTodayBand();
  }, []);

  useEffect(() => {
    // Recoge las reservas del coche "hoy"
    checkCloudToday();
    getCloudTodayBooks();
  }, [todayBand]);

  const booksRef = firebase
    .app()
    .database('https://elcartua-default-rtdb.europe-west1.firebasedatabase.app/')
    .ref('/groups/8dd23faa-f48b-11ed-a05b-0242ac120003/books/');

  // TODO: obtener el groupID desde AsyncStorage!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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

  const checkCloudToday = async () => {
    // Recoge si existe el día de hoy en la BBDD
    if (todayBand) {
      try {
        const snapshot = await booksRef.orderByKey().equalTo(todayBand).once('value', (snapshot) => {
          if (!snapshot.exists()) {
            // Añadir el día de hoy a la BBDD, esto se hace porque si se eliminan todos los books de hoy, el último en eliminar no se detecta
            booksRef.child(todayBand)
              .set({
                id: todayBand
              }).then()
              .catch(error => console.error('Error updating data: ', error));
          } else {
            console.log("Existe el día de hoy");
          }
        });
      } catch (error) {
        console.error('Error al consultar la base de datos: ', error);
        throw error;
      }
    }
  }

  const getCloudTodayBooks = async () => {
    // Recoge las reservas del coche hoy, y se queda a la escucha 
    if (todayBand) {
      try {
        const snapshot = await booksRef.orderByKey().startAt(todayBand).on('value', (snapshot) => {
          if (snapshot.exists()) {
            const booksData = snapshot.val();
            const updatedBooks = Object.entries(booksData).map(([id, book]) => ({ id, ...book }));
            setBooksToday(updatedBooks);
          } else {
            console.log("No hay datos nuevos");
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
    books.map((item) => {
      if (item.booked === 2) {
        booksRef.child(item.id)
          .set({
            bookedBy: user,
            bookedVehicle: vehicle,
          }).then(
            reservado = true
          )
          .catch(error => console.error('Error updating data: ', error));
      }
    })

    if (reservado) {
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

  // console.log(booksToday);

  return (
    <View>
      <TablaReservas vehicle={vehicle} book_time={book_time} booksToday={booksToday} todayBand={todayBand} setCloudNewBooks={setCloudNewBooks} deleteCloudBook={deleteCloudBook}></TablaReservas>
    </View>
  );
};

export default Reserva;