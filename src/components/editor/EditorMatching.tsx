/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Shuffle, 
  Image as ImageIcon, 
  Check, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Link2
} from 'lucide-react';
import { GameData, MatchingPair } from '../../types/game';
import { sound } from '../../utils/audio';

interface EditorMatchingProps {
  game: GameData;
  onUpdatePairs: (pairs: MatchingPair[]) => void;
  onUpdateGame: (updated: Partial<GameData>) => void;
}

export const EditorMatching: React.FC<EditorMatchingProps> = ({
  game,
  onUpdatePairs,
  onUpdateGame,
}) => {
  const [history, setHistory] = useState<MatchingPair[][]>([]);

  const pushHistory = (currentPairs: MatchingPair[]) => {
    setHistory((prev) => [...prev.slice(-9), currentPairs]);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((prevHist) => prevHist.slice(0, -1));
    onUpdatePairs(prev);
    sound.playPop();
  };

  const addPair = () => {
    pushHistory(game.matchingPairs);
    const newPair: MatchingPair = {
      id: 'pair_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      leftText: '',
      rightText: '',
    };
    onUpdatePairs([...game.matchingPairs, newPair]);
    sound.playPop();
  };

  const updatePair = (id: string, updates: Partial<MatchingPair>) => {
    onUpdatePairs(
      game.matchingPairs.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const removePair = (id: string) => {
    pushHistory(game.matchingPairs);
    onUpdatePairs(game.matchingPairs.filter((p) => p.id !== id));
    sound.playPop();
  };

  const duplicatePair = (pair: MatchingPair) => {
    pushHistory(game.matchingPairs);
    const clone: MatchingPair = {
      ...pair,
      id: 'pair_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    };
    onUpdatePairs([...game.matchingPairs, clone]);
    sound.playPop();
  };

  const movePair = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= game.matchingPairs.length) return;
    pushHistory(game.matchingPairs);
    const list = [...game.matchingPairs];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);
    onUpdatePairs(list);
    sound.playPop();
  };

  const clearAll = () => {
    if (game.matchingPairs.length === 0) return;
    if (confirm('Thầy cô có chắc chắn muốn xóa toàn bộ các cặp nối ý này không?')) {
      pushHistory(game.matchingPairs);
      onUpdatePairs([]);
      sound.playPop();
    }
  };

  const handleImageUpload = (id: string, side: 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (side === 'left') {
        updatePair(id, { leftImage: result });
      } else {
        updatePair(id, { rightImage: result });
      }
      sound.playSnap();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Action Bar */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Link2 className="w-5 h-5 text-sky-600" />
            <span>Soạn Thảo Cặp Nối Ý (Cột Trái ⟷ Cột Phải)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mỗi hàng là một cặp tương ứng chính xác. Khi học sinh chơi, hệ thống sẽ kiểm tra dựa theo các cặp này.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {history.length > 0 && (
            <button
              onClick={handleUndo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Hoàn tác thao tác vừa rồi"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Hoàn tác ({history.length})</span>
            </button>
          )}

          <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-sky-50 text-sky-800 text-xs font-bold cursor-pointer border border-sky-200">
            <input
              type="checkbox"
              checked={game.randomizeOrder}
              onChange={(e) => onUpdateGame({ randomizeOrder: e.target.checked })}
              className="rounded text-sky-600 focus:ring-sky-500"
            />
            <Shuffle className="w-3.5 h-3.5" />
            <span>Xáo trộn cột phải khi chơi</span>
          </label>

          {game.matchingPairs.length > 0 && (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa tất cả</span>
            </button>
          )}

          <button
            onClick={addPair}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm cặp nối mới</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {game.matchingPairs.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-sky-200 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4">
            <Link2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-700">Chưa có cặp nối ý nào</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mt-1 mb-6">
            Bấm nút <strong>"Thêm cặp nối mới"</strong> bên dưới để bắt đầu nhập nội dung cho cột bên trái và cột bên phải.
          </p>
          <button
            onClick={addPair}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-200 transition transform hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm cặp nối đầu tiên</span>
          </button>
        </div>
      )}

      {/* Pairs List */}
      {game.matchingPairs.length > 0 && (
        <div className="space-y-3.5">
          {game.matchingPairs.map((pair, index) => (
            <div
              key={pair.id}
              className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:border-sky-300 transition-all flex flex-col md:flex-row items-stretch md:items-center gap-3"
            >
              {/* Index & Reorder */}
              <div className="flex md:flex-col items-center justify-between md:justify-center gap-1 text-slate-400">
                <span className="w-7 h-7 rounded-full bg-slate-100 font-black text-xs text-slate-600 flex items-center justify-center">
                  {index + 1}
                </span>
                <div className="flex md:flex-col gap-0.5">
                  <button
                    disabled={index === 0}
                    onClick={() => movePair(index, 'up')}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-600"
                    title="Di chuyển lên"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    disabled={index === game.matchingPairs.length - 1}
                    onClick={() => movePair(index, 'down')}
                    className="p-1 rounded hover:bg-slate-100 disabled:opacity-20 text-slate-600"
                    title="Di chuyển xuống"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Left Item Input */}
              <div className="flex-1 bg-sky-50/50 p-3 rounded-2xl border border-sky-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-sky-700">
                    Nội dung Cột Trái (Ý A)
                  </span>
                  <label className="text-slate-400 hover:text-sky-600 cursor-pointer p-1 rounded transition" title="Đính kèm ảnh nhỏ cho ý này">
                    <ImageIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(pair.id, 'left', e)}
                      className="hidden"
                    />
                  </label>
                </div>
                {pair.leftImage && (
                  <div className="relative inline-block mb-2 group">
                    <img src={pair.leftImage} alt="Left" className="h-14 w-auto object-cover rounded-lg border border-sky-200 shadow-sm" />
                    <button
                      onClick={() => updatePair(pair.id, { leftImage: undefined })}
                      className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={pair.leftText}
                  onChange={(e) => updatePair(pair.id, { leftText: e.target.value })}
                  placeholder="Nhập nội dung cột trái..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 text-slate-800 text-sm font-semibold outline-none"
                />
              </div>

              {/* Link Indicator Icon */}
              <div className="hidden md:flex flex-col items-center justify-center px-1 text-sky-400">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600">
                  <Link2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-sky-600 mt-1">NỐI VỚI</span>
              </div>

              {/* Right Item Input */}
              <div className="flex-1 bg-amber-50/50 p-3 rounded-2xl border border-amber-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-700">
                    Nội dung Cột Phải (Ý B tương ứng)
                  </span>
                  <label className="text-slate-400 hover:text-amber-600 cursor-pointer p-1 rounded transition" title="Đính kèm ảnh nhỏ cho ý này">
                    <ImageIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(pair.id, 'right', e)}
                      className="hidden"
                    />
                  </label>
                </div>
                {pair.rightImage && (
                  <div className="relative inline-block mb-2 group">
                    <img src={pair.rightImage} alt="Right" className="h-14 w-auto object-cover rounded-lg border border-amber-200 shadow-sm" />
                    <button
                      onClick={() => updatePair(pair.id, { rightImage: undefined })}
                      className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow hover:bg-rose-600"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={pair.rightText}
                  onChange={(e) => updatePair(pair.id, { rightText: e.target.value })}
                  placeholder="Nhập nội dung cột phải tương ứng..."
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 text-slate-800 text-sm font-semibold outline-none"
                />
              </div>

              {/* Duplicate & Delete Buttons */}
              <div className="flex items-center justify-end gap-1.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => duplicatePair(pair)}
                  className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition"
                  title="Nhân bản cặp này"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removePair(pair.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Xóa cặp này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
