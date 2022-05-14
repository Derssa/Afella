import ACTIONS from './index';

export const dispatchSetNot = notification => {
  return {
    type: ACTIONS.NOT,
    payload: {
      notification,
    },
  };
};