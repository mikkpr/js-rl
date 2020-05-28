import state from './state';
import { WIDTH, HEIGHT, LOG_HEIGHT } from './constants';

export const drawGUI = () => {
  drawBorders(); 
  drawLog(state.getState().log);
}

const drawBorders = () => {
  const fg = '#333';
  const bg = 'black';
  for (let x = 1; x < WIDTH - 1; x++) {
    state.display.draw(x, 0, '─', fg, bg);
    state.display.draw(x, HEIGHT - 1, '═', fg, bg);
    state.display.draw(x, HEIGHT + LOG_HEIGHT - 1, '─', fg, bg);
  }
  for (let y = 1; y < HEIGHT + LOG_HEIGHT - 1; y++) {
    state.display.draw(0, y, '│', fg, bg);
    state.display.draw(WIDTH - 1, y, '│', fg, bg); 
  }
  state.display.draw(0, 0, '┌', fg, bg);
  state.display.draw(0, HEIGHT - 1, '╞', fg, bg);
  state.display.draw(WIDTH - 1, HEIGHT - 1, '╡', fg, bg);
  state.display.draw(WIDTH - 1, 0, '┐', fg, bg);
  state.display.draw(0, HEIGHT + LOG_HEIGHT - 1, '└', fg, bg);
  state.display.draw(WIDTH - 1, HEIGHT + LOG_HEIGHT - 1, '┘', fg, bg);
}

const drawLog = (log) => {
  if (!state.display) { return; }
  const N = LOG_HEIGHT - 1;
  const colorOffset = Math.max(N - log.length, 0);
  const lastLines = (log.length <= N ? [...log] : [...log].slice(log.length - N)).reverse();
  for (let i = 0; i < lastLines.length; i++) {
    const line = lastLines[lastLines.length - i - 1];
    const chars = '4579bdf'.split('');
    const lineColor = `#${ (new Array(3)).fill(chars[i + colorOffset]).join('') }`;
    state.display.drawText(2, HEIGHT + i, `%c{${lineColor}}${line}`);
  }
}
