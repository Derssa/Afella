import {combineReducers} from 'redux';
import auth from './authReducer.js';
import salons from './salonsReducer.js';
import not from './notReducer.js';
import posts from './postsReducer.js';

export default combineReducers({auth, salons, not, posts});
