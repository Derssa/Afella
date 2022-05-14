import React from 'react';
import {
  View,
  ScrollView,
  Image,
  Text,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import logo_afella from '../../public/logo-afella.png';

const Profile = ({navigation}) => {
  return (
    <>
      <View
        style={{
          borderBottomColor: '#ccc',
          borderBottomWidth: 1,
          borderBottom: 1,
          paddingVertical: 12,
          backgroundColor: '#fff',
        }}>
        <Image
          style={{
            width: '30%',
            height: 35,
            resizeMode: 'contain',
            alignSelf: 'center',
          }}
          source={logo_afella}
        />
      </View>
      <ScrollView>
        <View
          style={{
            flex: 0,
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            marginVertical: 40,
            marginHorizontal: 20,
            alignSelf: 'center',
            backgroundColor: '#fff',
            elevation: 3,
            height: 400,
            borderRadius: 20,
            position: 'relative',
            width: '90%',
          }}>
          <Text
            style={{
              fontSize: 25,
            }}>
            Mon Profile:
          </Text>
          <View
            style={{
              width: '90%',
            }}>
            <TextInput
              style={{
                backgroundColor: '#eee',
                height: 45,
                paddingLeft: 12,
                borderRadius: 10,
                padding: 0,
                marginVertical: 10,
              }}
              placeholder="Nom"
            />
            <TextInput
              style={{
                backgroundColor: '#eee',
                height: 45,
                paddingLeft: 12,
                borderRadius: 10,
                padding: 0,
                marginVertical: 10,
              }}
              placeholder="Prenom"
            />
            <TextInput
              style={{
                backgroundColor: '#ccc',
                height: 45,
                paddingLeft: 12,
                borderRadius: 10,
                padding: 0,
                marginVertical: 10,
              }}
              placeholder="Téléphone"
              editable={false}
              selectTextOnFocus={false}
            />
          </View>
          <TouchableOpacity
            style={{
              paddingVertical: 7,
              paddingHorizontal: 14,
              backgroundColor: '#9b945f',
              borderRadius: 10,
              elevation: 2,
            }}
            onPress={() => {
              navigation.navigate('Auth');
            }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: 'bold',
                color: 'white',
              }}>
              Modifier
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
};

export default Profile;
