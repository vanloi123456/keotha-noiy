/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Settings, Clock, BookOpen, HelpCircle, Shuffle } from 'lucide-react';
import { GameData } from '../../types/game';

interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameData;
  onUpdateGame: (updated: Partial<GameData>) => void;
}

export const GameSettingsModal: React.FC<GameSettingsModalProps> = ({
  isOpen,
  onClose,
  game,
  onUpdateGame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-600" />
            <h3 className="font-black text-lg text-slate-800">Cài Đặt Trò Chơi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1">
              Tên trò chơi
            </label>
            <input
              type="text"
              value={game.title}
              onChange={(e) => onUpdateGame({ title: e.target.value })}
              placeholder="Nhập tên trò chơi..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:border-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Chủ đề / Tên bài học</span>
            </label>
            <input
              type="text"
              value={game.subject}
              onChange={(e) => onUpdateGame({ subject: e.target.value })}
              placeholder="Chủ đề bài học..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:border-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Giới hạn thời gian (giây)</span>
            </label>
            <input
              type="number"
              min="0"
              step="10"
              value={game.timeLimitSeconds || ''}
              onChange={(e) => onUpdateGame({ timeLimitSeconds: Math.max(0, parseInt(e.target.value) || 0) })}
              placeholder="0 = Không giới hạn"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-800 focus:border-sky-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Hướng dẫn chơi</span>
            </label>
            <textarea
              rows={2}
              value={game.instructions}
              onChange={(e) => onUpdateGame({ instructions: e.target.value })}
              placeholder="Lời dặn hoặc hướng dẫn cho học sinh..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:border-sky-500 outline-none resize-none"
            />
          </div>

          <label className="flex items-center gap-2 pt-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={game.randomizeOrder}
              onChange={(e) => onUpdateGame({ randomizeOrder: e.target.checked })}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <Shuffle className="w-3.5 h-3.5 text-slate-400" />
            <span>Xáo trộn vị trí thẻ / cột trả lời khi học sinh bắt đầu chơi</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md transition"
          >
            Xong
          </button>
        </div>
      </div>
    </div>
  );
};
