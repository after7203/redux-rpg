import { configureStore } from "@reduxjs/toolkit";
import modeReducer from "./mode";
import enemyReducer from "./enemy";
import playerReducer from "./player";

export const store = configureStore({
  reducer: { mode: modeReducer, player: playerReducer, enemy: enemyReducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
