import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type EnemyState = {
  name: string;
  maxHp: number;
  hp: number;
  atk: number;
  gold: number;
  img: string;
  dead: string;
};

const initialState: EnemyState = {
  name: "슬라임",
  maxHp: 5,
  hp: 5,
  atk: 1,
  gold: 1,
  img: "슬라임.gif",
  dead: "슬라임_dead.png",
};

export const enemySlice = createSlice({
  name: "enemy",
  initialState,
  reducers: {
    initailize: (state, action: PayloadAction<EnemyState>) => {
      state.name = action.payload.name;
      state.maxHp = action.payload.maxHp;
      state.hp = action.payload.hp;
      state.atk = action.payload.atk;
      state.gold = action.payload.gold;
      state.img = action.payload.img;
      state.dead = action.payload.dead;
    },
    damaged: (state, action: PayloadAction<number>) => {
      if (state.hp > action.payload) {
        state.hp -= action.payload;
      } else {
        state.hp = 0;
      }
    },
  },
});

export const module_enemy = enemySlice.actions;

export default enemySlice.reducer;
