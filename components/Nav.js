import React, {useEffect, useState} from 'react';
import {StatusBar} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Footer from './Footer';
import Detail from './pages/Detail';
import Setup from './pages/Setup';
import Appointment from './pages/Appointment';
import Auth from './pages/Auth';
import messaging from '@react-native-firebase/messaging';
import PushNotification, {Importance} from 'react-native-push-notification';
import Loading from './pages/Loading';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {apiUrl} from './api';
import {useDispatch} from 'react-redux';
import {dispatchGetClient} from '../redux/actions/authAction';
import {dispatchSetNot} from '../redux/actions/notAction';
import Scan from './pages/Scan';
import Wallets from './pages/Wallets';
import Jobs from './pages/Jobs';
import SplashScreen from 'react-native-splash-screen';

const Stack = createNativeStackNavigator();

const Nav = () => {
  const dispatch = useDispatch();
  const [isLoading, setisLoading] = useState(true);
  const [isLoadingF, setisLoadingF] = useState(false);
  const [initialScreen, setinitialScreen] = useState('Home');

  useEffect(() => {
    const getLogin = async () => {
      SplashScreen.hide();
      const firstLogin = await AsyncStorage.getItem('firstLogin');
      if (JSON.parse(firstLogin)) {
        try {
          const res = await axios.post(`${apiUrl}/client/refresh_token`, null);
          dispatch(dispatchGetClient(res));
          setisLoading(false);
        } catch (err) {
          await AsyncStorage.removeItem('firstLogin');
          setisLoading(false);
        }
      } else {
        setisLoading(false);
      }
    };
    getLogin();
  }, [dispatch]);

  useEffect(() => {
    async function requestUserPermission() {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
      }
    }
    requestUserPermission();
  }, []);

  useEffect(() => {
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: function (token) {
        dispatch(dispatchSetNot(token.token));
      },

      // (required) Called when a remote is received or opened, or local notification is opened
      onNotification: function (notification) {
        if (notification.userInteraction) {
          setisLoadingF(true);
          if (notification.data.hasOwnProperty('screen')) {
            setinitialScreen(notification.data.screen);
          }
          setTimeout(() => {
            setisLoadingF(false);
          }, 500);
        }
        // process the notification

        // (required) Called when a remote is received or opened, or local notification is opened
        //notification.finish(PushNotificationIOS.FetchResult.NoData);
      },

      // (optional) Called when Registered Action is pressed and invokeApp is false, if true onNotification will be called (Android)
      onAction: function (notification) {
        // process the action
      },

      // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
      onRegistrationError: function (err) {},

      // IOS ONLY (optional): default: all - Permissions to register.
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      // default: true
      popInitialNotification: true,

      /**
       * (optional) default: true
       * - Specified if permissions (ios) and token (android and ios) will requested or not,
       * - if not, you must call PushNotificationsHandler.requestPermissions() later
       * - if you are not using remote notification or do not have Firebase installed, use this:
       *     requestPermissions: Platform.OS === 'ios'
       */
      requestPermissions: true,
    });

    PushNotification.createChannel({
      channelId: 'AfellaNotId', // (required)
      channelName: 'Afella', // (required)
      channelDescription: 'A channel to categorise your notifications', // (optional) default: undefined.
      playSound: true, // (optional) default: true
      soundName: 'default', // (optional) See `soundName` parameter of `localNotification` function
      importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
      vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
    });

    const push = (title, message, actions) => {
      PushNotification.localNotification({
        channelId: 'AfellaNotId',
        title,
        message,
        actions,
      });
    };
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      push(
        remoteMessage.data.title,
        remoteMessage.data.message,
        JSON.parse(remoteMessage.data.actions),
      );
    });

    return unsubscribe;
  }, []);

  return (
    <>
      <StatusBar backgroundColor="#eee" barStyle="dark-content" />

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {isLoadingF ? (
            <Loading />
          ) : (
            <Stack.Navigator initialRouteName="Footer">
              <Stack.Screen
                options={{headerShown: false}}
                name="Footer"
                component={Footer}
                initialParams={{
                  screen: initialScreen,
                }}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Detail"
                component={Detail}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Appointment"
                component={Appointment}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Setup"
                component={Setup}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Auth"
                component={Auth}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Scan"
                component={Scan}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Wallets"
                component={Wallets}
              />
              <Stack.Screen
                options={{headerShown: false}}
                name="Jobs"
                component={Jobs}
              />
            </Stack.Navigator>
          )}
        </>
      )}
    </>
  );
};

export default Nav;
