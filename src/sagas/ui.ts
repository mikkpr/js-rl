import { put, select } from 'redux-saga/effects';
import { GameState } from '../types';
import keymage from 'keymage';

export function* showInventoryPanel(): Generator {
  yield put({ type: 'SHOW_PANEL', payload: { panel: 'inventory' } });
};

export function* showDropPanel(): Generator  {
  yield put({ type: 'SHOW_PANEL', payload: { panel: 'inventory:drop' } });
};

export function* closeTopUIPanel(): Generator {
  yield put({ type: 'CLOSE_TOP_PANEL', payload: {} });
  const topPanel = yield select((state: GameState): string[] => state.activePanels);
  keymage.setScope((topPanel as string[]).length > 0
    ? topPanel[(topPanel as string[]).length - 1]
    : 'default'
  );
}

export function* closeAllUIPanels(): Generator {
  yield put({ type: 'CLOSE_ALL_PANELS', payload: {} });
  keymage.setScope('default');
}
