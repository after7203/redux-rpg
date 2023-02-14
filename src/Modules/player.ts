import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type PlayerState = {
  maxHp: number;
  hp: number;
  atk: number;
  def: number;
  crit: number;
  miss: number;
  gold: number;
};

const initialState: PlayerState = {
  maxHp: 10,
  hp: 10,
  atk: 3,
  def: 0,
  crit: 0.1,
  miss: 0.1,
  gold: 0,
};

export const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    initailize: (state) => {
      state.hp = state.maxHp;
    },
    damaged: (state, action: PayloadAction<number>) => {
      if (state.hp > action.payload) {
        state.hp -= action.payload;
      } else {
        state.hp = 0;
      }
    },
    earn: (state, action: PayloadAction<number>) => {
      state.gold += action.payload;
    },
  },
});

export const module_player = playerSlice.actions;

export default playerSlice.reducer;
