import { firebase } from '@react-native-firebase/database';

const referenceDB = firebase
  .app()
  .database('https://elcartua-default-rtdb.europe-west1.firebasedatabase.app/')
  .ref('/users');

export default referenceDB;