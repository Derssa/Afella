import ACTIONS from './index';

export const dispatchGetSalons = salons => {
  return {
    type: ACTIONS.SALONS,
    payload: {
      salons: salons,
    },
  };
};
