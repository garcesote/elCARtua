import React, { useState, useEffect  } from 'react';
import { Button, Image, View, Text,StyleSheet, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import {launchCamera} from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';


import storage from '@react-native-firebase/storage';

const AddPicture = ({ route }) => {

  
  const [fileUri, setFileUri] = useState(null);
  const [groupID, setGroupID] = useState(null);
  const [name, setName] = useState(null);
  const [initializating, setInitializating] = useState(true);
  const [captured, setCaptured] = useState(false);

  const getData = async () => {
    const id = await AsyncStorage.getItem("groupId");
    setGroupID(route.params.groupId);
    setName(route.params.vehicle);
    const refStr = route.params.groupId+'_'+route.params.vehicle+'.jpeg';
    try{
      console.log('REF:'+refStr)
      const url = await storage().ref(refStr).getDownloadURL();
      setFileUri(url);
    }catch{
      console.log('no se han encontrado imagenes del vehiculo')
    }
  }

  useEffect(() => {
    getData().then(() => {
      //HACER AQUI PETICIÓN DE LA FOTO SI HAY
      setInitializating(false);
    });
  }, [])

  const selectImage = async () => {
    const options = {
      madiaType: 'photo',
      quality: 1
    };

    launchCamera(options, (response) => {

      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.uri };
        console.log('response', JSON.stringify(response));
        setFileUri(response.assets[0].uri);
        setCaptured(true)
      }
    });
    
  };
  
  const subirImagen = async() => {
    setInitializating(true);

    const refStr = groupID+'_'+name+'.jpeg';
    let reference = storage().ref(refStr);         
    let task = reference.putFile(fileUri);              

    task.then(() => {                                
        console.log('Image uploaded to the bucket!');
        Alert.alert('Imagen guardada correctamente');
        setInitializating(false);
    }).catch((e) => console.log('uploading image error => ', e));
    
  }

  const renderFileUri = () => {
    if (fileUri) {
      return (
        <View>
        <Image
          source={{ uri: fileUri }}
          style={styles.images}
          resizeMode="contain" 
        />{captured && <TouchableOpacity style={styles.button} onPress={() => subirImagen()}>
            <View style={styles.buttonCont}>
              <Text style={styles.text}>Actualizar Imagen</Text>
              <Icon name="download" style={{marginLeft:5}} size={30} color="black" />
            </View>
        </TouchableOpacity>
      }
      </View>
      )
    } else {
      return(
        <Text style={styles.text}> Pulse el botón para sacarle una foto al coche</Text>
      )
    }
  }
  if (initializating) {

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#000000" />
            <Text style={styles.loadingText}>Cargando...</Text>
        </View>
    );

  } else {
    return (

      <View style={styles.container}>
        <TouchableOpacity style={styles.button} onPress={() => selectImage()}>
          <View style={styles.buttonCont}>
            <Text style={styles.text}>Capturar Imagen</Text>
            <Icon name="camera" style={{marginLeft:5}} size={30} color="black" />
          </View>
        </TouchableOpacity>
        {renderFileUri()}
      </View>
      
    );
  }
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  button: {
    width: 'auto',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    margin: 10,
    padding:5,
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: 'lightgray'
  },

  buttonCont: {
    flexDirection:'row',
    justifyContent: 'space-between',
    padding:5

  },

  images: {
    borderRadius: 150,
    margin: 20,
    width: '100%', // Puedes ajustar el ancho según tus necesidades
    height: undefined, // Esto permite que la altura se ajuste automáticamente según el aspecto de la imagen
    aspectRatio: 1, // Esto asegura que la imagen se muestre en su relación de aspecto original
  },

  text: {
    fontSize: 18,
    fontWeight: 'bold',
    color:'black'
},

  loadingText: {
      marginTop: 16,
      fontSize: 18,
      fontWeight: 'bold',
      color:'black'
  },
});

export default AddPicture;
