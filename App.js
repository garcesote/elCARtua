import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Reserva from './src/screens/Reserva';
import Login from './src/screens/Login';
import AddPicture from './src/screens/AddPicture';
import Home from './src/screens/Home';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ContextBooksProvider } from './src/comun/ContextBooks';

import { initializeApp } from 'firebase/app';
import messaging from '@react-native-firebase/messaging';
import { PermissionsAndroid, Alert } from 'react-native';
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

  const [today_band, setToday_band] = useState('');

  useEffect(() => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    // registerNotificationListener();
    console.log("useEffect app");
    const today = new Date();
    let today_band_aux = "";
    today_band_aux = today.getDate().toString() + "_" + (today.getMonth() + 1).toString() + "_" + today.getFullYear().toString();
    setToday_band(today_band_aux);

    AsyncStorage.setItem("today_band", today_band_aux);
  }, [])

  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async remoteMessage => {
  //     Alert.alert('El que no corre vuela!', remoteMessage.notification.body);
  //     console.log()
  //   });

  //   return unsubscribe;
  // }, []);

  
  return (
    <NavigationContainer>
      <ContextBooksProvider>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Reserva" component={Reserva} />
          <Stack.Screen name="AddPicture" component={AddPicture} />
          <Stack.Screen name="Login" component={Login} options={{ headerLeft: null }} />
          <Stack.Screen name="Home" component={Home} options={{ headerLeft: null }} />
        </Stack.Navigator>
      </ContextBooksProvider>

    </NavigationContainer>
  );
};

export default App;