import produce from 'immer';
import { Log, GameState, Action } from '../types';

export const logState: { log: Log } = {
  log: []
};

const addMessage = (state: GameState, action: Action): GameState => {
  return produce(state, state => {
    const msg = action.payload.message;
    if (state.log.length > 0 && state.log[state.log.length - 1].text === msg) {
      const last = state.log.pop();
      state.log.push({ ...last, count: last.count + 1 });
    } else {
      state.log.push({
        text: msg,
        count: 1,
        fg: '#fff',
        bg: '#000'
      });
    }
  });
};

const logActions = {
  'LOG_MESSAGE': addMessage
};

export default logActions;