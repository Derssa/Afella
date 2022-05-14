import ACTIONS from '../actions/';

const initialState = {
  notification: '',
};

const notReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.NOT:
      return {
        ...state,
        notification: action.payload.notification,
      };
    default:
      return state;
  }
};

export default notReducer;