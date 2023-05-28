import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import { firebase } from '@react-native-firebase/database';
import FormContainer from '../components/FormContainer';
import CarContainer from '../components/CarContainer';
import { Alert } from 'react-native';


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
                navigation.navigate("Login");
            }
            );
    }

    useEffect(() => {
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
                console.log(groupData.groupData.users);
                groupData.groupData.users.map(user => {
                    const key = user.userID;
                    console.log(key);
                    // Añado el grupo al usuario
                    usersRef.child(key).update({
                        group: 'null',
                    });
                })
                const groupKey = groupData.id;
                groupsRef.child(groupKey).remove();
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
                    <SafeAreaView>
                        <View>
                            <Text style={styles.text}>Bienvenido {userLocalData.userName}!!!</Text>
                            <Text style={styles.text}>Parece que todavía no te has unido a un grupo</Text>
                            <Text style={styles.text}>Prueba a crear uno o unirte a uno ya creado introduciendo el código</Text>
                        </View>
                        <TouchableOpacity style={styles.button} onPress={newGroupForm}>
                            <Text style={styles.text}>Crear un grupo</Text>
                        </TouchableOpacity>
                        <TextInput
                            style={styles.input}
                            placeholder="Código del grupo"
                            value={groupID}
                            onChangeText={text => setGroupID(text)}
                        />
                        <TouchableOpacity style={styles.button} onPress={() => joinGroup()}>
                            <Text style={styles.text}>Unirse al grupo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={() => logout()}>
                            <Text style={styles.text}>Logout</Text>
                        </TouchableOpacity>

                    </SafeAreaView>
                )
            } else {
                if (groupData.groupData) {
                    console.log(groupData.groupData)
                    return (
                        <SafeAreaView>
                            <View>
                                <Text style={styles.text}>Bienvenido {userLocalData.userName}!!</Text>
                            </View>
                            <View>
                                <Text style={styles.text}>Tu grupo es el gupo: {groupData.groupData.name}</Text>
                                <Text style={styles.text}>Comparte este número para que familiares o amigos se unan al grupo: {groupData.id}</Text>
                                <Text style={styles.text}>Pincha en el coche para reservar las horas</Text>
                            </View>
                            {groupData.groupData.vehicles.map((vehicle, index) => (
                                <CarContainer key={index} groupId={userCloudData.group} nombre={vehicle} navigation={navigation} />
                            ))}
                            <TouchableOpacity style={styles.buttonDel}
                                onPress={showConfirmDialog}>
                                <Text style={styles.text}>Eliminar grupo</Text>
                            </TouchableOpacity>
                            {confirmVisible && (
                                <View>
                                    <Text style={styles.text}>¿Estás seguro de que quieres eliminar el grupo?</Text>
                                    <View style={styles.buttonContainer}>
                                        <TouchableOpacity style={styles.button} onPress={handleDelete}>
                                            <Text style={styles.text}>Confirmar</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity style={styles.button} onPress={handleCancel}>
                                            <Text style={styles.text}>Cancelar</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                            <TouchableOpacity style={styles.button}
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
    },
    button: {
        width: 'auto',
        height: 50,
        alignItems: 'center',
        margin: 2,
        justifyContent: 'center',
        borderWidth: 2
    },
    buttonDel: {
        backgroundColor: 'red',
        width: 'auto',
        height: 50,
        alignItems: 'center',
        margin: 2,
        justifyContent: 'center',
        borderWidth: 2
    },
    input: {
        width: 200,
        height: 40,
        margin: 20,
        borderColor: 'gray',
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
        marginBottom: 16,
    },
    input: {
        width: '100%',
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 8,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    text: {
        margin: 5,
        color: 'black',
        fontSize: 18,
    },
});

export default Home;