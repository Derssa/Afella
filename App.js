import 'react-native-gesture-handler';
import React,{useRef} from 'react';
import DataProvider from './redux/store';
import analytics from '@react-native-firebase/analytics';
import {NavigationContainer} from '@react-navigation/native';
import DrawerC from './components/DrawerC';

const App = () => {
  const routeNameRef = useRef();
  const navigationRef = useRef();
  return (
    <DataProvider>
      <NavigationContainer
        ref={navigationRef}
        onReady={() => {
          routeNameRef.current = navigationRef.current.getCurrentRoute().name;
        }}
        onStateChange={async () => {
          const previousRouteName = routeNameRef.current;
          const currentRouteName = navigationRef.current.getCurrentRoute().name;

          if (previousRouteName !== currentRouteName) {
            await analytics().logScreenView({
              screen_name: currentRouteName,
              screen_class: currentRouteName,
            });
          }
          routeNameRef.current = currentRouteName;
        }}>
        <DrawerC />
      </NavigationContainer>
    </DataProvider>
  );
};

export default App;
