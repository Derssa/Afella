import React, {useState, useEffect, useCallback} from 'react';
import {
  ImageBackground,
  Text,
  View,
  ActivityIndicator,
  Linking,
  FlatList,
  Platform,
  PermissionsAndroid,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import {useSelector, useDispatch} from 'react-redux';
import bg from '../../public/background.jpg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {dispatchUpdateLocation} from '../../redux/actions/authAction';
import Geolocation from 'react-native-geolocation-service';
import {openSettings} from 'react-native-permissions';
import analytics from '@react-native-firebase/analytics';
import {apiUrl} from '../api';

const Jobs = ({navigation}) => {
  const {client, token, location} = useSelector(state => state.auth);
  const [isLoading, setisLoading] = useState(true);
  const [isRefresh, setisRefresh] = useState(false);
  const [stopRefresh, setstopRefresh] = useState(false);
  const [page, setpage] = useState(1);
  const [topRefreshing, setTopRefreshing] = useState(false);
  const [lPermission, setlPermission] = useState(
    location.length > 0 ? true : false,
  );
  const [jobList, setjobList] = useState([]);

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
    getJobs();
  }, [location]);

  const getJobs = async () => {
    setisLoading(true);
    try {
      const res = await axios.get(
        `${apiUrl}/client/jobs?page=1&lat=${location[0]}&long=${location[1]}`,
        {
          headers: {
            Authorization: token,
          },
        },
      );
      setjobList(res.data.jobs);
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

  const handleCall = async salon => {
    let phoneNumber = '';
    if (Platform.OS === 'android') {
      phoneNumber = `tel:${salon.phone}`;
    } else {
      phoneNumber = `telprompt:${salon.phone}`;
    }
    try {
      await analytics().logEvent('call_job_number', {
        salon: {id: salon._id, name: salon.name},
        client: {id: client._id, name: client.name},
      });
    } catch (err) {}
    Linking.openURL(phoneNumber);
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
          `${apiUrl}/client/jobs?page=${page + 1}&lat=${location[0]}&long=${
            location[1]
          }`,
          {
            headers: {
              Authorization: token,
            },
          },
        );
        if (res.data.jobs.length) {
          setjobList([...jobList, ...res.data.jobs]);
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

  const jobItem = useCallback(
    ({item}) => {
      return (
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff',
            padding: 12,
            borderRadius: 10,
            margin: 10,
            borderWidth: 2,
            borderColor: '#9b945f',
            borderStyle: 'dotted',
          }}>
          <View
            style={{
              flex: 0,
              flexDirection: 'column',
              width: '90%',
            }}>
            <Text
              numberOfLines={1}
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: '#333',
              }}>
              {item.speciality}
            </Text>
            {item.desc !== '' && (
              <Text
                numberOfLines={3}
                style={{
                  fontSize: 12,
                  color: '#333',
                }}>
                {item.desc}
              </Text>
            )}
            <View
              style={{
                flex: 0,
                flexDirection: 'row',
                alignItems: 'center',
                marginTop: 5,
                width: '100%',
              }}>
              <Text
                numberOfLines={1}
                style={{
                  fontSize: 12,
                  marginRight: 10,
                  color: '#777',
                  fontWeight: 'bold',
                  maxWidth: '75%',
                }}>
                {item.salon.name}
              </Text>
              {item.salary !== '' && (
                <Text
                  numberOfLines={1}
                  style={{
                    fontSize: 12,
                    color: '#9b945f',
                    fontWeight: 'bold',
                  }}>
                  {item.salary + '.00 DH'}
                </Text>
              )}
            </View>
          </View>
          <TouchableOpacity>
            <MaterialCommunityIcons
              onPress={() => handleCall(item.salon)}
              name="phone-forward"
              color={'#216839'}
              size={28}
            />
          </TouchableOpacity>
        </View>
      );
    },
    [lPermission, jobList],
  );

  const keyExtractor = useCallback(item => item._id, []);

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
            fontSize: 26,
            color: '#333',
            textAlign: 'center',
            fontFamily: 'Painting_With_Chocolate',
          }}>
          Emplois & stage
        </Text>
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
        ) : jobList.length > 0 ? (
          <FlatList
            data={jobList}
            renderItem={jobItem}
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
            maxToRenderPerBatch={12}
            refreshControl={
              <RefreshControl
                refreshing={topRefreshing}
                onRefresh={onTopRefresh}
              />
            }
            windowSize={14}
          />
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
            Pas d'emploi
          </Text>
        )}
      </ImageBackground>
    </>
  );
};

export default Jobs;
