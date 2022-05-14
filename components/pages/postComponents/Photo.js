import React, {useEffect, useState} from 'react';
import {View, Image} from 'react-native';

const Photo = ({photo}) => {
  const [height, setheight] = useState(400);

  useEffect(() => {
    Image.getSize(photo, (w, h) => {
      if (h <= 400) {
        setheight(h);
      } else {
        setheight(400);
      }
    });
  }, []);

  return (
    <View>
      <Image
        style={{
          width: '100%',
          height: height,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          overlayColor: '#eee',
        }}
        source={{
          uri: photo,
        }}
      />
    </View>
  );
};

export default Photo;
