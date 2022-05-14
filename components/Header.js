import React, {useState} from 'react';
import {View, Image, TextInput} from 'react-native';
import logo_afella from '../public/logo-afella.png';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Header = ({navigation, searchSalons, getSalons}) => {
  const [isSearching, setisSearching] = useState(false);
  return (
    <View
      style={{
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        borderBottom: 1,
        paddingVertical: 12,
        backgroundColor: '#fff',
      }}>
      {!isSearching ? (
        <>
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
          <Ionicons
            style={{
              position: 'absolute',
              paddingTop: 12,
              paddingRight: 15,
              alignSelf: 'flex-end',
            }}
            onPress={() => {
              setisSearching(true);
            }}
            name="search"
            color={'#aaa'}
            size={32}
          />
        </>
      ) : (
        <>
          <TextInput
            style={{
              height: 35,
              alignSelf: 'flex-start',
              backgroundColor: '#eee',
              width: '80%',
              marginLeft: 12,
              borderRadius: 5,
              padding: 0,
              paddingLeft: 10,
            }}
            autoFocus={true}
            placeholder="Recherche"
            onChangeText={text => searchSalons(text)}
          />
          <MaterialCommunityIcons
            style={{
              position: 'absolute',
              paddingTop: 10,
              paddingRight: 12,
              alignSelf: 'flex-end',
            }}
            onPress={() => {
              setisSearching(false);
              getSalons();
            }}
            name="window-close"
            color={'#aaa'}
            size={38}
          />
        </>
      )}
    </View>
  );
};

export default Header;
