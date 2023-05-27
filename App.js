import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Reserva from './src/screens/Reserva';
import Login from './src/screens/Login';
import Menu from './src/Menu';
import Home from './src/screens/Home';
import { AsyncStorage } from 'react-native';

import { collection, query, where, onSnapshot, getFirestore, doc, getDoc, getDocs } from "firebase/firestore";
import { initializeApp } from 'firebase/app';
// import { firebaseConfig } from 'firebase-config';

const Stack = createStackNavigator();

const App = () => {

  const firebaseConfig = {
    apiKey: "AIzaSyANwp-t3_n4XYJREdQhAcm2eAD1wA8aXbE",
    authDomain: "elcartua.firebaseapp.com",
    databaseURL: "https://elcartua-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "elcartua",
    storageBucket: "elcartua.appspot.com",
    messagingSenderId: "800171513430",
    appId: "1:800171513430:web:80abc96821bec8cbb68df7",
    measurementId: "G-KZHKSDLTMZ"
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const[today_band, setToday_band] = useState('');

  useEffect(() => {
    console.log("useEffect app");
    const today = new Date();
    let today_band_aux = "";
    today_band_aux = today.getDate().toString() + "_" + (today.getMonth() + 1).toString() + "_" + today.getFullYear().toString();
    setToday_band(today_band_aux);
    
    queryDB(today_band_aux);
  }, [])

  const queryDB = (today_band_aux) => {
    console.log("Today_band: " + today_band_aux);
    console.log("query to db...");
    let db_bands = [];
    const q = query(collection(db, "groups", "group1", "books")); // , where("band", "==", true)
    getDocs(q)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          db_bands.push(doc.data());
          // console.log(doc.id, " => ", doc.data());
        });
      }).catch((error) => {
        console.error(error);
      })
    console.log(db_bands);
  }


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Reserva" component={Reserva} />
        <Stack.Screen name="Login" component={Login} options={{ headerLeft: null }}/>
        <Stack.Screen name="Home" component={Home} options={{ headerLeft: null }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;