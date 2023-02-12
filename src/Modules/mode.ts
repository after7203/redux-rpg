import { createAction, createReducer } from 'typesafe-actions';

// const { createStandardAction } = deprecated;

// export const moveVillage = createStandardAction('mode/VILLAGE')();
// export const moveShop = createStandardAction('mode/SHOP')();
// export const moveDungeon = createStandardAction('mode/DUNGEON')();

export const moveVillage = createAction('mode/VILLAGE')();
export const moveShop = createAction('mode/SHOP')();
export const moveDungeon = createAction('mode/DUNGEON')();

const MODE = {
  VILLAGE: 'VILLAGE',
  SHOP: 'SHOP',
  DUNGEON: 'DUNGEON',
}

type ModeState = {
  mode: string;
};

const initialState: ModeState = {
  mode: MODE.VILLAGE
};

const mode = createReducer(initialState)
  .handleAction(moveVillage, () => ({ mode: MODE.VILLAGE }))
  .handleAction(moveShop, () => ({ mode: MODE.SHOP }))
  .handleAction(moveDungeon, () => ({ mode: MODE.DUNGEON }))

export default mode;