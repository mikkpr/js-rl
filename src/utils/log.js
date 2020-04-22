import { getLog } from './dom';

export const clearLog = () => {
  const logEl = getLog();
  logEl.innerHTML = '';
};

const formatMsg = (msg) => {
  if (typeof msg === 'object') {
    return JSON.stringify(msg, undefined, 2);
  }
  return msg;
};

const createLogRow = (msg) => {
  const el = document.createElement('div');
  el.classList.add('main__log-row');

  const formattedMsg = formatMsg(msg);
  el.innerHTML = formattedMsg;

  return el;
};

const log = (...msgs) => {
  const logEl = getLog();
  const rows = msgs.map(createLogRow);

  rows.forEach((row) => logEl.appendChild(row));

  logEl.scrollTop = logEl.scrollHeight;
};

export default log;
