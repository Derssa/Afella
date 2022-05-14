import ACTIONS from './index';

export const dispatchGetClient = res => {
  return {
    type: ACTIONS.AUTH,
    payload: {
      client: res.data.client,
      token: res.data.access_token,
    },
  };
};

export const dispatchUpdateClient = res => {
  return {
    type: ACTIONS.UPDATECLIENT,
    payload: {
      client: res.data.client,
    },
  };
};

export const dispatchUpdateLocation = location => {
  return {
    type: ACTIONS.UPDATELOCATION,
    payload: {
      location,
    },
  };
};
