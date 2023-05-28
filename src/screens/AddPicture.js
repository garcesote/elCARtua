import React, { useState } from 'react';
import { Button, Image, View, Text,StyleSheet } from 'react-native';
import {launchCamera} from 'react-native-image-picker';

import { utils } from '@react-native-firebase/app';
import storage from '@react-native-firebase/storage';

const AddPicture = () => {

  const [fileUri, setFileUri] = useState(null);

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
        setFileUri(response.assets[0].uri)
      }
    });
    
  };
  
  const subirImagen = async() => {

  }
  const renderFileUri = () => {
    if (fileUri) {
      return (
        <View>
        <Image
          source={{ uri: fileUri }}
          style={styles.images}
          resizeMode="contain" 
        />
        <Button styles={styles.button} title="Seleccionar imagen" onPress={() => subirImagen()} />
      </View>
      )
    } else {
      return(
        <Text style={{fontSize:16}}> Pulse el botón para sacarle una foto al coche</Text>
      )
    }
  }

  return (

    <View style={styles.container}>
      <Button styles={styles.button} title="Seleccionar imagen" onPress={selectImage} />
      {renderFileUri()}
    </View>
    
  );
};

const styles = StyleSheet.create({

  container: {
      padding: 10,
      alignItems: 'center',
  },

  button: {
    margin:5,
    backgroundColor: 'blue',
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
  },

  images: {
    margin: 20,
    width: '100%', // Puedes ajustar el ancho según tus necesidades
    height: undefined, // Esto permite que la altura se ajuste automáticamente según el aspecto de la imagen
    aspectRatio: 1, // Esto asegura que la imagen se muestre en su relación de aspecto original
  },
});

export default AddPicture;
