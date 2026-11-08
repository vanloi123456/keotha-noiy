/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = 'matching' | 'image_drop' | 'categorize';

// Dạng 1: Nối ý (Left <-> Right)
export interface MatchingPair {
  id: string;
  leftText: string;
  rightText: string;
  leftImage?: string;
  rightImage?: string;
}

// Dạng 2: Kéo thả vào hình ảnh
export interface ImageDropZone {
  id: string;
  label?: string; // Optional label like "Vùng 1"
  x: number; // percentage 0 - 100
  y: number; // percentage 0 - 100
  width: number; // percentage
  height: number; // percentage
  correctCardId: string;
}

export interface ImageAnswerCard {
  id: string;
  text: string;
}

// Dạng 3: Kéo thả tự do / Phân loại
export interface CategoryGroup {
  id: string;
  title: string;
  color: string;
}

export interface CategorizeCard {
  id: string;
  text: string;
  imageUrl?: string;
  targetCategoryId: string; // The category it belongs to
}

// Main Game Data structure
export interface GameData {
  id: string;
  title: string;
  subject: string;
  instructions: string;
  timeLimitSeconds: number; // 0 = no time limit
  mode: GameMode;
  randomizeOrder: boolean;
  createdAt: number;
  updatedAt: number;

  // Dạng 1
  matchingPairs: MatchingPair[];

  // Dạng 2
  backgroundImage: string | null; // Data URL / Base64
  imageDropZones: ImageDropZone[];
  imageAnswerCards: ImageAnswerCard[];

  // Dạng 3
  categories: CategoryGroup[];
  categorizeCards: CategorizeCard[];
}

export const createEmptyGame = (mode: GameMode = 'matching'): GameData => ({
  id: 'game_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
  title: '',
  subject: '',
  instructions: '',
  timeLimitSeconds: 0,
  mode,
  randomizeOrder: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  matchingPairs: [],
  backgroundImage: null,
  imageDropZones: [],
  imageAnswerCards: [],
  categories: [],
  categorizeCards: [],
});

export interface PlayerResult {
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  studentName?: string;
  completedAt: number;
}
