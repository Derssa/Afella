import React, {useState, useEffect, useCallback} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  RefreshControl,
} from 'react-native';
import Header from '../Header';
import LikeButton from './listComponents/LikeButton';
import {useSelector, useDispatch} from 'react-redux';
import axios from 'axios';
import {dispatchGetSalons} from '../../redux/actions/salonsAction';
import {dispatchUpdateLocation} from '../../redux/actions/authAction';
import Geolocation from 'react-native-geolocation-service';
import {getDistance} from 'geolib';
import {openSettings} from 'react-native-permissions';
import {apiUrl} from '../api';
import DefaultAvatar from '../../public/DAvatar.jpg';

const Home = ({navigation}) => {
  const {token, location} = useSelector(state => state.auth);
  const salons = useSelector(state => state.salons.salons);
  const [salonList, setSalonList] = useState(salons);
  const [isRefresh, setisRefresh] = useState(false);
  const [stopRefresh, setstopRefresh] = useState(false);
  const [isLoading, setisLoading] = useState(true);
  const [page, setpage] = useState(1);
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
    getSalons();
  }, [location]);

  const getSalons = async () => {
    setisLoading(true);
    try {
      const res = await axios.get(
        `${apiUrl}/client/salons?page=1&lat=${location[0]}&long=${location[1]}`,
      );
      dispatch(dispatchGetSalons(res.data.salons));
      setSalonList(res.data.salons);
      setpage(1);
      setstopRefresh(false);
      setisLoading(false);
      setisRefresh(false);
      setTopRefreshing(false);
      setlPermission(true);
    } catch (err) {
      setisLoading(false);
      setisRefresh(false);
      setTopRefreshing(false);
    }
  };

  const onTopRefresh = () => {
    setTopRefreshing(true);
    setpage(1);
    setstopRefresh(false);
    getPermission();
  };

  const loadMore = async () => {
    if (!stopRefresh) {
      setisRefresh(true);
      try {
        const res = await axios.get(
          `${apiUrl}/client/salons?page=${page + 1}&lat=${location[0]}&long=${
            location[1]
          }`,
        );
        if (res.data.salons.length) {
          setSalonList([...salonList, ...res.data.salons]);
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

  let cancelToken;
  const searchSalons = async search => {
    if (search.length) {
      if (typeof cancelToken != typeof undefined) {
        cancelToken.cancel('Operation canceled due to new request.');
      }

      cancelToken = axios.CancelToken.source();

      setisLoading(true);
      try {
        const res = await axios.get(
          `${apiUrl}/client/search?name=${search}&lat=${location[0]}&long=${location[1]}`,
          {cancelToken: cancelToken.token},
        );
        dispatch(dispatchGetSalons(res.data.salons));
        setSalonList(res.data.salons);
        setstopRefresh(true);
        setisLoading(false);
        setisRefresh(false);
      } catch (err) {
        setisLoading(false);
        setisRefresh(false);
      }
    }
  };

  const deleteSalon = () => {
    return;
  };

  const salonItem = useCallback(
    ({item}) => {
      return (
        <TouchableOpacity
          onPress={() => navigation.navigate('Detail', item)}
          style={{
            backgroundColor: '#f0f0f0',
            borderRadius: 15,
            elevation: 5,
            minHeight: 120,
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
    [lPermission, salons],
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
      <Header
        navigation={navigation}
        searchSalons={searchSalons}
        getSalons={getSalons}
      />
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
      {isLoading ? (
        <ActivityIndicator style={{marginTop: 20}} size="large" color="#222" />
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
      ) : (
        <>
          {salonList.length > 0 ? (
            <FlatList
              data={salonList}
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
              onEndReached={loadMore}
              onEndReachedThreshold={0}
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              refreshControl={
                <RefreshControl
                  refreshing={topRefreshing}
                  onRefresh={onTopRefresh}
                />
              }
              getItemLayout={getItemLayout}
              windowSize={12}
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
              Pas de salon
            </Text>
          )}
        </>
      )}
    </SafeAreaView>
  );
};

export default Home;
