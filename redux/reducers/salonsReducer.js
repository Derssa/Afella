import ACTIONS from '../actions/';

const initialState = {
  salons: [],
};

const salonsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ACTIONS.SALONS:
      return {
        ...state,
        salons: action.payload.salons,
      };
    default:
      return state;
  }
};

export default salonsReducer;
