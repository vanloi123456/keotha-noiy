/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameData } from '../types/game';

const STORAGE_KEY_PREFIX = 'interactive_game_';
const SAVED_GAMES_LIST_KEY = 'interactive_game_catalog';

export interface SavedGameSummary {
  id: string;
  title: string;
  subject: string;
  mode: GameData['mode'];
  itemCount: number;
  updatedAt: number;
}

export function getSavedGamesList(): SavedGameSummary[] {
  try {
    const raw = localStorage.getItem(SAVED_GAMES_LIST_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read saved games list', e);
    return [];
  }
}

export function getItemCount(game: GameData): number {
  switch (game.mode) {
    case 'matching':
      return game.matchingPairs?.length || 0;
    case 'image_drop':
      return game.imageDropZones?.length || 0;
    case 'categorize':
      return game.categorizeCards?.length || 0;
    default:
      return 0;
  }
}

export function saveGameToStorage(game: GameData): boolean {
  try {
    const updatedGame: GameData = {
      ...game,
      updatedAt: Date.now(),
    };
    // Save game data
    localStorage.setItem(STORAGE_KEY_PREFIX + game.id, JSON.stringify(updatedGame));

    // Update catalog
    const list = getSavedGamesList();
    const existingIndex = list.findIndex((item) => item.id === game.id);
    const summary: SavedGameSummary = {
      id: game.id,
      title: game.title.trim() ? game.title.trim() : 'Trò chơi chưa đặt tên',
      subject: game.subject || '',
      mode: game.mode,
      itemCount: getItemCount(game),
      updatedAt: updatedGame.updatedAt,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = summary;
    } else {
      list.unshift(summary);
    }

    localStorage.setItem(SAVED_GAMES_LIST_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error('Error saving game', e);
    return false;
  }
}

export function loadGameFromStorage(id: string): GameData | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + id);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading game', e);
    return null;
  }
}

export function deleteGameFromStorage(id: string): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY_PREFIX + id);
    const list = getSavedGamesList().filter((item) => item.id !== id);
    localStorage.setItem(SAVED_GAMES_LIST_KEY, JSON.stringify(list));
    return true;
  } catch (e) {
    console.error('Error deleting game', e);
    return false;
  }
}

export function exportGameToJson(game: GameData) {
  const fileName = (game.title.trim() ? game.title.trim().replace(/[^a-zA-Z0-9\s_À-ỹ-]/g, '') : 'tro-choi') + '.json';
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(game, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseGameFromJson(fileContent: string): GameData | null {
  try {
    const parsed = JSON.parse(fileContent);
    if (!parsed || typeof parsed !== 'object') return null;
    if (!parsed.mode) return null;
    return parsed as GameData;
  } catch (e) {
    console.error('Invalid JSON', e);
    return null;
  }
}
