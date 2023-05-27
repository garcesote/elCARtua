import React, { useEffect, useState, useContext } from 'react';
import { View, Text, Button, StyleSheet, Dimensions, FlatList, TouchableOpacity, Alert } from 'react-native';

const { height } = Dimensions.get('window');

const TablaReservas = ({ vehicle, book_time, booksToday, todayBand, setCloudNewBooks, deleteCloudBook, user }) => {

  const [bands, setBands] = useState([]);

  useEffect(() => {
    const bands_aux = [];
    for (let i = 0; i < 24; i += parseInt(book_time)) {
      const next_band = parseInt(book_time) + i;
      const band_hour = i + "_" + next_band;
      const band = { id: vehicle + "_" + todayBand + "_" + band_hour, start_time: i, end_time: next_band, booked: false, bookedBy: "", bookedVehicle: "" };
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
        return { ...item, booked: 0, bookedBy: "", bookedVehicle: "" };
      }
    });
    setBands(bookedBands);
  }

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
      style={[styles.timeSlotContainer, getBookedStyle(item.booked, item.bookedBy)]}
    >
      <View style={styles.timeContainer}>
        <Text style={styles.time}>Desde: {item.start_time} : 00</Text>
        <Text style={styles.time}>Hasta: {item.end_time} : 00</Text>
      </View>
      <View style={styles.statusContainer}>
        {
          item.booked === 0 ? (
            <Text style={styles.statusText}>Libre</Text>
          ) : item.booked === 1 && item.bookedBy === user ? (
            <Text style={styles.statusText}>Reservado por ti</Text>
          ) : item.booked === 1 ? (
            <Text style={styles.statusText}>Reservado por {item.bookedBy}</Text>
          ) : (
                  <Text style={styles.statusText}>Solicitando reserva por ti</Text>
                )
        }
      </View>
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
    <View style={styles.container}>
      <FlatList
        data={bands}
        extraData={booksToday}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
      >
      </FlatList>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={bookNewBands}
          style={styles.button}
        >
          <Text style={styles.buttonText}>Reservar</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  band: {
    minHeight: height / 6,
    borderBottomWidth: 1,
  },
  booked: {
    backgroundColor: 'pink'
  },
  notBooked: {
    backgroundColor: 'lightgreen'
  },
  booking: {
    backgroundColor: '#FDECB6'
  },
  bookedByMe: {
    backgroundColor: '#B7D9F2'
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
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  button: {
    backgroundColor: 'blue',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
  },
  timeSlotContainer: {
    minHeight: height / 6,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  timeContainer: {
    marginRight: 10,
  },
  time: {
    fontSize: 16,
  },
  statusContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});


export default TablaReservas;