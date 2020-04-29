import { put, select } from 'redux-saga/effects';

export function* showInventoryPanel(): Generator {
  yield put({ type: 'SHOW_PANEL', payload: { panel: 'inventory' } });
};

export function* showDropPanel(): Generator  {
  yield put({ type: 'SHOW_PANEL', payload: { panel: 'inventory:drop' } });
};

export function* closeAllUIPanels(): Generator {
  yield put({ type: 'CLOSE_ALL_PANELS', payload: {} });
};
