import React from 'react';
import { View, Text, Button } from 'react-native';
import { useState, useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebase } from '@react-native-firebase/database';

const Login = ({navigation}) => {

  const usersRef = firebase
        .app()
        .database('https://elcartua-default-rtdb.europe-west1.firebasedatabase.app/')
        .ref('/users');
      
  GoogleSignin.configure({
    webClientId: '800171513430-jmolcac4c9c5so4p33jflf3hobvnm61f.apps.googleusercontent.com',
    offlineAccess: true,
  })

  // Set an initializing state whilst Firebase connects
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  useEffect(() => {
    //Se carga si hay iniciada una sesión
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  const onAuthStateChanged = (user) => {

    setUser(user);
    
    if(user){
      navigation.navigate("Home");
    }
    if (initializing) setInitializing(false);
  }

  const SuccesLogIn = (user) => {
    
    AsyncStorage.setItem("user_data", 
        JSON.stringify({userName: user.user.displayName, userID: user.user.uid, logged_in:true})
    );
  }

  const userInDb = async (user) => {
    try {
        const snapshot = await usersRef.once('value');
        const userData = snapshot.val();
        console.log('USUARIO LOGIN: ', user.user.email);
        return user.user.uid in userData;
      } catch (error) {
        console.error('Error al consultar la base de datos: ', error);
        throw error;
      }
}

  const signinWithGoogle = async () => {
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const user_data = auth().signInWithCredential(googleCredential);
    
    user_data.then( (user) => {

      //Compruebo si el usuario figura en la db
      userInDb(user).then(present => {
          if(!present){
              const key = user.user.uid;
              //Añado el usuario a la db si no esta
              usersRef.child(key)
              .set({
                  name: user.user.displayName,
                  group: "null",
                  mail: user.user.email,
                  photoURL: user.user.photoURL
              }).then(SuccesLogIn(user))
              .catch(error => console.error('Error updating data: ', error));
          }else{
              SuccesLogIn(user);
          }
      })
  }).catch((error) => {
      console.log(error);
  })
  }

  return (
    <View>
      <Button title="Login con google" onPress={signinWithGoogle}></Button>
    </View>
  );
};

export default Login;