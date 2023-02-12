import { combineReducers } from 'redux';
import mode from './mode';

const rootReducer = combineReducers({
  mode
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;