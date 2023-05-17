import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

const BookBand = ({ band }) => {

    const [bands, setBands] = useState([]);

    console.log(bands);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                {band.band}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#eaeaea',
    },
    title: {
        borderWidth: 1,
        borderColor: '#20232a',
        borderRadius: 6,
        backgroundColor: '#61dafb',
        color: '#20232a',
        textAlign: 'center',
        fontSize: 30,
        fontWeight: 'bold',
    },
});

export default BookBand;