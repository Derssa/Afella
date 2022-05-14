import React, {useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from './pages/Home';
import Fav from './pages/Fav';
import Rv from './pages/Rv';
import inAppMessaging from '@react-native-firebase/in-app-messaging';
import Feeds from './pages/Feeds';

const Tab = createBottomTabNavigator();

const Footer = ({route}) => {
  const {screen} = route.params;

  useEffect(async () => {
    await inAppMessaging().setMessagesDisplaySuppressed(true);
  }, []);

  return (
    <>
      <Tab.Navigator
        initialRouteName={screen}
        screenOptions={{
          tabBarActiveTintColor: '#9b945f',
        }}>
        <Tab.Screen
          name="Home"
          component={Home}
          options={{
            headerShown: false,
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons name="home" color={color} size={30} />
            ),
          }}
        />
        <Tab.Screen
          name="Favories"
          component={Fav}
          options={{
            headerShown: false,
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons name="heart" color={color} size={25} />
            ),
          }}
          initialParams={{screen}}
        />
        <Tab.Screen
          name="Rendez-vous"
          component={Rv}
          options={{
            headerShown: false,
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons
                name="calendar-clock"
                color={color}
                size={25}
              />
            ),
          }}
        />
        <Tab.Screen
          name="Posts"
          component={Feeds}
          options={{
            headerShown: false,
            tabBarIcon: ({color}) => (
              <MaterialCommunityIcons name="post" color={color} size={25} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  );
};

export default Footer;
