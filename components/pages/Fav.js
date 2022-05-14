import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {dispatchGetClient} from '../../redux/actions/authAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import logo_afella from '../../public/logo-afella.png';
import Desc from './postComponents/Desc';
import Photo from './postComponents/Photo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useIsFocused} from '@react-navigation/native';
import LikeButton from './listComponents/LikeButton';
import LikePButton from './postComponents/LikeButton';
import {getDistance} from 'geolib';
import {apiUrl} from '../api';
import DefaultAvatar from '../../public/DAvatar.jpg';

const Fav = ({route, navigation}) => {
  const [favToggle, setfavToggle] = useState(false);
  const [isConnected, setisConnected] = useState(false);
  const [isLoading, setisLoading] = useState(true);
  const [favSalonsList, setfavSalonsList] = useState([]);
  const [postList, setpostList] = useState([]);
  const [isRefresh, setisRefresh] = useState(false);
  const [page, setpage] = useState(1);
  const [stopRefresh, setstopRefresh] = useState(false);
  const {token, location} = useSelector(state => state.auth);
  const isFocused = useIsFocused();

  const dispatch = useDispatch();

  useEffect(() => {
    if (isFocused) {
      if (token !== '') {
        setisConnected(true);
        if (favToggle) {
          showPosts();
        } else {
          showSalons();
        }
      } else {
        setisConnected(false);
      }
    }
  }, [isFocused]);

  useEffect(() => {
    if (route.params.screen === 'Favories') {
      if (token !== '') {
        showPosts();
      }
    }
  }, []);

  const showSalons = async () => {
    setfavToggle(false);
    setstopRefresh(false);
    setpage(1);
    try {
      const res = await axios.get(`${apiUrl}/client/favsalons/page=1`, {
        headers: {Authorization: token},
      });
      setfavSalonsList(res.data);
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
  const loadMoreSalons = async () => {
    if (!stopRefresh) {
      setisRefresh(true);
      try {
        const res = await axios.get(
          `${apiUrl}/client/favsalons/page=${page + 1}`,
          {headers: {Authorization: token}},
        );
        if (res.data.length) {
          setfavSalonsList([...favSalonsList, ...res.data]);
          setpage(page + 1);
        } else {
          setstopRefresh(true);
        }
        setisRefresh(false);
      } catch (err) {
        if (err.response.data.msg === 'Your Bloqued') {
          dispatch(dispatchGetClient({data: {client: {}, access_token: ''}}));
          await AsyncStorage.removeItem('firstLogin');
          setisConnected(false);
        }
        setisRefresh(false);
      }
    }
  };

  const showPosts = async () => {
    setfavToggle(true);
    setisLoading(true);
    setstopRefresh(false);
    setpage(1);
    try {
      const res = await axios.get(`${apiUrl}/client/postsfav/page=1`, {
        headers: {Authorization: token},
      });
      setpostList(res.data);
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

  const loadMorePosts = async () => {
    if (!stopRefresh) {
      setisRefresh(true);
      try {
        const res = await axios.get(
          `${apiUrl}/client/postsfav/page=${page + 1}`,
          {headers: {Authorization: token}},
        );
        if (res.data.length) {
          setpostList([...postList, ...res.data]);
          setpage(page + 1);
        } else {
          setstopRefresh(true);
        }
        setisRefresh(false);
      } catch (err) {
        if (err.response.data.msg === 'Your Bloqued') {
          dispatch(dispatchGetClient({data: {client: {}, access_token: ''}}));
          await AsyncStorage.removeItem('firstLogin');
          setisConnected(false);
        }
        setisRefresh(false);
      }
    }
  };

  const deleteSalon = id => {
    let favs = favSalonsList.filter(fav => {
      return fav._id !== id;
    });
    setfavSalonsList(favs);
  };

  const postItem = useCallback(({item}) => {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          margin: 10,
          backgroundColor: '#fff',
          borderRadius: 25,
          elevation: 5,
          minHeight: 95,
          zIndex: -1,
          position: 'relative',
        }}>
        <TouchableOpacity
          style={{
            width: '80%',
            height: 55,
            marginRight: 10,
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
          }}
          onPress={() => navigation.navigate('Detail', item.salon)}>
          <Image
            style={{
              width: 40,
              height: 40,
              marginHorizontal: 8,
              borderRadius: 20,
              overlayColor: '#fff',
            }}
            source={
              item.salon.avatar === ''
                ? DefaultAvatar
                : {
                    uri: item.salon.avatar,
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
            {item.salon.name}
          </Text>
        </TouchableOpacity>
        <Desc desc={item.desc} />
        {item.photo !== '' && <Photo photo={item.photo} />}
        <LikePButton item={item} screen={'favFeeds'} />
      </View>
    );
  }, []);

  const salonItem = useCallback(
    ({item}) => {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('Detail', item)}
          style={{
            backgroundColor: '#f0f0f0',
            borderRadius: 15,
            elevation: 5,
            minHeight: 90,
            margin: 10,
          }}>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              backgroundColor: '#fff',
              borderRadius: 15,
              height: 90,
              zIndex: -1,
            }}>
            <View
              style={{
                width: '30%',
                marginRight: 10,
              }}>
              <Image
                style={{
                  width: '100%',
                  height: '100%',
                  borderTopLeftRadius: 15,
                  borderBottomLeftRadius: 15,
                  overlayColor: '#eee',
                }}
                source={
                  item.avatar === ''
                    ? DefaultAvatar
                    : {
                        uri: item.avatar,
                      }
                }
              />
            </View>
            <View
              style={{
                width: '50%',
                justifyContent: 'space-around',
                paddingVertical: 7,
              }}>
              <Text
                numberOfLines={1}
                style={{
                  fontWeight: 'bold',
                  fontSize: 16,
                  color: '#9b945f',
                }}>
                {item.name}
              </Text>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  color: '#aaa',
                }}>
                pour{' ' + item.gender}
              </Text>
              <Text
                numberOfLines={2}
                style={{
                  textAlign: 'justify',
                }}>
                {item.description}
              </Text>
            </View>
            <LikeButton salon={item} deleteSalon={deleteSalon} />
          </View>

          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: item.cashBack > 0 ? 'space-between' : 'flex-end',
              paddingTop: 3,
              paddingHorizontal: 15,
              alignItems: 'center',
            }}>
            {item.cashBack > 0 && (
              <Text
                style={{
                  fontFamily: 'Painting_With_Chocolate',
                  fontSize: 17,
                  color: '#000',
                }}>
                CA$HBACK:{' '}
                <Text
                  style={{
                    fontFamily: 'Painting_With_Chocolate',
                    fontSize: 17,
                    color: '#216839',
                    textAlign: 'right',
                  }}>
                  +{item.cashBack}%
                </Text>
              </Text>
            )}

            <Text
              style={{
                fontFamily: 'Painting_With_Chocolate',
                fontSize: 17,
                color: '#9b945f',
              }}>
              {location.length && (
                <>
                  <Text>
                    {getDistance(location, item.location) < 1000
                      ? getDistance(location, item.location) + 'm de vous'
                      : (getDistance(location, item.location) * 0.001).toFixed(
                          2,
                        ) + 'km de vous'}
                  </Text>
                </>
              )}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [location],
  );

  const keyExtractor = useCallback(item => item._id, []);

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 120,
      offset: 120 * index,
      index,
    }),
    [],
  );

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
          <View
            style={{
              paddingVertical: 10,
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <TouchableOpacity
              onPress={showSalons}
              style={{
                flex: 0,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialCommunityIcons
                style={{
                  marginHorizontal: 20,
                }}
                name="format-list-bulleted"
                color={favToggle ? '#aaa' : '#9b945f'}
                size={favToggle ? 30 : 40}
              />
              <Text
                style={{
                  fontSize: favToggle ? 10 : 12,
                  color: favToggle ? '#666' : '#9b945f',
                  fontWeight: favToggle ? 'normal' : 'bold',
                }}>
                LIST
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={showPosts}
              style={{
                flex: 0,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <MaterialCommunityIcons
                style={{
                  marginHorizontal: 20,
                }}
                name="post-outline"
                color={favToggle ? '#9b945f' : '#aaa'}
                size={favToggle ? 40 : 30}
              />
              <Text
                style={{
                  fontSize: favToggle ? 12 : 10,
                  color: favToggle ? '#9b945f' : '#666',
                  fontWeight: favToggle ? 'bold' : 'normal',
                }}>
                POSTS
              </Text>
            </TouchableOpacity>
          </View>
          {favToggle ? (
            isLoading ? (
              <ActivityIndicator
                style={{marginTop: 20}}
                size="large"
                color="#222"
              />
            ) : postList.length > 0 ? (
              <FlatList
                data={postList}
                renderItem={postItem}
                keyExtractor={keyExtractor}
                ListFooterComponent={
                  isRefresh && (
                    <ActivityIndicator
                      style={{marginBottom: 20, marginTop: 10}}
                      size="large"
                      color="#222"
                    />
                  )
                }
                onEndReached={loadMorePosts}
                onEndReachedThreshold={0}
                removeClippedSubviews={true}
                maxToRenderPerBatch={8}
                windowSize={10}
              />
            ) : (
              <Text
                style={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  color: '#ccc',
                  textTransform: 'uppercase',
                  marginTop: 5,
                  fontSize: 18,
                }}>
                Pas de post
              </Text>
            )
          ) : isLoading ? (
            <ActivityIndicator
              style={{marginTop: 20}}
              size="large"
              color="#222"
            />
          ) : favSalonsList.length > 0 ? (
            <FlatList
              data={favSalonsList}
              renderItem={salonItem}
              keyExtractor={keyExtractor}
              ListFooterComponent={
                isRefresh && (
                  <ActivityIndicator
                    style={{marginBottom: 20, marginTop: 10}}
                    size="large"
                    color="#222"
                  />
                )
              }
              onEndReached={loadMoreSalons}
              onEndReachedThreshold={0}
              removeClippedSubviews={true}
              getItemLayout={getItemLayout}
              maxToRenderPerBatch={8}
              windowSize={10}
            />
          ) : (
            <Text
              style={{
                fontWeight: 'bold',
                textAlign: 'center',
                color: '#ccc',
                textTransform: 'uppercase',
                marginTop: 5,
                fontSize: 18,
              }}>
              Pas de salon favorie
            </Text>
          )}
        </>
      )}
      {token === '' && (
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

export default Fav;
