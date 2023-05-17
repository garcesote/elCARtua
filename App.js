import React, { useEffect } from 'react';
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

  useEffect(() => {
    queryDB();
  }, [])

  const queryDB = async () => {

    const q = query(collection(db, "groups", "group1", "books"));

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