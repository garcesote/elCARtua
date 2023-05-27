import React, { useEffect, useState, useContext } from 'react';
import { View, Text, ScrollView, Button, StyleSheet, Dimensions, FlatList, TouchableOpacity, Alert } from 'react-native';
import BookBand from './BookBand';
import { ContextBooks } from '../comun/ContextBooks';

const { height } = Dimensions.get('window');

const TablaReservas = ({ vehicle, book_time, booksToday, todayBand, setCloudNewBooks, deleteCloudBook }) => {

  const [bands, setBands] = useState([]);
  const { bookingBands, setBookingBands } = useContext(ContextBooks);
  const [bookingBandsAux, setBookingBandsAux] = useState([]);
  const user = "yo";

  useEffect(() => {
    const bands_aux = [];
    for (let i = 0; i < 24; i += parseInt(book_time)) {
      const next_band = parseInt(book_time) + i;
      const band_hour = i + "_" + next_band;
      // console.log(band_day + "_" + band_hour);
      const band = { id: todayBand + "_" + band_hour, start_time: i, end_time: next_band, booked: false, bookedBy: "", bookedVehicle: "" };
      bands_aux.push(band);
    }
    setBands(bands_aux);
  }, [todayBand, booksToday])

  useEffect(() => {
    // console.log(booksToday);
    checkBookedBands();
  }, [booksToday]);

  const checkBookedBands = () => {
    const bookedBands = bands.map((item) => {
      const matchingBookedBand = booksToday.find((element) => element.id === item.id && element.bookedVehicle === vehicle);
      if (matchingBookedBand) {
        return { ...item, booked: 1, bookedBy: matchingBookedBand.bookedBy, bookedVehicle: matchingBookedBand.bookedVehicle };
      }
      else {
        return { ...item, booked: 0 };
      }
    });
    console.log("\n");
    // console.log(bookedBands);
    console.log("\nbookedBands:");
    setBands(bookedBands);
  }

  console.log(bands);

  const getBookedStyle = (booked, bookedBy) => {
    if (booked === 0) {
      return styles.notBooked;
    }
    else if (booked === 1) {
      if (bookedBy === user) {
        return styles.bookedByMe;
      }
      return styles.booked;
    }
    else if (booked === 2) {
      return styles.booking;
    }
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => bandPressed(item)}
      style={[styles.band, getBookedStyle(item.booked, item.bookedBy)]}
    >
      <Text>{item.id}</Text>
      <Text>Reservado por: {item.bookedBy}</Text>
      <Text>Vehicle: {item.bookedVehicle}</Text>
    </TouchableOpacity>
  );

  const bandPressed = (item) => {
    const bandsCopy = [...bands];
    const index = bandsCopy.findIndex((element) => element.id === item.id);

    // ha encontrado el item pulsado en bands
    if (index !== -1) {
      if (item.booked === 1) {
        if (item.bookedBy === user) {
          // Opción de cancelar reserva
          Alert.alert(
            'Cancelar reserva',
            '¿Deseas cancelar la reserva?',
            [
              { text: 'Sí', onPress: () => cancelBook(item) },
              { text: 'No', onPress: () => console.log('') },
            ]
          )
        }
        else {
          Alert.alert(
            "Atención",
            "Franja no disponible"
          )
        }
      }
      else if (item.booked === 0) {
        bandsCopy[index].booked = 2;
      }
      else if (item.booked === 2) {
        bandsCopy[index].booked = 0;

      }
      // bandsCopy[index].bookedVehicle = vehicle;
      // bandsCopy[index].bookedBy = "Coger dato de usuario";
      setBands(bandsCopy);
    }
  }

  const bookNewBands = () => {
    setCloudNewBooks(bands);
  }

  const cancelBook = (item) => {
    deleteCloudBook(item);
  }

  return (
    <View>
      <Text>Selecciona las franjas y reserva</Text>
      <Text>{vehicle}</Text>
      <FlatList
        data={bands}
        extraData={bands}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      >
      </FlatList>
      <Button title="Reservar" onPress={bookNewBands}></Button>
    </View>
  );
};

const styles = StyleSheet.create({
  band: {
    minHeight: height / 5,
    borderBottomWidth: 1,
  },
  booked: {
    backgroundColor: 'pink'
  },
  notBooked: {
    backgroundColor: 'lightgreen'
  },
  booking: {
    backgroundColor: 'blue'
  },
  bookedByMe: {
    backgroundColor: 'lightblue'
  },
  container: {
    flexGrow: 1,
    height: height - 200, // Define la altura del ScrollView

  },
  content: {
    flex: 1,
    height: '100%',
    backgroundColor: 'red',
    marginBottom: 10,
    minHeight: height / 4
  },
  outer: {
    flex: 1,
  },
  inner: {
    flex: 1,
    padding: 20,
    backgroundColor: 'lightblue',
  },
  title: {
    marginTop: 16,
    paddingVertical: 8,
    borderWidth: 4,
    borderColor: '#20232a',
    borderRadius: 6,
    backgroundColor: '#61dafb',
    color: '#20232a',
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold',
  },
});


export default TablaReservas;