import * as ROT from 'rot-js';
import setupKeys from './player';
import { World } from 'ecsy';

import GameState, { RunState } from './state';
import { createMap } from './map';
import { game, display } from '.';

import {
  RenderingSystem,
  VisibilitySystem
} from './ecs/systems';
import { createPlayer } from './ecs/entities';
import { Renderable, Viewshed, Position } from './ecs/components';
