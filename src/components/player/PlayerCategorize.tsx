/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, X, Sparkles, Layers, Tag } from 'lucide-react';
import { GameData, CategoryGroup, CategorizeCard } from '../../types/game';
import { sound } from '../../utils/audio';

interface PlayerCategorizeProps {
  game: GameData;
  categorizeAnswers: Record<string, string>; // cardId -> categoryId
  onChangeCategorizeAnswers: (answers: Record<string, string>) => void;
  isChecked: boolean;
}

export const PlayerCategorize: React.FC<PlayerCategorizeProps> = ({
  game,
  categorizeAnswers,
  onChangeCategorizeAnswers,
  isChecked,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    if (isChecked) return;
    sound.playPop();
    setSelectedCardId((prev) => (prev === cardId ? null : cardId));
  };

  const handleCategoryClick = (catId: string) => {
    if (isChecked) return;

    if (selectedCardId) {
      sound.playSnap();
      const next = { ...categorizeAnswers, [selectedCardId]: catId };
      onChangeCategorizeAnswers(next);
      setSelectedCardId(null);
    }
  };

  const handleRemoveFromCategory = (cardId: string) => {
    if (isChecked) return;
    sound.playPop();
    const next = { ...categorizeAnswers };
    delete next[cardId];
    onChangeCategorizeAnswers(next);
  };

  // Drag & drop
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    if (isChecked) return;
    e.dataTransfer.setData('text/plain', cardId);
    setSelectedCardId(cardId);
  };

  const handleCategoryDrop = (e: React.DragEvent, catId: string) => {
    e.preventDefault();
    if (isChecked) return;
    const cardId = e.dataTransfer.getData('text/plain') || selectedCardId;
    if (!cardId) return;

    sound.playSnap();
    const next = { ...categorizeAnswers, [cardId]: catId };
    onChangeCategorizeAnswers(next);
    setSelectedCardId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const unassignedCards = game.categorizeCards.filter((c) => !categorizeAnswers[c.id]);

  return (
    <div className="space-y-6">
      {/* Top hint */}
      <div className="bg-white rounded-2xl px-5 py-3 border border-sky-100 shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs md:text-sm text-slate-600 font-semibold">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Bé hãy kéo hoặc nhấp chọn thẻ rồi chọn nhóm/giỏ thích hợp để phân loại nhé!</span>
        </div>
        <div className="font-bold text-violet-700">
          Đã phân loại: {Object.keys(categorizeAnswers).length}/{game.categorizeCards.length} thẻ
        </div>
      </div>

      {/* Categories Grid (Baskets) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {game.categories.map((cat) => {
          const cardsInCat = game.categorizeCards.filter((c) => categorizeAnswers[c.id] === cat.id);

          return (
            <div
              key={cat.id}
              onClick={() => handleCategoryClick(cat.id)}
              onDrop={(e) => handleCategoryDrop(e, cat.id)}
              onDragOver={handleDragOver}
              className={`bg-white rounded-3xl p-5 shadow-sm border-2 transition-all flex flex-col min-h-[220px] ${
                selectedCardId
                  ? 'ring-2 ring-violet-200 border-dashed hover:bg-violet-50/30 cursor-pointer'
                  : 'hover:shadow-md'
              }`}
              style={{ borderTopColor: cat.color, borderTopWidth: '8px' }}
            >
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <h3 className="font-black text-base text-slate-800 truncate" style={{ color: cat.color }}>
                  {cat.title}
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  {cardsInCat.length} thẻ
                </span>
              </div>

              {/* Cards inside this basket */}
              <div className="flex-1 flex flex-col gap-2 p-2 bg-slate-50/70 rounded-2xl min-h-[120px]">
                {cardsInCat.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400 font-medium text-center">
                    {selectedCardId ? 'Nhấp vào đây để thả thẻ' : 'Chưa có thẻ nào trong nhóm này'}
                  </div>
                ) : (
                  cardsInCat.map((card) => {
                    const isCorrect = isChecked && card.targetCategoryId === cat.id;
                    const isWrong = isChecked && card.targetCategoryId !== cat.id;

                    return (
                      <div
                        key={card.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromCategory(card.id);
                        }}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-xs transition cursor-pointer ${
                          isChecked
                            ? isCorrect
                              ? 'bg-emerald-50 border-emerald-400 text-emerald-950 font-black'
                              : 'bg-rose-50 border-rose-400 text-rose-950 font-black'
                            : 'bg-white border-slate-200 hover:border-rose-300 font-bold text-slate-800'
                        }`}
                        title={!isChecked ? 'Nhấp để lấy lại thẻ về kho' : ''}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {card.imageUrl && (
                            <img src={card.imageUrl} alt="" className="w-7 h-7 rounded-lg object-cover border" />
                          )}
                          <span className="text-xs md:text-sm truncate">{card.text}</span>
                        </div>

                        {isChecked && (
                          isCorrect ? (
                            <Check className="w-4 h-4 text-emerald-600 stroke-[3] flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-rose-600 stroke-[3] flex-shrink-0" />
                          )
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Unassigned Cards Bank */}
      <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <h3 className="font-black text-sm text-slate-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-violet-500" />
            <span>Kho Thẻ Cần Phân Loại:</span>
          </h3>
          <span className="text-xs text-slate-400">Còn lại: {unassignedCards.length} thẻ</span>
        </div>

        {unassignedCards.length === 0 ? (
          <div className="text-center py-4 text-xs md:text-sm text-emerald-600 font-bold bg-emerald-50 rounded-2xl">
            🎉 Bé đã phân loại hết tất cả các thẻ! Hãy nhấn nút <strong>"Kiểm tra kết quả"</strong> nhé!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 justify-center">
            {unassignedCards.map((card) => {
              const isSelected = selectedCardId === card.id;

              return (
                <div
                  key={card.id}
                  draggable={!isChecked}
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  onClick={() => handleCardClick(card.id)}
                  className={`px-4 py-2.5 rounded-2xl font-black text-xs md:text-sm shadow-sm transition-all cursor-grab active:cursor-grabbing transform hover:-translate-y-0.5 flex items-center gap-2 ${
                    isSelected
                      ? 'bg-violet-600 text-white ring-4 ring-violet-200 shadow-md scale-105'
                      : 'bg-slate-50 hover:bg-violet-50 text-slate-800 border-2 border-slate-200 hover:border-violet-300'
                  }`}
                >
                  {card.imageUrl && (
                    <img src={card.imageUrl} alt="" className="w-6 h-6 rounded-md object-cover" />
                  )}
                  <span>{card.text}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
