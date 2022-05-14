import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Alert,
} from 'react-native';
import axios from 'axios';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {RNCamera} from 'react-native-camera';
import {useSelector, useDispatch} from 'react-redux';
import {dispatchGetClient} from '../../redux/actions/authAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import bg from '../../public/background.jpg';
import qrM from '../../public/qrM.png';
import Loading from './Loading';
import analytics from '@react-native-firebase/analytics';
import {apiUrl} from '../api';

const Scan = ({navigation}) => {
  const {client, token} = useSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();

  const onSuccess = async e => {
    setIsLoading(true);
    try {
      const res = await axios.delete(`${apiUrl}/client/transaction/${e.data}`, {
        headers: {
          Authorization: token,
        },
      });
      try {
        await analytics().logEvent('qr_scanned', {
          client: {id: client._id, name: client.name},
          salon: {
            id: res.data.transaction.salon._id,
            name: res.data.transaction.salon.name,
          },
          type: res.data.transaction.type,
          price: res.data.transaction.price,
        });
      } catch (err) {}
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      navigation.navigate('Wallets');
    } catch (err) {
      if (err.response.data.msg === 'Your Bloqued') {
        dispatch(dispatchGetClient({data: {client: {}, access_token: ''}}));
        await AsyncStorage.removeItem('firstLogin');
        navigation.navigate('Home');
      } else {
        try {
          await analytics().logEvent('qr_scanned_error', {
            error: err.response.data.msg,
          });
        } catch (err) {}
        setIsLoading(false);
        Alert.alert(`Transfer Annuler`, err.response.data.msg, [
          {
            text: 'Ok',
            onPress: () => navigation.navigate('Footer'),
          },
        ]);
      }
    }
  };

  return (
    <ImageBackground source={bg} style={styles.bgImage}>
      {isLoading ? (
        <Loading />
      ) : (
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.off}
          reactivate={true}
          showMarker={true}
          topContent={
            <Text style={styles.centerText}>
              Scannez <Text style={styles.textBold}>le QRCode</Text>
              {'\n'}
              <Text
                style={{fontWeight: 'bold', color: '#9b945f', fontSize: 24}}>
                de votre salon
              </Text>
            </Text>
          }
          bottomContent={
            <TouchableOpacity
              style={styles.buttonTouchable}
              onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>Retourner</Text>
            </TouchableOpacity>
          }
          customMarker={
            <Image
              style={{
                width: 200,
                height: 200,
              }}
              source={qrM}
            />
          }
        />
      )}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 20,
    padding: 32,
    color: '#777',
    textAlign: 'center',
  },
  textBold: {
    fontWeight: 'bold',
    color: '#000',
  },
  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  buttonTouchable: {
    marginTop: 55,
    padding: 16,
    backgroundColor: '#9b945f',
    elevation: 5,
  },
  bgImage: {
    flex: 1,
    resizeMode: 'cover',
  },
});

export default Scan;
