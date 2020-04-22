import game from './gamestate';

window.game = game;

const setup = () => {
  game.dispatch({
    type: 'LOG_MESSAGE',
    message: 'TEST LOG PLEASE IGNORE.',
  });
};

setup();
