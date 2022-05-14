import React, {useState, useEffect} from 'react';
import {
  ImageBackground,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import {useSelector} from 'react-redux';
import bg from '../../public/background.jpg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {apiUrl} from '../api';

const Wallets = ({navigation}) => {
  const token = useSelector(state => state.auth.token);
  const [isLoading, setisLoading] = useState(false);
  const [wallets, setwallets] = useState([]);

  useEffect(async () => {
    setisLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/client/wallets`, {
        headers: {
          Authorization: token,
        },
      });
      setwallets(res.data.wallets);
      setisLoading(false);
    } catch (err) {
      setisLoading(false);
    }
  }, []);

  return (
    <>
      <ImageBackground
        source={bg}
        style={{
          flex: 1,
          resizeMode: 'cover',
        }}>
        <MaterialCommunityIcons
          style={{
            position: 'absolute',
            padding: 2,
            backgroundColor: '#ebebeb',
            borderRadius: 20,
            margin: 15,
            zIndex: 1,
          }}
          onPress={() => navigation.goBack()}
          name="window-close"
          color={'black'}
          size={30}
        />
        <Text
          numberOfLines={1}
          style={{
            marginTop: 15,
            fontSize: 28,
            color: '#333',
            textAlign: 'center',
            fontFamily: 'Painting_With_Chocolate',
          }}>
          Mes Portefeuilles
        </Text>
        {isLoading ? (
          <ActivityIndicator
            style={{marginTop: 20}}
            size="large"
            color="#222"
          />
        ) : wallets.length > 0 ? (
          <ScrollView>
            <View
              style={{
                flex: 0,
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
                marginVertical: 20,
              }}>
              {wallets.map(wallet => (
                <View
                  key={wallet._id}
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#fff',
                    padding: 12,
                    borderRadius: 10,
                    marginVertical: 10,
                    width: '95%',
                    borderWidth: 2,
                    borderColor: '#9b945f',
                    borderStyle: 'dotted',
                  }}>
                  <View
                    style={{
                      flex: 0,
                      flexDirection: 'row',
                      alignItems: 'center',
                      width: '60%',
                    }}>
                    <Ionicons
                      style={{
                        marginRight: 5,
                      }}
                      name="wallet"
                      color={'#777'}
                      size={22}
                    />
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#333',
                      }}>
                      {wallet.salon.name}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      color: '#9b945f',
                      fontWeight: 'bold',
                    }}>
                    {wallet.money.toFixed(2) + ' ' + 'DH'}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>
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
            Pas de Portefeuille
          </Text>
        )}
      </ImageBackground>
    </>
  );
};

export default Wallets;
