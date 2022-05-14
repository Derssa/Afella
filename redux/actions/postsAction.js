import ACTIONS from './index';

export const dispatchGetPosts = posts => {
  return {
    type: ACTIONS.POSTS,
    payload: {
      posts: posts,
    },
  };
};
