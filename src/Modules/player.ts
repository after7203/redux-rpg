import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import Items from "DataBase/items";

type PlayerState = {
  maxHp: number;
  hp: number;
  atk: number;
  atk_amp: number;
  def_amp: number;
  crit: number;
  miss: number;
  gold: number;
  equip: number[];
};

type item = {
  name: string;
  maxHp: number;
  hp: number;
  atk: number;
  atk_amp: number;
  def_amp: number;
  crit: number;
  equip_info: number[];
  gold: number;
  img: string;
};

const initialState: PlayerState = {
  maxHp: 10,
  hp: 10,
  atk: 3,
  atk_amp: 0,
  def_amp: 0,
  crit: 0.1,
  miss: 0.1,
  gold: 1000,
  equip: [0, 0, 0, 0, 0, 0],
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
    equip: (state, action: PayloadAction<item>) => {
      const part = action.payload.equip_info[0];
      const tier = state.equip[part];
      const wearing_item = Items[part][tier];
      state.gold -= action.payload.gold;
      state.maxHp += action.payload.maxHp - wearing_item.maxHp;
      state.hp += action.payload.hp - wearing_item.hp;
      state.atk += action.payload.atk - wearing_item.atk;
      state.atk_amp += action.payload.atk_amp - wearing_item.atk_amp;
      state.def_amp += action.payload.def_amp - wearing_item.def_amp;
      state.crit += action.payload.crit - wearing_item.crit;
      const copy = [...state.equip];
      copy[action.payload.equip_info[0]] = action.payload.equip_info[1];
      state.equip = copy;
    },
  },
});

export const module_player = playerSlice.actions;

export default playerSlice.reducer;
