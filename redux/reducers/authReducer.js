import ACTIONS from '../actions/';

const initialState = {
  client: {},
  token: '',
  location: [],
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.AUTH:
      return {
        ...state,
        client: action.payload.client,
        token: action.payload.token,
      };
    case ACTIONS.UPDATECLIENT:
      return {
        ...state,
        client: action.payload.client,
      };
    case ACTIONS.UPDATELOCATION:
      return {
        ...state,
        location: action.payload.location,
      };
    default:
      return state;
  }
};

export default authReducer;
