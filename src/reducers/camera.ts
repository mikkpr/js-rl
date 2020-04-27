import produce from 'immer';
import { GameState, Action } from '../types';

export const cameraState = {
  camera: {
    x: 0,
    y: 0
  }
};

const updateCameraPosition = (state: GameState, action: Action): GameState => {
  const { x, y, relative } = action.payload;

  const newX = relative ? state.camera.x + x : x;
  const newY = relative ? state.camera.y + y : y;

  return produce(state, state => {
    state.camera.x = newX;
    state.camera.y = newY;
  });
};

const actionMap = {
  'UPDATE_CAMERA_POSITION': updateCameraPosition
};

export default actionMap;