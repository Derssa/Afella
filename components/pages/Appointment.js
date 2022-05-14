import React, {useState, useEffect} from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {useSelector} from 'react-redux';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import 'moment/locale/fr';
import DefaultAvatar from '../../public/DAvatar.jpg';

const Appointment = ({route, navigation}) => {
  const auth = useSelector(state => state.auth);
  const rv = route.params;
  const [isConnected, setisConnected] = useState(false);
  moment.locale('fr');

  useEffect(() => {
    if (auth.token === '') {
      navigation.navigate('Auth');
    } else {
      setisConnected(true);
    }
  }, []);

  const getDirection = () => {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=${rv.salon.location[0]},${rv.salon.location[1]}`;
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
    <>
      {isConnected && (
        <>
          <ScrollView>
            <View
              style={{
                flex: 0,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
                marginTop: 70,
                marginBottom: 10,
                marginHorizontal: 20,
                alignSelf: 'center',
                backgroundColor: '#fff',
                elevation: 3,
                borderRadius: 20,
                height: 510,
                width: '95%',
                position: 'relative',
              }}>
              <Text
                style={{
                  fontSize: 24,
                }}>
                Ticket rendez-vous
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: '#888',
                }}>
                N°:{rv._id}
              </Text>
              <Image
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  margin: 20,
                  overlayColor: '#fff',
                }}
                source={
                  rv.salon.avatar === ''
                    ? DefaultAvatar
                    : {
                        uri: rv.salon.avatar,
                      }
                }
              />
              <Text
                style={{
                  color: '#9b945f',
                  fontSize: 22,
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}>
                {rv.salon.name}
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: '#888',
                  marginBottom: 20,
                }}>
                Pour {rv.salon.gender}
              </Text>
              {rv.coiff !== null && (
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: '#777',
                    }}>
                    {rv.coiff.name}
                  </Text>
                </View>
              )}
              {rv.team !== null && (
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                    }}>
                    Avec:{'  '}
                  </Text>

                  <Text
                    style={{
                      fontSize: 18,
                    }}>
                    {rv.team.name}
                  </Text>
                </View>
              )}
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginBottom: 20,
                  }}>
                  {moment(rv.date).calendar()}
                </Text>
              </View>

              {rv.status === 'accepted' && (
                <>
                  <FontAwesome5
                    onPress={getDirection}
                    name="route"
                    color={'#9b945f'}
                    size={30}
                  />
                  <View
                    style={{
                      flex: 0,
                      flexDirection: 'row',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <MaterialCommunityIcons
                      style={{
                        marginRight: 5,
                        marginTop: 18,
                      }}
                      name="check"
                      color={'#137522'}
                      size={34}
                    />
                    <Text
                      style={{
                        textAlign: 'center',
                        fontWeight: 'bold',
                        color: '#137522',
                        textTransform: 'uppercase',
                        marginTop: 20,
                        fontSize: 20,
                      }}>
                      Accepter
                    </Text>
                  </View>
                </>
              )}

              {rv.status === 'waiting salon' && (
                <View
                  style={{
                    flex: 0,
                    marginTop: 30,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ActivityIndicator size="small" color="#C17112" />
                  <Text
                    style={{
                      textAlign: 'center',
                      color: '#C17112',
                      fontSize: 16,
                      margin: 10,
                    }}>
                    Attente confirmation de salon
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
          <MaterialCommunityIcons
            style={{
              position: 'absolute',
              padding: 2,
              backgroundColor: '#ebebeb',
              borderRadius: 20,
              margin: 15,
            }}
            onPress={() => navigation.goBack()}
            name="window-close"
            color={'black'}
            size={30}
          />
        </>
      )}
    </>
  );
};

export default Appointment;
