import React, {useState, useEffect, useContext} from 'react';
import 'expo-dev-client';
import {SafeAreaView, StatusBar, StyleSheet, View, Text, Dimensions, TouchableOpacity, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import referenceDB from '../comun/firebase';


const Login = ({navigation}) => {

        GoogleSignin.configure({
            webClientId: '800171513430-7qhs9k6nanqpa1cqv3isesi5q0at6bvd.apps.googleusercontent.com',
        });
    
        // Set an initializing state whilst Firebase connects
        const [initializing, setInitializing] = useState(true);
        const [user, setUser] = useState();
    
    
        useEffect(() => {
            const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
            return subscriber; // unsubscribe on unmount
        }, []);

        const onAuthStateChanged = (user) => {

            setUser(user);
            
            if(user){
                SuccesLogIn(user);
            }
            if (initializing) setInitializing(false);
        }
        
        const SuccesLogIn = (user) => {
            navigation.navigate("Home");
                AsyncStorage.setItem("user_data",
                    JSON.stringify({user, logged_in:true})
            );
        }
        
        const userInDb = async (user) => {
            try {
                const snapshot = await referenceDB.once('value');
                const userData = snapshot.val();
                console.log('USUARIO LOGIN: ', user.user.email);
                return user.user.uid in userData;
              } catch (error) {
                console.error('Error al consultar la base de datos: ', error);
                throw error;
              }
        }
        const onGoogleButtonPress = async () => {
    
            // Check if your device supports Google Play
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            // Get the users ID token
            const { idToken } = await GoogleSignin.signIn();
          
            // Create a Google credential with the token
            const googleCredential = auth.GoogleAuthProvider.credential(idToken);
          
            // Sign-in the user with the credential
            const user_data = auth().signInWithCredential(googleCredential);
    
            user_data.then( (user) => {

                //Compruebo si el usuario figura en la db
                userInDb(user).then(present => {
                    if(!present){
                        const key = user.user.uid;
                        //Añado el usuario a la db si no esta
                        referenceDB.child(key)
                        .set({
                            name: user.user.displayName,
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
            <SafeAreaView style={styles.safeArea}>
            <StatusBar barStyle="light-content" />
            <View style={styles.container}>
                <View style={styles.topContent}>
                <Text style={styles.mainText}>
                elCARtua
                </Text>
                </View>
                <View style={styles.bottomContent}>
                    <TouchableOpacity style={styles.googleButton} onPress = {() => {onGoogleButtonPress()}}>
                        <Image style={styles.googleIcon} source={{ uri: "https://i.ibb.co/j82DCcR/search.png"}}/>
                        <Text style={styles.googleButtonText}>Sign in with Google</Text>
                    </TouchableOpacity>
                </View>
            </View>
            </SafeAreaView>
        );
    };

const styles = StyleSheet.create({
 safeArea: {
  backgroundColor: "#262b2f"
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