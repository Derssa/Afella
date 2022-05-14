import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  ImageBackground,
  ToastAndroid,
} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {useSelector} from 'react-redux';
import Nav from './Nav';
import bg from '../public/background.jpg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

function CustomDrawerContent({navigation}) {
  const auth = useSelector(state => state.auth);

  return (
    <ImageBackground
      source={bg}
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
      }}>
      {auth.token !== '' ? (
        <View
          style={{
            flex: 0,
            width: '100%',
            marginVertical: 30,
          }}>
          <Text
            style={{
              fontSize: 15,
              color: '#444',
              textAlign: 'center',
            }}>
            WELCOME
          </Text>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 24,
                color: '#9b945f',
                textAlign: 'center',
                fontFamily: 'Painting_With_Chocolate',
              }}>
              {auth.client.name}
            </Text>
            {auth.client.isValide === 'true' && (
              <MaterialIcons
                style={{
                  marginLeft: 5,
                  marginBottom: 5,
                }}
                name="verified"
                color={'#216839'}
                size={20}
              />
            )}
          </View>
          <View>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 1,
                borderStyle: 'dashed',
                borderColor: '#999',
                width: '100%',
                marginTop: 70,
              }}></View>
            <TouchableOpacity
              onPress={() =>
                auth.client.isValide === 'true'
                  ? navigation.navigate('Scan')
                  : ToastAndroid.show(
                      'Attender la vérification de votre compte',
                      ToastAndroid.SHORT,
                    )
              }
              style={{
                flex: 0,
                flexDirection: 'row',
                alignItems: 'center',
                padding: 15,
                width: '100%',
              }}>
              <MaterialCommunityIcons
                style={{
                  marginRight: 10,
                }}
                name="qrcode-scan"
                color={'#777'}
                size={25}
              />
              <Text
                style={{
                  color: '#444',
                  fontWeight: 'bold',
                  fontSize: 15,
                  textTransform: 'uppercase',
                }}>
                ca$h scanner
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 1,
                borderStyle: 'dashed',
                borderColor: '#999',
                width: '100%',
              }}></View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Wallets')}
              style={{
                flex: 0,
                flexDirection: 'row',
                alignItems: 'center',
                padding: 15,
                width: '100%',
              }}>
              <Ionicons
                style={{
                  marginRight: 10,
                }}
                name="wallet"
                color={'#777'}
                size={25}
              />
              <Text
                style={{
                  color: '#444',
                  fontWeight: 'bold',
                  fontSize: 15,
                  textTransform: 'uppercase',
                }}>
                Mes Portefeuilles
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 1,
                borderStyle: 'dashed',
                borderColor: '#999',
                width: '100%',
              }}></View>
            <TouchableOpacity
              onPress={() => navigation.navigate('Jobs')}
              style={{
                flex: 0,
                flexDirection: 'row',
                alignItems: 'center',
                padding: 15,
                width: '100%',
              }}>
              <MaterialCommunityIcons
                style={{
                  marginRight: 10,
                }}
                name="briefcase-search"
                color={'#777'}
                size={25}
              />
              <Text
                style={{
                  color: '#444',
                  fontWeight: 'bold',
                  fontSize: 15,
                  textTransform: 'uppercase',
                }}>
                Emploi & Stage
              </Text>
            </TouchableOpacity>
            <View
              style={{
                borderWidth: 1,
                borderRadius: 1,
                borderStyle: 'dashed',
                borderColor: '#999',
                width: '100%',
              }}></View>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={{
            backgroundColor: '#9b945f',
            borderRadius: 10,
            padding: 10,
            marginTop: 70,
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
      <View>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 32,
            marginBottom: 25,
            color: '#9b945f',
            textAlign: 'center',
            fontFamily: 'Painting_With_Chocolate',
          }}>
          AFELLA
        </Text>
      </View>
    </ImageBackground>
  );
}

const Drawer = createDrawerNavigator();

export default function DrawerC() {
  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}>
      <Drawer.Screen
        name="Home"
        component={Nav}
        options={{headerShown: false}}
      />
    </Drawer.Navigator>
  );
}
