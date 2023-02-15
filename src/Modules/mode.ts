import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

type Dungeon = "slime-field" | "golem-canyon" | "wyvern-cave";

type ModeState = {
  name: "village" | "shop" | "dungeon";
  dungeon: Dungeon;
};

const initialState: ModeState = {
  name: "village",
  dungeon: "slime-field",
};

export const modeSlice = createSlice({
  name: "mode",
  initialState,
  reducers: {
    moveVillage: (state) => {
      state.name = "village";
    },
    moveShop: (state) => {
      state.name = "shop";
    },
    moveDungeon: (state, action: PayloadAction<Dungeon>) => {
      state.name = "dungeon";
      state.dungeon = action.payload;
    },
  },
});

export const { moveVillage, moveShop, moveDungeon } = modeSlice.actions;

export default modeSlice.reducer;
