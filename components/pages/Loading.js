import React from 'react';
import {ActivityIndicator, Image, ImageBackground} from 'react-native';
import logo from '../../public/logo-afella.png';
import bg from '../../public/background.jpg';

const Loading = () => {
  return (
    <ImageBackground
      source={bg}
      style={{
        flex: 1,
        justifyContent: 'center',
        width: '100%',
      }}>
      <Image
        style={{
          width: '50%',
          height: 170,
          resizeMode: 'contain',
          alignSelf: 'center',
          marginBottom: 50,
        }}
        source={logo}
      />
      <ActivityIndicator size="large" color="#222" />
    </ImageBackground>
  );
};

export default Loading;
