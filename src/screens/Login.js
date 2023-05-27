import React from 'react';
import {SafeAreaView, ActivityIndicator, StatusBar, StyleSheet, View, Text, Dimensions, TouchableOpacity, Image} from 'react-native';
import { useState, useEffect } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { firebase } from '@react-native-firebase/database';
import Icon from 'react-native-vector-icons/Ionicons';

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
        JSON.stringify({userName: user.user.displayName, userID: user.user.uid, mail: user.user.email,
          photoURL: user.user.photoURL, logged_in:true})
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

  if(initializing){
  
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Cargando...</Text>
        </View>
    );
  }else{
    return (
      <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
          <View style={styles.topContent}>
          <Text style={styles.mainText}>
          elCARtua
          </Text>
          <Icon name="car" size={60} color="white" />
          </View>
          <View style={styles.bottomContent}>
              <TouchableOpacity style={styles.googleButton} onPress = {() => {signinWithGoogle()}}>
                  <Image style={styles.googleIcon} source={{ uri: "https://i.ibb.co/j82DCcR/search.png"}}/>
                  <Text style={styles.googleButtonText}>Sign in with Google</Text>
              </TouchableOpacity>
          </View>
      </View>
      </SafeAreaView>
    );
  }
  
  

}

const styles = StyleSheet.create({
  safeArea: {
   backgroundColor: "#262b2f"
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
   height: Dimensions.get('window').height,
   backgroundColor: "#262b2f",
  },
  topContent: {
   flex: 1,
   alignItems: 'center',
   justifyContent: 'center'
  },
  bottomContent: {
   flex: 1,
   alignItems: 'center',
   justifyContent: 'center'
  },
  mainText: {
   fontSize: 54,
   color: "white",
  },
  googleButton: {
   backgroundColor: "white",
   borderRadius: 4,
   paddingHorizontal: 34,
   paddingVertical: 16,
   flexDirection: 'row',
   justifyContent: 'center',
   alignItems: 'center'
  },
  googleButtonText: {
   marginLeft: 16,
   fontSize: 18,
   fontWeight: '600'
  },
  googleIcon: {
   height: 24,
   width: 24
  }
 });



export default Login;