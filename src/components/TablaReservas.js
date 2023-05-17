import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, FlatList } from 'react-native';
import BookBand from './BookBand';

const { height } = Dimensions.get('window');

const TablaReservas = ({ vehicle, book_time }) => {

  const [bands, setBands] = useState([]);

  useEffect(() => {
    const today = new Date();
    const band_day = today.getDate().toString() + "_" + (today.getMonth() + 1).toString() + "_" + today.getFullYear().toString();
    const bands_aux = [];
    for (let i = 0; i < 24; i += parseInt(book_time)) {
      const next_band = parseInt(book_time) + i;
      const band_hour = i + "_" + next_band;
      console.log(band_day + "_" + band_hour);
      const band = { band: band_day + "_" + band_hour, start_time: i, end_time: next_band };
      bands_aux.push(band);
    }
    setBands(bands_aux);
  }, [])

  console.log(bands);

  const renderItem = ({ item }) => (
    <View style={styles.band}>
      <Text>{item.band}</Text>
    </View>
  );

  return (
    <View>
      <Text>{vehicle}</Text>
      <FlatList
        data={bands}
        renderItem={renderItem}
        keyExtractor={(item) => item.band}
      >
      </FlatList>
    </View>
  );
};

const styles = StyleSheet.create({
  band: {
    backgroundColor: 'lightblue',
    minHeight: height/5,
    borderBottomWidth: 1,
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