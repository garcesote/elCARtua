import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Reserva from './src/screens/Reserva';
import Login from './src/screens/Login';
import Menu from './src/Menu';

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
    const today = new Date();
    setToday_band(today.getDate().toString() + "_" + (today.getMonth() + 1).toString() + "_" + today.getFullYear().toString());
    
    queryDB();
  }, [])

  const queryDB = async () => {
    console.log("query to db");
    console.log(today_band);
    const q = query(collection(db, "groups", "group1", "books"), where("band", "<=", today_band));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach((doc) => {
      console.log(doc.id, " => ", doc.data());
    });

  }


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Menu">
        <Stack.Screen name="Menu" component={Menu} />
        <Stack.Screen name="Reserva" component={Reserva} />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;