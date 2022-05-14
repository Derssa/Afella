import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import logo_afella from '../../public/logo-afella.png';
import Desc from './postComponents/Desc';
import Photo from './postComponents/Photo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector, useDispatch} from 'react-redux';
import LikeButton from './postComponents/LikeButton';
import {dispatchUpdateLocation} from '../../redux/actions/authAction';
import {dispatchGetPosts} from '../../redux/actions/postsAction';
import Geolocation from 'react-native-geolocation-service';
import {openSettings} from 'react-native-permissions';
import {apiUrl} from '../api';
import DefaultAvatar from '../../public/DAvatar.jpg';

const Feeds = ({navigation}) => {
  const {token, location} = useSelector(state => state.auth);
  const {posts} = useSelector(state => state.posts);
  const [isLoading, setisLoading] = useState(true);
  const [isRefresh, setisRefresh] = useState(false);
  const [page, setpage] = useState(1);
  const [stopRefresh, setstopRefresh] = useState(false);
  const [lPermission, setlPermission] = useState(
    location.length > 0 ? true : false,
  );
  const [topRefreshing, setTopRefreshing] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    getPermission();
  }, []);

  const getPermission = async () => {
    if (Platform.OS === 'ios') {
      try {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        if (auth === 'granted') {
          Geolocation.getCurrentPosition(
            position => {
              dispatch(
                dispatchUpdateLocation([
                  position.coords.latitude,
                  position.coords.longitude,
                ]),
              );
              setlPermission(true);
              Geolocation.watchPosition(
                position => {
                  dispatch(
                    dispatchUpdateLocation([
                      position.coords.latitude,
                      position.coords.longitude,
                    ]),
                  );
                  setlPermission(true);
                },
                error => {},
                {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
              );
            },
            error => {
              setlPermission(false);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        }
      } catch (err) {
        setlPermission(false);
      }
    }

    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          Geolocation.getCurrentPosition(
            position => {
              dispatch(
                dispatchUpdateLocation([
                  position.coords.latitude,
                  position.coords.longitude,
                ]),
              );
              setlPermission(true);
              Geolocation.watchPosition(
                position => {
                  dispatch(
                    dispatchUpdateLocation([
                      position.coords.latitude,
                      position.coords.longitude,
                    ]),
                  );
                  setlPermission(true);
                },
                error => {},
                {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
              );
            },
            error => {
              setlPermission(false);
            },
            {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
          );
        } else if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          openSettings();
        }
      } catch (err) {
        setlPermission(false);
      }
    }
  };

  useEffect(() => {
    showPosts();
  }, [location]);

  const showPosts = async () => {
    setisLoading(true);
    setstopRefresh(false);
    setpage(1);
    try {
      const res = await axios.get(
        `${apiUrl}/client/posts?page=1&lat=${location[0]}&long=${location[1]}`,
      );
      dispatch(dispatchGetPosts(res.data));
      setisLoading(false);
      setTopRefreshing(false);
      setlPermission(true);
    } catch (err) {
      setisLoading(false);
      setTopRefreshing(false);
    }
  };

  const onTopRefresh = () => {
    setTopRefreshing(true);
    setpage(1);
    setstopRefresh(true);
    getPermission();
  };

  const loadMorePosts = async () => {
    if (!stopRefresh) {
      setisRefresh(true);
      try {
        const res = await axios.get(
          `${apiUrl}/client/posts?page=${page + 1}&lat=${location[0]}&long=${
            location[1]
          }`,
        );
        if (res.data.length) {
          dispatch(dispatchGetPosts([...posts, ...res.data]));
          setpage(page + 1);
        } else {
          setstopRefresh(true);
        }
        setisRefresh(false);
      } catch (err) {
        setisRefresh(false);
      }
    }
  };

  const postItem = useCallback(
    ({item}) => {
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
          <LikeButton item={item} screen={'feeds'} />
        </View>
      );
    },
    [posts],
  );

  const keyExtractor = useCallback(item => item._id, []);

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
      {token === '' && (
        <TouchableOpacity
          style={{
            backgroundColor: '#9b945f',
            borderRadius: 10,
            padding: 10,
            marginTop: 17,
            marginBottom: 10,
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
      <>
        {isLoading ? (
          <ActivityIndicator
            style={{marginTop: 20}}
            size="large"
            color="#222"
          />
        ) : !lPermission ? (
          <TouchableOpacity
            style={{
              backgroundColor: '#216839',
              padding: 10,
              marginTop: 50,
              width: '50%',
              alignSelf: 'center',
              elevation: 5,
            }}
            onPress={getPermission}>
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: 'bold',
                textTransform: 'uppercase',
              }}>
              Activer votre location
            </Text>
          </TouchableOpacity>
        ) : posts.length > 0 ? (
          <FlatList
            data={posts}
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
            refreshControl={
              <RefreshControl
                refreshing={topRefreshing}
                onRefresh={onTopRefresh}
              />
            }
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
        )}
      </>
    </SafeAreaView>
  );
};

export default Feeds;
