import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/database';


const Home = ({navigation}) => {

    const usersRef = firebase
        .app()
        .database('https://elcartua-default-rtdb.europe-west1.firebasedatabase.app/')
        .ref('/users');
    
    const groupsRef = firebase
        .app()
        .database('https://elcartua-default-rtdb.europe-west1.firebasedatabase.app/')
        .ref('/groups/');
    
    const [userName, setUserName] = useState("");
    const [userCloudData, setUserCloudData] = useState("");

    const logout = () => {
        auth()
        .signOut()
        .then(() => {
            console.log('User signed out!');
            navigation.navigate("Login");}
        );
    }

    useEffect(() => {
        //Recoge la info acerca de la sesión iniciada
        getLocalUserID().then(id =>{
            console.log('ID: ',id);
            getCloudUserData(id);
        })
    },[]);


    const getLocalUserID = async () => {
        try{
            const userData = await AsyncStorage.getItem("user_data");
            setUserName(JSON.parse(userData).userName);
            console.log('USER:', JSON.parse(userData))
            return(JSON.parse(userData).userID); 
        }catch (error) {
            console.error('Error al consultar AsyncStorage: ', error);
            throw error;
          }
    }
    
    const getCloudUserData = async (id) => {
        try{
            const snapshot = await usersRef.child(id).once('value');
            const userData = snapshot.val();
            setUserCloudData(userData);
            console.log('USUARIO CLOUD DATA: ', userData);
        }catch (error) {
            console.error('Error al consultar la base de datos: ', error);
            throw error;
        }
    }
    
    return (
        <SafeAreaView>
            <View>
            <Text>Bienvenido {userName}</Text>
            </View>
            <TouchableOpacity style={{ width: 'auto', height: 50, alignItems: 'center', margin: 2, justifyContent: 'center', borderWidth: 2}} 
            onPress={() => logout()}>
            <Text >Logout</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

export default Home;