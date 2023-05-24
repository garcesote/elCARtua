import React from 'react';
import { View, Text, Button } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
  webClientId: '800171513430-jmolcac4c9c5so4p33jflf3hobvnm61f.apps.googleusercontent.com',
  offlineAccess: true,
})

const Login = () => {

  const signinWithGoogle = async () => {
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    // console.log(googleCredential);
    console.log(auth().signInWithCredential(googleCredential));
  }

  return (
    <View>
      <Button title="Login con google" onPress={signinWithGoogle}></Button>
    </View>
  );
};

export default Login;