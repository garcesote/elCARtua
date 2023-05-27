import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import TablaReservas from '../components/TablaReservas';
import { firebase } from '@react-native-firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Reserva = () => {

  const [todayBand, setTodayBand] = useState("");

  useEffect(() => {
    console.log("useEffect getLocalTodayBand");
    // Obtiene la banda de hoy, calculada en app.js
    getLocalTodayBand();
  }, []);

  useEffect(() => {
    console.log("useEffect getLocalTodayBand");

    // Recoge las reservas del coche "hoy"
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
      console.log('today_band:', today_band)
    } catch (error) {
      console.error('Error al consultar AsyncStorage: ', error);
      throw error;
    }
  }

  const getCloudTodayBooks = async () => {
    console.log("getting cloud books... with todayBand: " + todayBand);
    console.log(typeof(todayBand));
    try {
      // const snapshot = await booksRef.orderByKey().startAt(todayBand).endAt(todayBand+'\uf8ff').once('value');
      const snapshot = await booksRef.once('value');
      const booksData = snapshot.val();
      console.log('Cloud books: ', booksData);
    } catch (error) {
      console.error('Error al consultar la base de datos: ', error);
      throw error;
    }
  }

  return (
    <View>
      <TablaReservas vehicle="car1" book_time="12"></TablaReservas>
    </View>
  );
};

export default Reserva;