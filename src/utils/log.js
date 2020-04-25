import { getLog } from './dom';

export const clearLog = () => {
  const logEl = getLog();
  logEl.innerHTML = '';
};

const formatMsg = (msg) => {
  if (typeof msg === 'object') {
    return JSON.stringify(msg, undefined, 2);
  }
  return msg.toLowerCase();
};

const createLogRow = (msg) => {
  const el = document.createElement('div');
  el.classList.add('main__log-row');

  const msgEl = document.createElement('span');
  msgEl.classList.add('main__log-row-msg');
  msgEl.innerHTML = msg;

  el.appendChild(msgEl);

  return el;
};

const addLogRow = msg => {
  const logEl = getLog();
  const row = createLogRow(msg);

  logEl.appendChild(row);

  logEl.scrollTop = logEl.scrollHeight;
};

const appendLastLogRow = msg => {
  const logEl = getLog();
  const lastRow = logEl.children[logEl.childElementCount - 1];

  let countEl = lastRow.children[1];
  if (!countEl) {
    countEl = document.createElement('span');
    countEl.innerHTML = ' (2x)';
    lastRow.appendChild(countEl);
  } else {
    const lastCount = parseInt(countEl.textContent.match(/\s\((\d+)x\)/)[1], 10);
    countEl.innerHTML = ` (${lastCount + 1}x)`;
  }

  logEl.scrollTop = logEl.scrollHeight;
};

const log = (...msgs) => requestAnimationFrame(() => {
  const logEl = getLog();

  msgs
    .map(formatMsg)
    .forEach(msg => {
    const lastRow = logEl.children[logEl.childElementCount - 1];
    if (!lastRow || msg.toLowerCase() !== lastRow.children[0].textContent) {
      addLogRow(msg);
    } else {
      appendLastLogRow(msg);
    }
  });
});

export default log;
