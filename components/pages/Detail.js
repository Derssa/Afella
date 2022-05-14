import React, {useState, useEffect, useCallback} from 'react';
import {
  Alert,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import {apiUrl} from '../api';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import axios from 'axios';
import {useSelector, useDispatch} from 'react-redux';
import {
  dispatchGetClient,
  dispatchUpdateClient,
} from '../../redux/actions/authAction';
import {dispatchGetPosts} from '../../redux/actions/postsAction';
import Photo from './postComponents/Photo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import analytics from '@react-native-firebase/analytics';
import DefaultAvatar from '../../public/DAvatar.jpg';

const Detail = ({route, navigation}) => {
  const {client, token} = useSelector(state => state.auth);
  const {posts} = useSelector(state => state.posts);
  const [isLiked, setisLiked] = useState(false);
  const [ispostLiked, setispostLiked] = useState(false);
  const salon = route.params;
  const [textShown, setTextShown] = useState(false);
  const [lengthMore, setLengthMore] = useState(false);
  const [lastPost, setlastPost] = useState();
  const [salonLikes, setsalonLikes] = useState(salon.favCount);
  const [postLikes, setpostLikes] = useState(0);
  const [isLoading, setisLoading] = useState(true);
  const [isRunned, setisRunned] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!isRunned) {
      try {
        if (client.favorites.find(salonId => salonId === salon._id)) {
          setisLiked(true);
          setisLoading(false);
        } else {
          setisLiked(false);
          setisLoading(false);
        }
        setisRunned(true);
      } catch (err) {
        setisLiked(false);
        setisLoading(false);
        setisRunned(true);
      }
    } else {
      return;
    }
  }, [client]);

  useEffect(async () => {
    if (token !== '') {
      try {
        const res = await axios.get(`${apiUrl}/client/lastpost/${salon._id}`);
        setlastPost(res.data);
        setpostLikes(res.data.likesCount);
        if (res.data.likes.find(clientId => clientId === client._id)) {
          setispostLiked(true);
        }
      } catch (err) {}
    }
  }, []);

  const toggleNumberOfLines = () => {
    setTextShown(!textShown);
  };

  const onTextLayout = useCallback(e => {
    setLengthMore(e.nativeEvent.lines.length > 2);
  }, []);

  const handleFollow = async () => {
    setisLiked(true);
    setsalonLikes(salonLikes + 1);
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
        navigation.goBack();
      }
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
            setsalonLikes(salonLikes - 1);
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
                navigation.goBack();
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

  const handleLike = async () => {
    setispostLiked(true);
    setpostLikes(postLikes + 1);
    try {
      await axios.patch(`${apiUrl}/client/post/${lastPost._id}/like`, null, {
        headers: {Authorization: token},
      });
      if (posts.length > 0) {
        //binary search
        let begin = 0;
        let end = posts.length - 1;
        while (begin <= end) {
          let center = Math.floor((begin + end) / 2);
          if (posts[center]._id === lastPost._id) {
            let postsClone = [...posts];
            postsClone[center].likesCount = postsClone[center].likesCount + 1;
            postsClone[center].isLiked = true;
            dispatch(dispatchGetPosts(postsClone));
            break;
          } else if (lastPost._id < posts[center]._id) {
            begin = center + 1;
          } else if (lastPost._id > posts[center]._id) {
            end = center - 1;
          }
        }
      }
      //end binary search
    } catch (err) {}
  };

  const handleUnLike = async () => {
    setispostLiked(false);
    setpostLikes(postLikes - 1);
    try {
      await axios.patch(`${apiUrl}/client/post/${lastPost._id}/unlike`, null, {
        headers: {Authorization: token},
      });
      //binary search
      if (posts.length > 0) {
        let begin = 0;
        let end = posts.length - 1;
        while (begin <= end) {
          let center = Math.floor((begin + end) / 2);
          if (posts[center]._id === lastPost._id) {
            let postsClone = [...posts];
            postsClone[center].isLiked = false;
            postsClone[center].likesCount = postsClone[center].likesCount - 1;
            dispatch(dispatchGetPosts(postsClone));
            break;
          } else if (lastPost._id < posts[center]._id) {
            begin = center + 1;
          } else {
            end = center - 1;
          }
        }
      }
      //end binary search
    } catch (err) {}
  };

  const handleCall = async () => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${salon.businessPhone}`;
    } else {
      phoneNumber = `telprompt:${salon.businessPhone}`;
    }
    try {
      await analytics().logEvent('call_salon', {
        salon: {id: salon._id, name: salon.name},
        client: {id: client._id, name: client.name},
      });
    } catch (err) {}
    Linking.openURL(phoneNumber);
  };

  const getDirection = async () => {
    const url = `https://www.google.com/maps/dir/?api=1&travelmode=driving&dir_action=navigate&destination=${salon.location[0]},${salon.location[1]}`;
    try {
      await analytics().logEvent('get_direction_salon', {
        salon: {id: salon._id, name: salon.name},
        client: {id: client._id, name: client.name},
      });
    } catch (err) {}
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
      <Image
        style={{
          width: '100%',
          height: 200,
        }}
        source={
          salon.avatar === ''
            ? DefaultAvatar
            : {
                uri: salon.avatar,
              }
        }
      />
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

      <View
        style={{
          backgroundColor: '#fff',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          elevation: 7,
        }}>
        <Text
          numberOfLines={1}
          style={{
            color: '#9b945f',
            fontSize: 20,
            fontWeight: 'bold',
            textTransform: 'uppercase',
            textAlign: 'center',
            marginTop: 5,
          }}>
          {salon.name}
        </Text>
        <Text
          style={{
            color: '#aaa',
            fontSize: 16,
            textAlign: 'center',
            marginBottom: 5,
          }}>
          Pour{' ' + salon.gender}
        </Text>
      </View>
      {isLoading ? (
        <ActivityIndicator style={{marginTop: 20}} size="large" color="#222" />
      ) : (
        <>
          {token !== '' && (
            <View
              style={{
                flex: 0,
                width: '100%',
                justifyContent: 'space-between',
                alignSelf: 'center',
                alignItems: 'center',
                flexDirection: 'row',
                paddingHorizontal: 30,
                paddingVertical: 10,
                borderBottomWidth: 1,
                borderColor: '#ccc',
              }}>
              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                {isLiked ? (
                  <MaterialCommunityIcons
                    onPress={handleUnFollow}
                    name="heart"
                    color={'#b73535'}
                    size={34}
                  />
                ) : (
                  <MaterialCommunityIcons
                    onPress={handleFollow}
                    name="heart-outline"
                    color={'#777'}
                    size={34}
                  />
                )}
                <Text
                  style={{
                    color: '#aaa',
                    fontSize: 18,
                    fontWeight: 'bold',
                    marginLeft: 5,
                  }}>
                  {salonLikes}
                </Text>
              </View>

              <View
                style={{
                  flex: 0,
                  flexDirection: 'row',
                  width: '30%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                {salon.businessPhone !== '' && (
                  <TouchableOpacity onPress={handleCall}>
                    <MaterialCommunityIcons
                      name="phone-forward"
                      color={'#216839'}
                      size={30}
                    />
                  </TouchableOpacity>
                )}
                {salon.location !== [33.5944, -7.59207] && (
                  <TouchableOpacity onPress={getDirection}>
                    <FontAwesome5 name="route" color={'#9b945f'} size={25} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          <ScrollView>
            {salon.cashBack > 0 && (
              <Text
                style={{
                  fontFamily: 'Painting_With_Chocolate',
                  fontSize: 24,
                  textAlign: 'center',
                  color: '#000',
                  marginTop: 15,
                }}>
                CA$HBACK:{' '}
                <Text
                  style={{
                    fontFamily: 'Painting_With_Chocolate',
                    fontSize: 24,
                    color: '#216839',
                    textAlign: 'right',
                  }}>
                  +{salon.cashBack}%
                </Text>
              </Text>
            )}
            {salon.description && (
              <View
                style={{
                  marginHorizontal: 10,
                  marginTop: 10,
                }}>
                <Text
                  style={{
                    color: '#999',
                    fontSize: 18,
                    marginBottom: 3,
                  }}>
                  À propos de nous:
                </Text>
                <Text
                  style={{
                    fontSize: 16,
                    marginBottom: 10,
                    textAlign: 'justify',
                  }}>
                  {salon.description}
                </Text>
              </View>
            )}
            {salon.team.length !== 0 && (
              <View
                style={{
                  marginHorizontal: 10,
                }}>
                <Text
                  style={{
                    color: '#999',
                    fontSize: 18,
                  }}>
                  Equipes:
                </Text>
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    width: '100%',
                    marginVertical: 10,
                  }}>
                  {salon.team.map(team => (
                    <View
                      key={team._id}
                      style={{
                        backgroundColor: '#fff',
                        padding: 10,
                        borderRadius: 10,
                        margin: 5,
                        width: '45%',
                        borderWidth: 2,
                        borderColor: '#bbb',
                      }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: 'bold',
                          textAlign: 'center',
                          marginBottom: 5,
                        }}>
                        {team.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: '#999',
                          textAlign: 'center',
                        }}>
                        {team.speciality}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {salon.coiff.length !== 0 && (
              <View
                style={{
                  marginHorizontal: 10,
                }}>
                <Text
                  style={{
                    color: '#999',
                    fontSize: 18,
                  }}>
                  Tarifs:
                </Text>
                <View
                  style={{
                    flex: 0,
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '100%',
                    marginVertical: 10,
                  }}>
                  {salon.coiff.map(coiff => (
                    <View
                      key={coiff._id}
                      style={{
                        flex: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#fff',
                        padding: 12,
                        borderRadius: 10,
                        marginVertical: 5,
                        width: '100%',
                        borderWidth: 2,
                        borderColor: '#ccc',
                      }}>
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: 'bold',
                          color: '#9b945f',
                        }}>
                        {coiff.name}
                      </Text>
                      <Text
                        style={{
                          fontSize: 14,
                          color: '#000',
                          fontWeight: 'bold',
                        }}>
                        {coiff.price === '' ? '' : coiff.price + ' DH'}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
            {lastPost && (
              <View
                style={{
                  marginHorizontal: 10,
                }}>
                <Text
                  style={{
                    color: '#999',
                    fontSize: 18,
                  }}>
                  Dernier Post:
                </Text>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    marginVertical: 10,
                    backgroundColor: '#fff',
                    borderRadius: 25,
                    elevation: 5,
                    minHeight: 110,
                    zIndex: -1,
                    position: 'relative',
                  }}>
                  <View
                    style={{
                      width: '80%',
                      height: 55,
                      marginRight: 10,
                      flex: 0,
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Image
                      style={{
                        width: 40,
                        height: 40,
                        marginHorizontal: 8,
                        borderRadius: 20,
                        overlayColor: '#fff',
                      }}
                      source={
                        salon.avatar === ''
                          ? DefaultAvatar
                          : {
                              uri: salon.avatar,
                            }
                      }
                    />
                    <Text
                      numberOfLines={1}
                      style={{
                        fontWeight: 'bold',
                        fontSize: 17,
                        width: '100%',
                        color: '#9b945f',
                      }}>
                      {salon.name}
                    </Text>
                  </View>
                  <Text
                    onTextLayout={onTextLayout}
                    numberOfLines={textShown ? undefined : 2}
                    style={{
                      fontSize: 15,
                      textAlign: 'justify',
                      color: '#444',
                      marginHorizontal: 8,
                      marginBottom: lengthMore ? 0 : 8,
                    }}>
                    {lastPost.desc}
                  </Text>
                  {lengthMore ? (
                    <Text
                      onPress={toggleNumberOfLines}
                      style={{
                        color: '#999',
                        marginHorizontal: 8,
                        marginTop: 3,
                        marginBottom: 8,
                        fontSize: 14,
                        alignSelf: 'flex-end',
                      }}>
                      {textShown ? 'Masquer' : 'Lire la suite...'}
                    </Text>
                  ) : null}
                  {lastPost.photo !== '' ? (
                    <>
                      <Photo photo={lastPost.photo} />
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 10,
                          left: 10,
                          backgroundColor: '#fff',
                          padding: 3,
                          borderRadius: 15,
                          flex: 0,
                          flexDirection: 'row',
                          alignItems: 'center',
                          elevation: 10,
                        }}>
                        {ispostLiked ? (
                          <MaterialCommunityIcons
                            style={{marginRight: 5}}
                            onPress={handleUnLike}
                            name="heart"
                            color={'#b73531'}
                            size={40}
                          />
                        ) : (
                          <MaterialCommunityIcons
                            style={{marginRight: 5}}
                            onPress={handleLike}
                            name="heart-outline"
                            color={'#bbb'}
                            size={40}
                          />
                        )}
                        <Text
                          style={{
                            color: '#444',
                            fontSize: 18,
                            fontWeight: 'bold',
                            marginRight: 4,
                            elevation: 5,
                          }}>
                          {postLikes}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <View
                      style={{
                        marginLeft: 10,
                        marginBottom: 10,
                        flex: 0,
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      {ispostLiked ? (
                        <MaterialCommunityIcons
                          style={{marginRight: 5}}
                          onPress={handleUnLike}
                          name="heart"
                          color={'#b73531'}
                          size={40}
                        />
                      ) : (
                        <MaterialCommunityIcons
                          style={{marginRight: 5}}
                          onPress={handleLike}
                          name="heart-outline"
                          color={'#bbb'}
                          size={40}
                        />
                      )}
                      <Text
                        style={{
                          color: '#444',
                          fontSize: 18,
                          fontWeight: 'bold',
                          marginRight: 4,
                          elevation: 5,
                        }}>
                        {postLikes}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}
          </ScrollView>
          {salon.coiff.length !== 0 && token !== '' && (
            <View
              style={{
                backgroundColor: 'white',
                padding: 8,
                width: '100%',
                alignItems: 'center',
                borderTopWidth: 1,
                borderColor: '#ccc',
              }}>
              <TouchableOpacity
                style={{
                  backgroundColor: '#9b945f',
                  borderRadius: 10,
                  padding: 10,
                  width: '55%',
                  elevation: 3,
                }}
                onPress={() => navigation.navigate('Setup', salon)}>
                <Text
                  style={{
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}>
                  Prendre rendez-vous
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </>
  );
};

export default Detail;
