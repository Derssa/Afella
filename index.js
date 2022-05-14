/**
 * @format
 */
import React from 'react';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import PushNotification, {Importance} from 'react-native-push-notification';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  PushNotification.localNotification({
    channelId: 'AfellaNotId',
    title: remoteMessage.data.title,
    message: remoteMessage.data.message,
    actions: remoteMessage.data.actions,
    data: remoteMessage.data.handle,
  });

  try {
    let handle = JSON.parse(remoteMessage.data.handle);
    let Adate = new Date(handle.date);
    let NAdate = new Date(Adate.getTime() - 30 * 60 * 1000);

    if (handle.hasOwnProperty('accepted')) {
      PushNotification.localNotificationSchedule({
        channelId: 'AfellaNotId',
        title: remoteMessage.data.title,
        message:
          handle.team === null
            ? `il vous reste 30 minutes pour votre rendez-vous avec ` +
              remoteMessage.data.title
            : `il vous reste 30 minutes pour votre rendez-vous avec ` +
              handle.team,
        actions: ['Montre moi le chemin'],
        date: NAdate,
        data: remoteMessage.data.handle,
        allowWhileIdle: true,
        importance: Importance.HIGH,
      });
    }
  } catch (err) {}
});

function HeadlessCheck({isHeadless}) {
  if (isHeadless) {
    // App has been launched in the background by iOS, ignore
    return null;
  }

  return <App />;
}

AppRegistry.registerComponent(appName, () => HeadlessCheck);
