import React, {useState, useEffect} from 'react';
import {
  View,
  KeyboardAvoidingView,
  TextInput,
  StyleSheet,
  Text,
  Platform,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import logo_afella from '../../public/logo-afella.png';
import bg from '../../public/background.jpg';
import {useDispatch, useSelector} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Loading from './Loading';
import {dispatchGetClient} from '../../redux/actions/authAction';
import {dispatchSetNot} from '../../redux/actions/notAction';
import messaging from '@react-native-firebase/messaging';
import {apiUrl} from '../api';
import auth from '@react-native-firebase/auth';

const Auth = ({navigation}) => {
  const [isRegister, setisRegister] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [login, setLogin] = useState({name: '', phone: ''});
  const [err, setErr] = useState('');
  const [confirm, setConfirm] = useState(null);
  const [code, setCode] = useState('');
  const [firebaseToken, setfirebaseToken] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    const checkToken = async () => {
      try {
        const notification = await messaging().getToken();
        dispatch(dispatchSetNot(notification));
        const res = await axios.delete(
          `${apiUrl}/not/delete_not/${notification}`,
        );
        if (res.data.deleted) {
          await messaging().deleteToken();
          const newNot = await messaging().getToken();
          dispatch(dispatchSetNot(newNot));
        }
      } catch (err) {}
    };
    checkToken();
  }, []);

  useEffect(() => {
    auth().onAuthStateChanged(user => {
      if (user) {
        const loginUser = async () => {
          setisLoading(true);
          const notification = await messaging().getToken();
          const fbToken = await auth().currentUser.getIdToken();
          setfirebaseToken(fbToken);
          setLogin({...login, ['phone']: user.phoneNumber});
          try {
            const res = await axios.post(
              `${apiUrl}/client/login`,
              {
                phone: user.phoneNumber,
                mobileNotification: notification,
              },
              {
                headers: {
                  Authorization: fbToken,
                },
              },
            );
            await AsyncStorage.setItem('firstLogin', JSON.stringify(true));
            dispatch(dispatchGetClient(res));
            auth().signOut();
            navigation.navigate('Footer');
          } catch (err) {
            setConfirm(null);
            if (err.response.data.msg === 'This client does not exist') {
              setisRegister(true);
            } else {
              setErr(err.response.data.msg);
            }
            setisLoading(false);
          }
        };
        loginUser();
      }
    });
  }, []);

  const handleInputLoginChange = (text, from) => {
    setErr('');
    setLogin({...login, [from]: text});
  };

  async function loginWithPhoneNumber(phoneNumber) {
    setisLoading(true);
    if (login.phone === '') {
      setErr('veuillez remplir tous les champs');
      setisLoading(false);
      return;
    }

    if (login.phone.length < 9) {
      setErr('numéro de téléphone invalide');
      setisLoading(false);
      return;
    }
    const confirmation = await auth().signInWithPhoneNumber(
      '+212' + phoneNumber,
    );
    setConfirm(confirmation);
    setCode('');
    setisLoading(false);
  }

  const handleSubmit = async () => {
    setisLoading(true);
    try {
      await confirm.confirm(code);
    } catch (err) {
      setErr("Code n'est pas valide");
      setisLoading(false);
    }
  };

  const handleRegister = async () => {
    setisLoading(true);
    const notification = await messaging().getToken();
    try {
      const res = await axios.post(
        `${apiUrl}/client/register`,
        {
          name: login.name,
          phone: login.phone,
          mobileNotification: notification,
        },
        {
          headers: {
            Authorization: firebaseToken,
          },
        },
      );
      await AsyncStorage.setItem('firstLogin', JSON.stringify(true));
      dispatch(dispatchGetClient(res));
      auth().signOut();
      navigation.navigate('Footer');
    } catch (err) {
      setErr(err.response.data.msg);
      setisLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <ImageBackground source={bg} style={styles.bgImage}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <Image
              style={{
                width: '70%',
                height: 40,
                resizeMode: 'contain',
                alignSelf: 'center',
                marginBottom: 40,
              }}
              source={logo_afella}
            />
            {err !== '' && (
              <Text
                style={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#E54545',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}>
                {err}
              </Text>
            )}
            <View>
              {isRegister && (
                <>
                  <TextInput
                    placeholder="Nom et prenom"
                    style={styles.textInput}
                    onChangeText={text => handleInputLoginChange(text, 'name')}
                  />
                  <TouchableOpacity
                    style={{
                      alignItems: 'center',
                      backgroundColor: '#216839',
                      padding: 10,
                      borderRadius: 10,
                      elevation: 5,
                      marginBottom: 20,
                    }}
                    onPress={handleRegister}>
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#fff',
                        letterSpacing: 1,
                      }}>
                      INSCRIVER
                    </Text>
                  </TouchableOpacity>
                </>
              )}
              {!isRegister &&
                (confirm === null ? (
                  <>
                    <View
                      style={{
                        flex: 0,
                        flexDirection: 'row',
                        marginBottom: 20,
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <Text
                        style={{
                          width: '25%',
                          backgroundColor: '#ddd',
                          borderBottomLeftRadius: 10,
                          borderTopLeftRadius: 10,
                          paddingVertical: 13,
                          paddingHorizontal: 10,
                        }}>
                        🇲🇦 +212
                      </Text>
                      <TextInput
                        placeholder="Numéro de téléphone"
                        keyboardType="phone-pad"
                        maxLength={10}
                        style={{
                          width: '75%',
                          height: 45,
                          backgroundColor: '#ddd',
                          borderBottomRightRadius: 10,
                          borderTopRightRadius: 10,
                        }}
                        onChangeText={text =>
                          handleInputLoginChange(text, 'phone')
                        }
                      />
                    </View>
                    <TouchableOpacity
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#9b945f',
                        padding: 10,
                        borderRadius: 10,
                        elevation: 5,
                        marginBottom: 20,
                      }}
                      onPress={() => loginWithPhoneNumber(login.phone)}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: '#fff',
                          letterSpacing: 1,
                        }}>
                        CONNECTER
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TextInput
                      secureTextEntry={true}
                      placeholder="Code de vérification par sms"
                      keyboardType="number-pad"
                      style={styles.textInput}
                      onChangeText={text => {
                        setErr('');
                        setCode(text);
                      }}
                    />
                    <TouchableOpacity
                      style={{
                        alignItems: 'center',
                        backgroundColor: '#9b945f',
                        padding: 10,
                        borderRadius: 10,
                        elevation: 5,
                        marginBottom: 20,
                      }}
                      onPress={handleSubmit}>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          color: '#fff',
                          letterSpacing: 1,
                        }}>
                        VERIFIER
                      </Text>
                    </TouchableOpacity>
                  </>
                ))}
            </View>
          </KeyboardAvoidingView>
        </ImageBackground>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingHorizontal: 20,
    height: '100%',
  },
  textInput: {
    height: 45,
    backgroundColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
  },
});

export default Auth;
