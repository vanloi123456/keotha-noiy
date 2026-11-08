/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Copy, 
  Grid, 
  Layers, 
  Image as ImageIcon, 
  Tag, 
  Palette,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { GameData, CategoryGroup, CategorizeCard } from '../../types/game';
import { sound } from '../../utils/audio';

const PALETTE_COLORS = [
  '#0284c7', // Sky blue
  '#16a34a', // Emerald green
  '#d97706', // Amber
  '#9333ea', // Purple
  '#e11d48', // Rose
  '#0d9488', // Teal
];

interface EditorCategorizeProps {
  game: GameData;
  onUpdateGame: (updated: Partial<GameData>) => void;
}

export const EditorCategorize: React.FC<EditorCategorizeProps> = ({
  game,
  onUpdateGame,
}) => {
  // Category management
  const addCategory = () => {
    const nextColor = PALETTE_COLORS[game.categories.length % PALETTE_COLORS.length];
    const newCat: CategoryGroup = {
      id: 'cat_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      title: '',
      color: nextColor,
    };
    onUpdateGame({ categories: [...game.categories, newCat] });
    sound.playPop();
  };

  const updateCategory = (id: string, updates: Partial<CategoryGroup>) => {
    onUpdateGame({
      categories: game.categories.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const removeCategory = (id: string) => {
    onUpdateGame({
      categories: game.categories.filter((c) => c.id !== id),
      // update cards targeting this category
      categorizeCards: game.categorizeCards.map((card) =>
        card.targetCategoryId === id ? { ...card, targetCategoryId: '' } : card
      ),
    });
    sound.playPop();
  };

  // Card management
  const addCard = () => {
    const newCard: CategorizeCard = {
      id: 'card_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      text: '',
      targetCategoryId: game.categories[0]?.id || '',
    };
    onUpdateGame({ categorizeCards: [...game.categorizeCards, newCard] });
    sound.playPop();
  };

  const updateCard = (id: string, updates: Partial<CategorizeCard>) => {
    onUpdateGame({
      categorizeCards: game.categorizeCards.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    });
  };

  const removeCard = (id: string) => {
    onUpdateGame({
      categorizeCards: game.categorizeCards.filter((c) => c.id !== id),
    });
    sound.playPop();
  };

  const duplicateCard = (card: CategorizeCard) => {
    const clone: CategorizeCard = {
      ...card,
      id: 'card_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
    };
    onUpdateGame({ categorizeCards: [...game.categorizeCards, clone] });
    sound.playPop();
  };

  const handleCardImageUpload = (cardId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateCard(cardId, { imageUrl: reader.result as string });
      sound.playSnap();
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <Grid className="w-5 h-5 text-violet-600" />
            <span>Kéo Thả Tự Do & Phân Loại Nhóm</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tạo các nhóm phân loại (giỏ chứa) và tạo các thẻ nội dung kèm đáp án nhóm tương ứng.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={addCategory}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs md:text-sm font-bold bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm nhóm phân loại</span>
          </button>

          <button
            onClick={addCard}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-200 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thẻ cần phân loại</span>
          </button>
        </div>
      </div>

      {/* Part 1: Categories / Baskets */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-violet-500" />
            <span>Các Nhóm / Giỏ Phân Loại ({game.categories.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Ví dụ: Động vật trên cạn / Động vật dưới nước; Từ chỉ hoạt động / Từ chỉ đặc điểm...</span>
        </div>

        {game.categories.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-slate-500 text-xs md:text-sm mb-3">Chưa có nhóm phân loại nào.</p>
            <button
              onClick={addCategory}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-700 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo nhóm phân loại đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {game.categories.map((cat, idx) => (
              <div
                key={cat.id}
                className="p-4 rounded-2xl border-2 transition-all relative group bg-white shadow-sm"
                style={{ borderColor: cat.color }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
                    Nhóm #{idx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {/* Color picker */}
                    <div className="flex items-center gap-1">
                      {PALETTE_COLORS.map((col) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => updateCategory(cat.id, { color: col })}
                          className={`w-4 h-4 rounded-full transition-transform ${cat.color === col ? 'scale-125 ring-1 ring-slate-400' : 'opacity-60 hover:opacity-100'}`}
                          style={{ backgroundColor: col }}
                        />
                      ))}
                    </div>
                    <button
                      onClick={() => removeCategory(cat.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded transition"
                      title="Xóa nhóm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={cat.title}
                  onChange={(e) => updateCategory(cat.id, { title: e.target.value })}
                  placeholder="Nhập tên nhóm phân loại..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-violet-100 outline-none"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Part 2: Cards Bank */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="font-black text-base text-slate-800 flex items-center gap-2">
            <Tag className="w-4 h-4 text-sky-500" />
            <span>Danh Sách Thẻ Nội Dung ({game.categorizeCards.length})</span>
          </h3>
          <button
            onClick={addCard}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500 hover:bg-sky-600 text-white transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm thẻ</span>
          </button>
        </div>

        {game.categorizeCards.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <p className="text-slate-500 text-xs md:text-sm mb-3">Chưa có thẻ nội dung nào.</p>
            <button
              onClick={addCard}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-sky-500 text-white hover:bg-sky-600 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo thẻ đầu tiên</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {game.categorizeCards.map((card, idx) => (
              <div
                key={card.id}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-violet-300 bg-slate-50/50 flex items-center gap-3 transition-all"
              >
                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 text-[11px] font-black flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>

                {card.imageUrl ? (
                  <div className="relative group flex-shrink-0">
                    <img src={card.imageUrl} alt="Card preview" className="w-12 h-12 object-cover rounded-xl border border-slate-300" />
                    <button
                      onClick={() => updateCard(card.id, { imageUrl: undefined })}
                      className="absolute -top-1 -right-1 bg-rose-500 text-white rounded-full p-0.5"
                      title="Gỡ ảnh"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ) : (
                  <label className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-sky-600 cursor-pointer transition flex-shrink-0" title="Đính kèm ảnh cho thẻ">
                    <ImageIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCardImageUpload(card.id, e)}
                      className="hidden"
                    />
                  </label>
                )}

                <div className="flex-1 space-y-1.5">
                  <input
                    type="text"
                    value={card.text}
                    onChange={(e) => updateCard(card.id, { text: e.target.value })}
                    placeholder="Nội dung thẻ..."
                    className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 focus:border-violet-500 outline-none"
                  />

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-500 flex-shrink-0">Thuộc nhóm:</span>
                    <select
                      value={card.targetCategoryId}
                      onChange={(e) => updateCard(card.id, { targetCategoryId: e.target.value })}
                      className="flex-1 px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-violet-500 outline-none"
                    >
                      <option value="">-- Chưa gán nhóm --</option>
                      {game.categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title || '(Nhóm chưa đặt tên)'}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    onClick={() => duplicateCard(card)}
                    className="p-1.5 text-slate-400 hover:text-sky-600 rounded transition"
                    title="Nhân bản thẻ"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => removeCard(card.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition"
                    title="Xóa thẻ"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
