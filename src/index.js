import game from './gamestate';
import { setupInput } from './input';
import { setupPlayer } from './player';
import { setupMap } from './map';

window.game = game;

const setup = async () => {
  await setupInput();
  await setupPlayer();
  await setupMap();
};

setup();
