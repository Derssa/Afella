import React, {useState, useEffect} from 'react';
import {View, Text, ToastAndroid} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import {dispatchGetClient} from '../../../redux/actions/authAction';
import {dispatchGetPosts} from '../../../redux/actions/postsAction';
import axios from 'axios';
import {apiUrl} from '../../api';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LikeButton = ({item, screen}) => {
  const [isLiked, setisLiked] = useState(false);
  const {client, token} = useSelector(state => state.auth);
  const {posts} = useSelector(state => state.posts);
  const [postLikes, setpostLikes] = useState(item.likesCount);
  const [showStatePost, setshowStatePost] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    if (item.likes.find(clientId => clientId._id === client._id)) {
      setisLiked(true);
    }
  }, []);

  const handleLike = async () => {
    if (token !== '') {
      if (!showStatePost) {
        setisLiked(true);
        setshowStatePost(true);
        if (screen === 'favFeeds') {
          setpostLikes(postLikes + 1);
        } else {
          setpostLikes(item.likesCount + 1);
        }

        try {
          await axios.patch(`${apiUrl}/client/post/${item._id}/like`, null, {
            headers: {Authorization: token},
          });
          //binary search
          if (posts.length > 0) {
            let begin = 0;
            let end = posts.length - 1;
            while (begin <= end) {
              let center = Math.floor((begin + end) / 2);
              if (posts[center]._id === item._id) {
                let postsClone = [...posts];
                postsClone[center].likesCount =
                  postsClone[center].likesCount + 1;
                postsClone[center].isLiked = true;
                dispatch(dispatchGetPosts(postsClone));
                break;
              } else if (item._id < posts[center]._id) {
                begin = center + 1;
              } else {
                end = center - 1;
              }
            }
          }
          //end binary search
          setshowStatePost(false);
        } catch (err) {
          setshowStatePost(false);
          if (err.response.data.msg === 'Your Bloqued') {
            dispatch(dispatchGetClient({data: {client: {}, access_token: ''}}));
            await AsyncStorage.removeItem('firstLogin');
          }
        }
      }
    } else {
      ToastAndroid.show('Connectez-vous', ToastAndroid.SHORT);
    }
  };

  const handleUnLike = async () => {
    if (token !== '') {
      if (!showStatePost) {
        setisLiked(false);
        setshowStatePost(true);
        if (screen === 'favFeeds') {
          setpostLikes(postLikes - 1);
        } else {
          setpostLikes(item.likesCount - 1);
        }

        try {
          await axios.patch(`${apiUrl}/client/post/${item._id}/unlike`, null, {
            headers: {Authorization: token},
          });
          //binary search
          if (posts.length > 0) {
            let begin = 0;
            let end = posts.length - 1;
            while (begin <= end) {
              let center = Math.floor((begin + end) / 2);
              if (posts[center]._id === item._id) {
                let postsClone = [...posts];
                postsClone[center].isLiked = false;
                postsClone[center].likesCount =
                  postsClone[center].likesCount - 1;
                dispatch(dispatchGetPosts(postsClone));
                break;
              } else if (item._id < posts[center]._id) {
                begin = center + 1;
              } else {
                end = center - 1;
              }
            }
          }
          //end binary search
          setshowStatePost(false);
        } catch (err) {
          setshowStatePost(false);
          if (err.response.data.msg === 'Your Bloqued') {
            dispatch(dispatchGetClient({data: {client: {}, access_token: ''}}));
            await AsyncStorage.removeItem('firstLogin');
          }
        }
      }
    } else {
      ToastAndroid.show('Connectez-vous', ToastAndroid.SHORT);
    }
  };

  return (
    <>
      {item.photo !== '' ? (
        <View
          style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            backgroundColor: '#fff',
            padding: 3,
            borderRadius: 15,
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
            elevation: 10,
          }}>
          {!showStatePost && item.hasOwnProperty('isLiked') ? (
            item.isLiked ? (
              <MaterialCommunityIcons
                style={{marginRight: 5}}
                onPress={handleUnLike}
                name="heart"
                color={'#b73531'}
                size={40}
              />
            ) : (
              <MaterialCommunityIcons
                style={{marginRight: 5}}
                onPress={handleLike}
                name="heart-outline"
                color={'#bbb'}
                size={40}
              />
            )
          ) : isLiked ? (
            <MaterialCommunityIcons
              style={{marginRight: 5}}
              onPress={handleUnLike}
              name="heart"
              color={'#b73531'}
              size={40}
            />
          ) : (
            <MaterialCommunityIcons
              style={{marginRight: 5}}
              onPress={handleLike}
              name="heart-outline"
              color={'#bbb'}
              size={40}
            />
          )}
          <Text
            style={{
              color: '#444',
              fontSize: 18,
              fontWeight: 'bold',
              marginRight: 4,
              elevation: 5,
            }}>
            {!showStatePost
              ? item.hasOwnProperty('isLiked')
                ? item.likesCount
                : postLikes
              : postLikes}
          </Text>
        </View>
      ) : (
        <View
          style={{
            marginLeft: 10,
            marginBottom: 10,
            flex: 0,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          {!showStatePost && item.hasOwnProperty('isLiked') ? (
            item.isLiked ? (
              <MaterialCommunityIcons
                style={{marginRight: 5}}
                onPress={handleUnLike}
                name="heart"
                color={'#b73531'}
                size={40}
              />
            ) : (
              <MaterialCommunityIcons
                style={{marginRight: 5}}
                onPress={handleLike}
                name="heart-outline"
                color={'#bbb'}
                size={40}
              />
            )
          ) : isLiked ? (
            <MaterialCommunityIcons
              style={{marginRight: 5}}
              onPress={handleUnLike}
              name="heart"
              color={'#b73531'}
              size={40}
            />
          ) : (
            <MaterialCommunityIcons
              style={{marginRight: 5}}
              onPress={handleLike}
              name="heart-outline"
              color={'#bbb'}
              size={40}
            />
          )}
          <Text
            style={{
              color: '#444',
              fontSize: 18,
              fontWeight: 'bold',
              marginRight: 4,
              elevation: 5,
            }}>
            {!showStatePost
              ? item.hasOwnProperty('isLiked')
                ? item.likesCount
                : postLikes
              : postLikes}
          </Text>
        </View>
      )}
    </>
  );
};

export default LikeButton;
