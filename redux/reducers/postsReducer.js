import ACTIONS from '../actions/';

const initialState = {
  posts: [],
};

const postsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.POSTS:
      return {
        ...state,
        posts: action.payload.posts,
      };
    default:
      return state;
  }
};

export default postsReducer;
