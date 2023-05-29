import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/database';
import FormContainer from '../components/FormContainer';
import CarContainer from '../components/CarContainer';
import { Alert } from 'react-native';
import { subscribe } from 'diagnostics_channel';
import messaging from '@react-native-firebase/messaging';


const Home = ({ navigation }) => {

    const usersRef = firebase
        .app()
        .database('https://elcartua-default-rtdb.europe-west1.firebasedatabase.app/')
        .ref('/users');

    const groupsRef = firebase
        .app()
        .database('https://elcartua-default-rtdb.europe-west1.firebasedatabase.app/')
        .ref('/groups/');

    const [userLocalData, setUserLocalData] = useState("");
    const [userCloudData, setUserCloudData] = useState("");
    const [groupData, setGroupData] = useState("");
    const [initializating, setInitializating] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [groupID, setGroupID] = useState("");
    const [confirmVisible, setConfirmVisible] = useState(false);


    const logout = () => {
        auth()
            .signOut()
            .then(() => {
                console.log('User signed out!');
                navigation.replace("Login");
            }
            );
    }

    useEffect(() => {
        // subscribeToGroupNotifications("test");
        //Recoge la info acerca de la sesión iniciada (usuarioLocal, usuarioNube, grupo)
        getLocalUserID().then(id => {
            getCloudUserData(id).then(id => {
                //Si el usuario tiene grupo cargo la info de grupo
                if (id != 'null') {
                    getGroupData(id);
                }
                setInitializating(false);
            })
        })
    }, []);

    const reloadPage = () => {
        setInitializating(true);
        //Recoge la info acerca de la sesión iniciada (usuarioLocal, usuarioNube, grupo)
        getLocalUserID().then(id => {
            getCloudUserData(id).then(id => {
                //Si el usuario tiene grupo cargo la info de grupo
                if (id != 'null') {
                    AsyncStorage.setItem("user_data",
                        JSON.stringify({
                            userName: userLocalData.userName, userID: userLocalData.userID, mail: userLocalData.mail,
                            photoURL: userLocalData.photoURL, logged_in: true, groupId: id
                        })
                    );
                    getGroupData(id);
                }
                setInitializating(false);
            })
        })
        setInitializating(false);
    }

    const newGroupForm = () => {
        setShowForm(true);
    };

    const onSend = () => {
        reloadPage();
        setShowForm(false);
    };

    const onBack = () => {
        setShowForm(false);
    };

    const showConfirmDialog = () => {
        setConfirmVisible(true);
    };

    const handleDelete = () => {
        setConfirmVisible(false);
        deleteGroup();
    };

    const handleCancel = () => {
        setConfirmVisible(false);
    };

    const getLocalUserID = async () => {
        try {
            const userData = await AsyncStorage.getItem("user_data");
            setUserLocalData(JSON.parse(userData));
            console.log('USER LOCAL:', JSON.parse(userData));
            if(JSON.parse(userData).userID){
                return (JSON.parse(userData).userID);
            }
        } catch (error) {
            console.error('Error al consultar AsyncStorage: ', error);
            throw error;
        }
    }

    const getCloudUserData = async (id) => {
        try {
            const snapshot = await usersRef.child(id).once('value');
            const userData = snapshot.val();
            setUserCloudData(userData);
            console.log('USUARIO CLOUD DATA: ', userData);
            return (userData.group);
        } catch (error) {
            console.error('Error al consultar la base de datos: ', error);
            throw error;
        }
    }

    const getGroupData = async (id) => {
        try {
            const snapshot = await groupsRef.child(id).once('value');
            const groupData = snapshot.val();
            setGroupData({ groupData, id: id });
            AsyncStorage.setItem("groupId", id);
            console.log('USUARIO GRUPO DATA: ', { groupData, id: id });
        } catch (error) {
            console.error('Error al consultar la base de datos: ', error);
            throw error;
        }
    }

    const subscribeToGroupNotifications = (topic) => {
        messaging()
            .getToken()
            .then(token => {
                // Suscribir al dispositivo al tema
                messaging()
                    .subscribeToTopic(topic)
                    .then(() => {
                        console.log('Dispositivo suscrito al topic ' + topic);
                    })
                    .catch(error => {
                        console.log('Error al suscribir el dispositivo al tema:', error);
                    });
            })
            .catch(error => {
                console.log('Error al obtener el token de registro:', error);
            });
    }

    const unsubscribeFromGroupNotifications = (topic) => {
        messaging()
            .unsubscribeFromTopic(topic)
            .then(() => {
                console.log('Desuscripción exitosa del tema:', topic);
            })
            .catch(error => {
                console.log('Error al desuscribirse del tema:', error);
            });
    }

    const joinGroup = async () => {
        // Compruebo si existe ya el grupo
        try {
            const snapshot = await groupsRef.once('value');
            const groupsData = snapshot.val();
            console.log(groupsData);
            console.log(groupsData.hasOwnProperty(groupID));
            // Si es así
            if (groupsData.hasOwnProperty(groupID)) {
                const key = userLocalData.userID;
                console.log(key);
                // Añado el grupo al usuario
                usersRef.child(key).update({
                    group: groupID,
                });
                console.log('GROUP_DATA: ');
                console.log(groupsData)
                console.log('GROUP_ID: ');
                console.log(groupID);
                const strID = groupID.toString();
                console.log('GROUP_DATA_GROUP: ');
                console.log(groupsData[strID]);
                //Añado al grupo el usuario
                if(groupsData[groupID]){
                    console.log('USERS:'+ groupsData[strID].users);
                    const users = groupsData[strID].users;
                    users.push(userLocalData);
                    groupsRef.child(groupID).update({
                        users: users,
                    })
                }
                subscribeToGroupNotifications(groupID);
                Alert.alert('Te has unido correctamente al grupo:' + groupID);
                console.log('El usuario se ha unido al grupo:', groupID);
                reloadPage();
            } else {
                Alert.alert('El código ' + groupID + ' no pertenece a ningún grupo');
            }
        } catch (error) {
            console.error('Error al consultar la base de datos: ', error);
            throw error;
        }
    };

    const deleteGroup = async () => {
        //Actualiza la página por si hay usuarios que justo se han unido
        reloadPage()
        if (groupData) {
            try {
                console.log('USERS: ');
                console.log(groupData.groupData.users);
                groupData.groupData.users.map(user => {
                    const key = user.userID;
                    console.log('KEYY:'+key);
                    // Añado el grupo al usuario
                    usersRef.child(key).update({
                        group: 'null',
                    });
                })
                const groupKey = groupData.id;
                groupsRef.child(groupKey).remove();
                unsubscribeFromGroupNotifications(groupKey);
                Alert.alert('El grupo se ha borrado correctamente');
                reloadPage();
            } catch {
                console.error('Error al consultar al borrar el grupo de la db: ', error);
                throw error;
            }
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

        if (showForm) {
            const userData = userLocalData;
            delete userData.logged_in
            return (
                <View style={styles.container}>
                    <FormContainer onSend={onSend} onBack={onBack} userData={userData} />
                </View>
            )
        } else {
            if (userCloudData.group == 'null') {
                return (
                    <SafeAreaView style={styles.container}>
                        <View style={styles.container}>
                            <Text style={styles.text}>Bienvenido {userLocalData.userName}!!!</Text>
                            <Text style={styles.text}>Parece que todavía no te has unido a un grupo</Text>
                            <Text style={styles.text}>Prueba a crear uno o unirte a uno ya creado introduciendo el código</Text>
                        
                            <TouchableOpacity style={styles.button} onPress={newGroupForm}>
                                <Text style={styles.text}>Crear un grupo</Text>
                            </TouchableOpacity>
                            <TextInput
                                style={styles.input}
                                placeholder="Código del grupo"
                                value={groupID}
                                placeholderTextColor="gray"
                                onChangeText={text => setGroupID(text)}
                            />
                            <TouchableOpacity style={styles.button} onPress={() => joinGroup()}>
                                <Text style={styles.text}>Unirse al grupo</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.button, { backgroundColor: '#FF6666' }]} onPress={() => logout()}>
                                <Text style={styles.text}>Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                )
            } else {
                if (groupData.groupData) {
                    console.log(groupData.groupData)
                    return (
                        <SafeAreaView style={styles.container}>
                            <View>
                                <Text style={styles.text}>Bienvenido {userLocalData.userName}!!</Text>
                            </View>
                            <View>
                                <Text style={styles.text}>Tu grupo es el gupo: </Text>
                                <Text style={styles.title}>{groupData.groupData.name}</Text>
                                <Text style={styles.text}>Comparte este número para que familiares o amigos se unan al grupo: </Text>
                                <Text style={styles.title}>{groupData.id}</Text>
                                <Text style={styles.text}>Pincha en el coche para reservar las horas</Text>
                            </View>
                            {groupData.groupData.vehicles.map((vehicle, index) => (
                                <CarContainer key={index} groupId={userCloudData.group} book={groupData} nombre={vehicle} navigation={navigation} />
                            ))}
                            <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]}
                                onPress={showConfirmDialog}>
                                <Text style={styles.text}>Eliminar grupo</Text>
                            </TouchableOpacity>
                            {confirmVisible && (
                                <View style={styles.container}>
                                    <Text style={styles.text}>¿Estás seguro de que quieres eliminar el grupo?</Text>
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity style={[styles.button, { backgroundColor: 'red' }]} onPress={handleDelete}>
                                            <Text style={styles.text}>Confirmar</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.button} onPress={handleCancel}>
                                            <Text style={styles.text}>Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            <TouchableOpacity style={[styles.button, { backgroundColor: '#FF6666' }]}
                                onPress={() => logout()}>
                                <Text style={styles.text}>Logout</Text>
                            </TouchableOpacity>
                        </SafeAreaView>
                    );
                }
            }
        }
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black'
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
    input: {
        width: 200,
        height: 40,
        margin: 20,
        borderColor: 'gray',
        color: 'black',
        borderWidth: 1,
        paddingHorizontal: 8,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'black'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 5,
        borderRadius: 6,
        
    },
    text: {
        margin: 5,
        color: 'black',
        fontSize: 18,
    },
});

export default Home;