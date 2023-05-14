import React, {useState, useEffect} from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import referenceDB from '../comun/firebase';



const Home = ({navigation}) => {

    const [userName, setUserName] = useState("");

    const logout = () => {
        auth()
        .signOut()
        .then(() => {
            console.log('User signed out!');
            navigation.navigate("Login");}
        );
    }

    useEffect(() => {
        getUserData();
    },[]);

    const getUserData = async () => {
        const userData = await AsyncStorage.getItem("user_data"); 
        console.log(JSON.parse(userData));
        if(userData){
            setUserName(JSON.parse(userData).user.displayName);
        }
    }
    
    referenceDB.on('value', snapshot => {
        console.log('Userdatat: ',snapshot.val());
    })

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