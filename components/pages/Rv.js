import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';
import logo_afella from '../../public/logo-afella.png';
import {useSelector, useDispatch} from 'react-redux';
import {dispatchGetClient} from '../../redux/actions/authAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused} from '@react-navigation/native';
import moment from 'moment';
import 'moment/locale/fr';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import messaging from '@react-native-firebase/messaging';
import {apiUrl} from '../api';

const Rv = ({navigation}) => {
  const auth = useSelector(state => state.auth);
  const [isConnected, setisConnected] = useState(false);
  const [rvList, setrvList] = useState([]);
  const [isLoading, setisLoading] = useState(true);
  const [newRv, setnewRv] = useState(false);
  const isFocused = useIsFocused();
  moment.locale('fr');

  const dispatch = useDispatch();

  useEffect(() => {
    messaging().onMessage(rm => {
      if (notification.data.handle.hasOwnProperty('screen')) {
        if (notification.data.handle.screen === 'Rendez-vous') {
          setnewRv(!newRv);
        }
      }
    });
  }, []);

  useEffect(() => {
    if (isFocused) {
      if (auth.token !== '') {
        setisConnected(true);
        fetchRv();
      } else {
        setisConnected(false);
      }
    }
  }, [newRv, isFocused]);

  const fetchRv = async () => {
    try {
      const res = await axios.get(`${apiUrl}/client/rv`, {
        headers: {
          Authorization: auth.token,
        },
      });
      setrvList(res.data);
      setisLoading(false);
    } catch (err) {
      if (err.response.data.msg === 'Your Bloqued') {
        dispatch(dispatchGetClient({data: {client: {}, access_token: ''}}));
        await AsyncStorage.removeItem('firstLogin');
        setisConnected(false);
      }
      setisLoading(false);
    }
  };

  const getDirection = location => {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=${location[0]},${location[1]}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => {});
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View
        style={{
          borderBottomColor: '#ccc',
          borderBottomWidth: 1,
          borderBottom: 1,
          paddingVertical: 12,
          backgroundColor: '#fff',
        }}>
        {/*<Ionicons
          style={{
            position: 'absolute',
            paddingTop: 12,
            paddingLeft: 15,
            alignSelf: 'flex-start',
          }}
          onPress={() => {
            navigation.openDrawer();
          }}
          name="menu"
          color={'#aaa'}
          size={32}
        />*/}
        <Image
          style={{
            width: '30%',
            height: 35,
            resizeMode: 'contain',
            alignSelf: 'center',
          }}
          source={logo_afella}
        />
      </View>
      {isConnected && (
        <>
          {isLoading ? (
            <ActivityIndicator
              style={{marginTop: 20}}
              size="large"
              color="#222"
            />
          ) : (
            <ScrollView>
              {rvList.length > 0 ? (
                <>
                  {rvList.map(rv => (
                    <TouchableOpacity
                      key={rv._id}
                      onPress={() => navigation.navigate('Appointment', rv)}
                      style={{
                        margin: 10,
                        backgroundColor: '#fff',
                        borderRadius: 15,
                        elevation: 5,
                        minHeight: 70,
                        zIndex: -1,
                      }}>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                        }}>
                        <View
                          style={{
                            width: '80%',
                            paddingLeft: 10,
                            justifyContent: 'space-around',
                            paddingVertical: 7,
                          }}>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontSize: 12,
                              color: '#aaa',
                            }}>
                            N°: {rv._id}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={{
                              fontWeight: 'bold',
                              fontSize: 16,
                              color: rv.team === null ? '#9b945f' : '#333',
                            }}>
                            Avec{' '}
                            {rv.team === null ? rv.salon.name : rv.team.name}
                          </Text>
                          {rv.team !== null && (
                            <Text
                              numberOfLines={1}
                              style={{
                                fontWeight: 'bold',
                                fontSize: 16,
                                color: '#9b945f',
                              }}>
                              De {rv.salon.name}
                            </Text>
                          )}
                          <Text
                            numberOfLines={2}
                            style={{
                              textAlign: 'justify',
                            }}>
                            {moment(rv.date).calendar()}
                          </Text>
                        </View>
                        <View
                          style={{
                            width: '20%',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignSelf: 'center',
                          }}>
                          {rv.status !== 'accepted' ? (
                            <MaterialCommunityIcons
                              style={{
                                marginRight: 5,
                              }}
                              name="timer-sand"
                              color={'#C17112'}
                              size={34}
                            />
                          ) : (
                            <>
                              <MaterialCommunityIcons
                                name="check"
                                color={'#137522'}
                                size={34}
                              />
                              {rv.salon.location !== [33.5944, -7.59207] && (
                                <FontAwesome5
                                  style={{marginBottom: 7}}
                                  onPress={() =>
                                    getDirection(rv.salon.location)
                                  }
                                  name="route"
                                  color={'#9b945f'}
                                  size={23}
                                />
                              )}
                            </>
                          )}
                        </View>
                      </View>
                      {rv.status === 'waiting salon' && (
                        <View
                          style={{
                            flex: 0,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                          <ActivityIndicator size="small" color="#C17112" />
                          <Text
                            style={{
                              textAlign: 'center',
                              color: '#C17112',
                              fontSize: 15,
                              margin: 10,
                            }}>
                            Attente confirmation de salon
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </>
              ) : (
                <Text
                  style={{
                    fontWeight: 'bold',
                    textAlign: 'center',
                    color: '#ccc',
                    textTransform: 'uppercase',
                    marginTop: 15,
                    fontSize: 18,
                  }}>
                  Pas de rendez-vous
                </Text>
              )}
            </ScrollView>
          )}
        </>
      )}
      {auth.token === '' && (
        <TouchableOpacity
          style={{
            backgroundColor: '#9b945f',
            borderRadius: 10,
            padding: 10,
            marginTop: 50,
            width: '50%',
            alignSelf: 'center',
            elevation: 5,
          }}
          onPress={() => navigation.navigate('Auth')}>
          <Text
            style={{
              color: 'white',
              textAlign: 'center',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}>
            CONNECTER
          </Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

export default Rv;
