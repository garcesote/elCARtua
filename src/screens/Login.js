import React, {useState, useEffect} from 'react';
import 'expo-dev-client';

import {SafeAreaView, StatusBar, StyleSheet, View, Text, Dimensions, TouchableOpacity, Image} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';


const Login = ({navigation}) => {

    GoogleSignin.configure({
        webClientId: '800171513430-7qhs9k6nanqpa1cqv3isesi5q0at6bvd.apps.googleusercontent.com',
    });

    // Set an initializing state whilst Firebase connects
    const [initializing, setInitializing] = useState(true);
    const [user, setUser] = useState();

    // Handle user state changes
    function onAuthStateChanged(user) {
        setUser(user);

        console.log('Bienvenido: ');
        if(user){
            console.log(user.displayName);
        }
        if (initializing) setInitializing(false);
    }

    useEffect(() => {
        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
        return subscriber; // unsubscribe on unmount
    }, []);

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
            console.log(user.user.displayName);
        }).catch((error) => {
            console.log(error);
        })
    }

    if(user){
        navigation.navigate("Home");
        AsyncStorage.setItem("user_data",
            JSON.stringify({user, logged_in:true})
        );
    }else{
        console.log('NO USER!!');
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