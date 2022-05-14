import React, {useState, useEffect} from 'react';
import {View, Alert, ToastAndroid} from 'react-native';
import axios from 'axios';
import {apiUrl} from '../../api';
import {useSelector, useDispatch} from 'react-redux';
import {
  dispatchGetClient,
  dispatchUpdateClient,
} from '../../../redux/actions/authAction';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LikeButton = ({salon, deleteSalon}) => {
  const {client, token} = useSelector(state => state.auth);
  const [isLiked, setisLiked] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    try {
      if (client.favorites.find(salonId => salonId === salon._id)) {
        setisLiked(true);
      }
      return () => setisLiked(false);
    } catch (err) {
      setisLiked(false);
    }
  }, [client.favorites, salon._id]);

  const handleFollow = async () => {
    if (token !== '') {
      setisLiked(true);
      try {
        const res = await axios.patch(
          `${apiUrl}/client/salon/${salon._id}/follow`,
          null,
          {headers: {Authorization: token}},
        );
        dispatch(dispatchUpdateClient(res));
      } catch (err) {
        if (err.response.data.msg === 'Your Bloqued') {
          dispatch(dispatchGetClient({data: {client: {}, access_token: ''}}));
          await AsyncStorage.removeItem('firstLogin');
        }
      }
    } else {
      ToastAndroid.show('Connectez-vous', ToastAndroid.SHORT);
    }
  };

  const handleUnFollow = () => {
    Alert.alert(
      'Supprimer ' + salon.name + ' de votre favories',
      'Vous voulez vraiment supprimer ' +
        salon.name +
        ' de votre list favories?',
      [
        {
          text: 'Oui',
          onPress: async () => {
            setisLiked(false);
            deleteSalon(salon._id);
            try {
              const res = await axios.patch(
                `${apiUrl}/client/salon/${salon._id}/unfollow`,
                null,
                {headers: {Authorization: token}},
              );
              dispatch(dispatchUpdateClient(res));
            } catch (err) {
              if (err.response.data.msg === 'Your Bloqued') {
                dispatch(
                  dispatchGetClient({data: {client: {}, access_token: ''}}),
                );
                await AsyncStorage.removeItem('firstLogin');
              }
            }
          },
        },
        {
          text: 'Non',
          onPress: () => {},
          style: 'cancel',
        },
      ],
    );
  };

  return (
    <View
      style={{
        width: '20%',
        alignItems: 'center',
        alignSelf: 'center',
      }}>
      {isLiked ? (
        <MaterialCommunityIcons
          style={{
            marginRight: 5,
          }}
          onPress={handleUnFollow}
          name="heart"
          color={'#b73535'}
          size={34}
        />
      ) : (
        <MaterialCommunityIcons
          style={{
            marginRight: 5,
          }}
          onPress={handleFollow}
          name="heart-outline"
          color={'#777'}
          size={34}
        />
      )}
    </View>
  );
};

export default LikeButton;
