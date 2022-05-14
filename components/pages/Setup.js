import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSelector, useDispatch} from 'react-redux';
import {dispatchGetClient} from '../../redux/actions/authAction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './Loading';
import axios from 'axios';
import moment from 'moment';
import 'moment/locale/fr';
import {apiUrl} from '../api';
import DefaultAvatar from '../../public/DAvatar.jpg';

const Setup = ({route, navigation}) => {
  const salon = route.params;
  const auth = useSelector(state => state.auth);
  const [number, setNumber] = useState(1);
  const [dateData, setDateData] = useState([
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().format('DD')
          : moment().add(1, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().format('MMMM')
          : moment().add(1, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(1, 'days').format('DD')
          : moment().add(2, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(1, 'days').format('MMMM')
          : moment().add(2, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(2, 'days').format('DD')
          : moment().add(3, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(2, 'days').format('MMMM')
          : moment().add(3, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(3, 'days').format('DD')
          : moment().add(4, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(3, 'days').format('MMMM')
          : moment().add(4, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(4, 'days').format('DD')
          : moment().add(5, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(4, 'days').format('MMMM')
          : moment().add(5, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(5, 'days').format('DD')
          : moment().add(6, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(5, 'days').format('MMMM')
          : moment().add(6, 'days').format('MMMM'),
    },
    {
      day:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(6, 'days').format('DD')
          : moment().add(7, 'days').format('DD'),
      month:
        parseInt(moment().format('HH')) + 2 < 22
          ? moment().add(6, 'days').format('MMMM')
          : moment().add(7, 'days').format('MMMM'),
    },
  ]);
  const [dateSelect, setdateSelect] = useState(0);
  const [timeData, settimeData] = useState([]);
  const [isLoadingTime, setisLoadingTime] = useState(true);
  const [dateS, setdateS] = useState('');
  const [coiff, setcoiff] = useState({index: '', id: '', name: ''});
  const [team, setteam] = useState({id: '', name: ''});
  const [isLoading, setisLoading] = useState(false);
  moment.locale('fr');

  const dispatch = useDispatch();

  useEffect(async () => {
    if (number === 3) {
      setdateSelect(0);
      try {
        const res = await axios.get(
          `${apiUrl}/appointement?salon=${salon._id}&team=${
            team.id
          }&date=${new Date(
            moment(
              `${
                parseInt(moment().add(2, 'hours').format('HH')) < 22
                  ? moment().format('YYYY-MM-DD')
                  : moment().add(1, 'days').format('YYYY-MM-DD')
              }`,
            ).format(),
          )}`,
        );

        const timeSlots = [];
        if (salon.gap === 'minute') {
          const timeSlotsNumber =
            parseInt(moment().add(2, 'hours').format('HH')) < 22
              ? (22 - parseInt(moment().add(2, 'hours').format('HH'))) * 2
              : 13 * 2;
          let j = 0;
          if (timeSlotsNumber >= 26) {
            for (let i = 0; i < 26; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) === 9 + j &&
                    parseInt(moment(date).format('mm')) ===
                      (i % 2 === 0 ? 0 : 30),
                )
              ) {
                timeSlots.push({
                  time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                  available: true,
                });
              }
              j = i % 2 === 0 ? j : j + 1;
            }
          } else {
            for (let i = 0; i < timeSlotsNumber; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) ===
                      parseInt(
                        moment()
                          .add(2 + j, 'hours')
                          .format('HH'),
                      ) &&
                    parseInt(moment(date).format('mm')) ===
                      (i % 2 === 0 ? 0 : 30),
                )
              ) {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + j, 'hours')
                    .format('HH')}:${i % 2 === 0 ? '00' : '30'}`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + j, 'hours')
                    .format('HH')}:${i % 2 === 0 ? '00' : '30'}`,
                  available: true,
                });
              }
              j = i % 2 === 0 ? j : j + 1;
            }
          }
        } else {
          const timeSlotsNumber =
            parseInt(moment().add(2, 'hours').format('HH')) < 22
              ? 22 - parseInt(moment().add(2, 'hours').format('HH'))
              : 13;
          if (timeSlotsNumber >= 13) {
            for (let i = 0; i < 13; i++) {
              if (
                res.data.find(
                  date => parseInt(moment(date).format('HH')) === 9 + i,
                )
              ) {
                timeSlots.push({
                  time: `${9 + i}:00`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${9 + i}:00`,
                  available: true,
                });
              }
            }
          } else {
            for (let i = 0; i < timeSlotsNumber; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) ===
                    parseInt(
                      moment()
                        .add(2 + i, 'hours')
                        .format('HH'),
                    ),
                )
              ) {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + i, 'hours')
                    .format('HH')}:00`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + i, 'hours')
                    .format('HH')}:00`,
                  available: true,
                });
              }
            }
          }
        }
        settimeData(timeSlots);
        setisLoadingTime(false);
      } catch (err) {
        setisLoadingTime(false);
      }
    }
  }, [number]);

  const changeDate = async index => {
    setdateSelect(index);
    setisLoadingTime(true);
    try {
      const res = await axios.get(
        `${apiUrl}/appointement?salon=${salon._id}&team=${
          team.id
        }&date=${new Date(
          moment(
            `${
              parseInt(moment().add(2, 'hours').format('HH')) < 22
                ? moment().add(index, 'days').format('YYYY-MM-DD')
                : moment()
                    .add(index + 1, 'days')
                    .format('YYYY-MM-DD')
            }`,
          ).format(),
        )}`,
      );
      if (index === 0) {
        const timeSlots = [];
        if (salon.gap === 'minute') {
          const timeSlotsNumber =
            parseInt(moment().add(2, 'hours').format('HH')) < 22
              ? (22 - parseInt(moment().add(2, 'hours').format('HH'))) * 2
              : 13 * 2;
          let j = 0;
          if (timeSlotsNumber >= 26) {
            for (let i = 0; i < 26; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) === 9 + j &&
                    parseInt(moment(date).format('mm')) ===
                      (i % 2 === 0 ? 0 : 30),
                )
              ) {
                timeSlots.push({
                  time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                  available: true,
                });
              }
              j = i % 2 === 0 ? j : j + 1;
            }
          } else {
            for (let i = 0; i < timeSlotsNumber; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) ===
                      parseInt(
                        moment()
                          .add(2 + j, 'hours')
                          .format('HH'),
                      ) &&
                    parseInt(moment(date).format('mm')) ===
                      (i % 2 === 0 ? 0 : 30),
                )
              ) {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + j, 'hours')
                    .format('HH')}:${i % 2 === 0 ? '00' : '30'}`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + j, 'hours')
                    .format('HH')}:${i % 2 === 0 ? '00' : '30'}`,
                  available: true,
                });
              }
              j = i % 2 === 0 ? j : j + 1;
            }
          }
        } else {
          const timeSlotsNumber =
            parseInt(moment().add(2, 'hours').format('HH')) < 22
              ? 22 - parseInt(moment().add(2, 'hours').format('HH'))
              : 13;
          if (timeSlotsNumber >= 13) {
            for (let i = 0; i < 13; i++) {
              if (
                res.data.find(
                  date => parseInt(moment(date).format('HH')) === 9 + i,
                )
              ) {
                timeSlots.push({
                  time: `${9 + i}:00`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${9 + i}:00`,
                  available: true,
                });
              }
            }
          } else {
            for (let i = 0; i < timeSlotsNumber; i++) {
              if (
                res.data.find(
                  date =>
                    parseInt(moment(date).format('HH')) ===
                    parseInt(
                      moment()
                        .add(2 + i, 'hours')
                        .format('HH'),
                    ),
                )
              ) {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + i, 'hours')
                    .format('HH')}:00`,
                  available: false,
                });
              } else {
                timeSlots.push({
                  time: `${moment()
                    .add(2 + i, 'hours')
                    .format('HH')}:00`,
                  available: true,
                });
              }
            }
          }
        }
        settimeData(timeSlots);
        setisLoadingTime(false);
      } else {
        const timeSlots = [];
        if (salon.gap === 'minute') {
          let j = 0;
          for (let i = 0; i < 26; i++) {
            if (
              res.data.find(
                date =>
                  parseInt(moment(date).format('HH')) === 9 + j &&
                  parseInt(moment(date).format('mm')) ===
                    (i % 2 === 0 ? 0 : 30),
              )
            ) {
              timeSlots.push({
                time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                available: false,
              });
            } else {
              timeSlots.push({
                time: `${9 + j}:${i % 2 === 0 ? '00' : '30'}`,
                available: true,
              });
            }
            j = i % 2 === 0 ? j : j + 1;
          }
        } else {
          for (let i = 0; i < 13; i++) {
            if (
              res.data.find(
                date => parseInt(moment(date).format('HH')) === 9 + i,
              )
            ) {
              timeSlots.push({
                time: `${9 + i}:00`,
                available: false,
              });
            } else {
              timeSlots.push({
                time: `${9 + i}:00`,
                available: true,
              });
            }
          }
        }
        settimeData(timeSlots);
        setisLoadingTime(false);
      }
    } catch (err) {
      setisLoadingTime(false);
    }
  };

  const handleConfirm = time => {
    const theDate = moment(
      `${
        parseInt(moment().add(2, 'hours').format('HH')) < 22
          ? moment().add(dateSelect, 'days').format('YYYY-MM-DD')
          : moment()
              .add(dateSelect + 1, 'days')
              .format('YYYY-MM-DD')
      } ${time}`,
      'YYYY-MM-DD HH:mm',
    ).format();
    setdateS(new Date(theDate));
    setNumber(4);
  };

  const createAppoint = async () => {
    setisLoading(true);
    try {
      await axios.post(
        `${apiUrl}/appointement/add_appointement`,
        {
          client: auth.client.name,
          salon: salon._id,
          team,
          coiff,
          date: dateS,
        },
        {
          headers: {
            Authorization: auth.token,
          },
        },
      );
      setisLoading(false);
      navigation.navigate('Rendez-vous');
    } catch (err) {
      ToastAndroid.show(err.response.data.msg, ToastAndroid.LONG);
      if (err.response.data.msg === 'Your Bloqued') {
        dispatch(dispatchGetClient({data: {client: {}, access_token: ''}}));
        await AsyncStorage.removeItem('firstLogin');
      }
      setisLoading(false);
      navigation.goBack();
    }
  };

  let code;
  if (number === 1) {
    code = (
      <View>
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 40,
          }}>
          <Text
            style={{
              backgroundColor: '#9b945f',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            1
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'dashed',
              borderColor: '#777',
            }}></View>
          <Text
            style={{
              backgroundColor: '#777',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            2
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'dashed',
              borderColor: '#777',
            }}></View>
          <Text
            style={{
              backgroundColor: '#777',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            3
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'dashed',
              borderColor: '#777',
            }}></View>
          <MaterialCommunityIcons
            name="check-bold"
            color={'#fff'}
            size={22}
            style={{
              backgroundColor: '#777',
              paddingTop: 3,
              paddingLeft: 4,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}
          />
        </View>

        <Text
          style={{
            fontSize: 16,
            marginTop: 50,
            textTransform: 'uppercase',
            color: '#555',
            textAlign: 'center',
            fontWeight: 'bold',
          }}>
          Choisissez:
        </Text>
        <View
          style={{
            marginHorizontal: 10,
          }}>
          <View
            style={{
              flex: 0,
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              marginVertical: 10,
            }}>
            {salon.coiff.map((c, index) => (
              <TouchableOpacity
                key={c._id}
                onPress={() => {
                  setNumber(2);
                  setcoiff({index, id: c._id, name: c.name});
                }}
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
                  {c.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: '#000',
                    fontWeight: 'bold',
                  }}>
                  {c.price === '' ? '' : c.price + ' DH'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  } else if (number === 2) {
    if (salon.coiff[coiff.index].team.length > 0) {
      code = (
        <View>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 40,
            }}>
            <Text
              style={{
                backgroundColor: '#9b945f',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 18,
                paddingTop: 2,
                paddingLeft: 10,
                height: 30,
                width: 30,
                borderRadius: 15,
              }}>
              1
            </Text>
            <View
              style={{
                width: 30,
                borderWidth: 2,
                borderRadius: 1,
                borderStyle: 'solid',
                borderColor: '#9b945f',
              }}></View>
            <Text
              style={{
                backgroundColor: '#9b945f',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 18,
                paddingTop: 2,
                paddingLeft: 10,
                height: 30,
                width: 30,
                borderRadius: 15,
              }}>
              2
            </Text>
            <View
              style={{
                width: 30,
                borderWidth: 2,
                borderRadius: 1,
                borderStyle: 'dashed',
                borderColor: '#777',
              }}></View>
            <Text
              style={{
                backgroundColor: '#777',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 18,
                paddingTop: 2,
                paddingLeft: 10,
                height: 30,
                width: 30,
                borderRadius: 15,
              }}>
              3
            </Text>
            <View
              style={{
                width: 30,
                borderWidth: 2,
                borderRadius: 1,
                borderStyle: 'dashed',
                borderColor: '#777',
              }}></View>
            <MaterialCommunityIcons
              name="check-bold"
              color={'#fff'}
              size={22}
              style={{
                backgroundColor: '#777',
                paddingTop: 3,
                paddingLeft: 4,
                height: 30,
                width: 30,
                borderRadius: 15,
              }}
            />
          </View>
          <Text
            style={{
              fontSize: 16,
              marginTop: 50,
              textTransform: 'uppercase',
              color: '#555',
              textAlign: 'center',
              fontWeight: 'bold',
            }}>
            Choisissez votre coiffeur:
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
            {salon.coiff[coiff.index].team.map(coiffeur => (
              <TouchableOpacity
                key={coiffeur._id}
                onPress={() => {
                  setNumber(3);
                  setteam({id: coiffeur._id, name: coiffeur.name});
                }}
                style={{
                  backgroundColor: '#fff',
                  padding: 10,
                  elevation: 5,
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
                  {coiffeur.name}
                </Text>
                <Text
                  style={{
                    fontSize: 12,
                    color: '#999',
                    textAlign: 'center',
                  }}>
                  {coiffeur.speciality}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } else {
      setNumber(3);
    }
  } else if (number === 3) {
    code = (
      <View
        style={{
          flex: 0,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 40,
          }}>
          <Text
            style={{
              backgroundColor: '#9b945f',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            1
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'solid',
              borderColor: '#9b945f',
            }}></View>
          <Text
            style={{
              backgroundColor: '#9b945f',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            2
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'solid',
              borderColor: '#9b945f',
            }}></View>
          <Text
            style={{
              backgroundColor: '#9b945f',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            3
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'dashed',
              borderColor: '#777',
            }}></View>
          <MaterialCommunityIcons
            name="check-bold"
            color={'#fff'}
            size={22}
            style={{
              backgroundColor: '#777',
              paddingTop: 3,
              paddingLeft: 4,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}
          />
        </View>
        <ScrollView
          horizontal={true}
          style={{
            marginTop: -10,
            paddingLeft: 10,
          }}>
          {dateData.map((date, index) => (
            <TouchableOpacity
              key={index}
              style={{
                backgroundColor: dateSelect === index ? '#216839' : '#ccc',
                marginHorizontal: 3,
                padding: 5,
                borderRadius: 15,
                width: 60,
              }}
              onPress={() => changeDate(index)}>
              <Text
                style={{
                  fontSize: 22,
                  textTransform: 'uppercase',
                  color: dateSelect === index ? '#fff' : '#216839',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                {date.day}
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  textTransform: 'uppercase',
                  color: dateSelect === index ? '#fff' : '#216839',
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}>
                {date.month}
              </Text>
            </TouchableOpacity>
          ))}
          <View
            style={{
              width: 20,
            }}></View>
        </ScrollView>

        {isLoadingTime ? (
          <ActivityIndicator
            style={{
              marginVertical: 100,
            }}
            size="large"
            color="#222"
          />
        ) : (
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              marginVertical: 20,
            }}>
            {timeData.map((time, index) => (
              <TouchableOpacity
                key={index}
                disabled={!time.available}
                style={{
                  backgroundColor: time.available ? '#fff' : '#ddd',
                  margin: 5,
                  paddingHorizontal: 5,
                  paddingVertical: 10,
                  borderColor: '#aaa',
                  borderWidth: 2,
                  borderStyle: time.available ? 'dotted' : 'solid',
                  borderRadius: 10,
                  width: 70,
                }}
                onPress={() => handleConfirm(time.time)}>
                <Text
                  style={{
                    fontSize: 18,
                    textTransform: 'uppercase',
                    color: time.available ? '#333' : '#999',
                    textAlign: 'center',
                    fontWeight: 'bold',
                  }}>
                  {time.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  } else if (number === 4) {
    code = (
      <View
        style={{
          flex: 0,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <View
          style={{
            flex: 0,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 15,
          }}>
          <Text
            style={{
              backgroundColor: '#9b945f',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            1
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'solid',
              borderColor: '#9b945f',
            }}></View>
          <Text
            style={{
              backgroundColor: '#9b945f',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            2
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'solid',
              borderColor: '#9b945f',
            }}></View>
          <Text
            style={{
              backgroundColor: '#9b945f',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 18,
              paddingTop: 2,
              paddingLeft: 10,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}>
            3
          </Text>
          <View
            style={{
              width: 30,
              borderWidth: 2,
              borderRadius: 1,
              borderStyle: 'solid',
              borderColor: '#216839',
            }}></View>
          <MaterialCommunityIcons
            name="check-bold"
            color={'#fff'}
            size={22}
            style={{
              backgroundColor: '#216839',
              paddingTop: 3,
              paddingLeft: 4,
              height: 30,
              width: 30,
              borderRadius: 15,
            }}
          />
        </View>
        <View
          style={{
            flex: 0,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
            marginBottom: 20,
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
          <Image
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              margin: 20,
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
            style={{
              color: '#9b945f',
              fontSize: 22,
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}>
            {salon.name}
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: '#888',
              marginBottom: 20,
            }}>
            Pour {salon.gender}
          </Text>
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
              {coiff.name}
            </Text>
          </View>
          {team.name !== '' && (
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
                {team.name}
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
              }}>
              {moment(dateS).calendar()}
            </Text>
          </View>
          <View
            style={{
              flex: 0,
              flexDirection: 'row',
            }}>
            <TouchableOpacity
              style={{
                paddingVertical: 7,
                paddingHorizontal: 14,
                margin: 20,
                backgroundColor: '#216839',
                borderRadius: 10,
                elevation: 2,
              }}
              onPress={createAppoint}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: 'bold',
                  color: 'white',
                }}>
                Confirmer
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <ScrollView>
          <Text style={{fontSize: 18, textAlign: 'center', marginTop: 50}}>
            Configurez votre rendez-vous avec:
          </Text>
          <Text
            style={{
              fontSize: 24,
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#9b945f',
            }}>
            {salon.name}
          </Text>
          <MaterialCommunityIcons
            style={{
              position: 'absolute',
              padding: 2,
              left: 10,
              top: 7,
            }}
            onPress={() => navigation.goBack()}
            name="window-close"
            color={'black'}
            size={30}
          />
          {code}
        </ScrollView>
      )}
    </>
  );
};

export default Setup;
