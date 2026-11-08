/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Check, X, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { GameData, ImageDropZone, ImageAnswerCard } from '../../types/game';
import { sound } from '../../utils/audio';

interface PlayerImageDropProps {
  game: GameData;
  zoneAnswers: Record<string, string>; // zoneId -> cardId
  onChangeZoneAnswers: (answers: Record<string, string>) => void;
  isChecked: boolean;
}

export const PlayerImageDrop: React.FC<PlayerImageDropProps> = ({
  game,
  zoneAnswers,
  onChangeZoneAnswers,
  isChecked,
}) => {
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleCardClick = (cardId: string) => {
    if (isChecked) return;
    sound.playPop();
    setSelectedCardId((prev) => (prev === cardId ? null : cardId));
  };

  const handleZoneClick = (zoneId: string) => {
    if (isChecked) return;

    if (selectedCardId) {
      sound.playSnap();
      // Assign selected card to this zone
      const next = { ...zoneAnswers };
      // If card was in another zone, remove it from there
      for (const [zId, cId] of Object.entries(next)) {
        if (cId === selectedCardId) delete next[zId];
      }
      next[zoneId] = selectedCardId;
      onChangeZoneAnswers(next);
      setSelectedCardId(null);
    } else if (zoneAnswers[zoneId]) {
      // Zone already has a card, clicking it removes it back to bank
      sound.playPop();
      const next = { ...zoneAnswers };
      delete next[zoneId];
      onChangeZoneAnswers(next);
    }
  };

  // Drag and Drop (HTML5 drag API)
  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    if (isChecked) return;
    e.dataTransfer.setData('text/plain', cardId);
    setSelectedCardId(cardId);
  };

  const handleZoneDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (isChecked) return;
    const cardId = e.dataTransfer.getData('text/plain') || selectedCardId;
    if (!cardId) return;

    sound.playSnap();
    const next = { ...zoneAnswers };
    for (const [zId, cId] of Object.entries(next)) {
      if (cId === cardId) delete next[zId];
    }
    next[zoneId] = cardId;
    onChangeZoneAnswers(next);
    setSelectedCardId(null);
  };

  const handleZoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const usedCardIds = Object.values(zoneAnswers);
  const availableCards = game.imageAnswerCards.filter((c) => !usedCardIds.includes(c.id));

  return (
    <div className="space-y-6">
      {/* Top hint */}
      <div className="bg-white rounded-2xl px-5 py-3 border border-sky-100 shadow-sm flex items-center justify-between flex-wrap gap-2 text-xs md:text-sm text-slate-600 font-semibold">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Bé hãy kéo hoặc nhấp chọn thẻ câu trả lời rồi nhấp vào vị trí thích hợp trên hình ảnh nhé!</span>
        </div>
        <div className="font-bold text-emerald-700">
          Đã điền: {Object.keys(zoneAnswers).length}/{game.imageDropZones.length} vị trí
        </div>
      </div>

      {/* Main Image Board with Percentage Drop Zones */}
      <div className="bg-white rounded-3xl p-4 md:p-6 shadow-xl shadow-sky-900/5 border border-sky-100 flex flex-col items-center">
        <div className="relative max-w-full overflow-hidden rounded-2xl border border-slate-200 shadow-md inline-block select-none">
          <img
            src={game.backgroundImage || ''}
            alt="Game visual"
            className="block max-h-[520px] w-auto max-w-full object-contain pointer-events-none"
            draggable={false}
          />

          {/* Drop Zones */}
          {game.imageDropZones.map((zone) => {
            const placedCardId = zoneAnswers[zone.id];
            const placedCard = game.imageAnswerCards.find((c) => c.id === placedCardId);
            const isCorrect = isChecked && placedCardId === zone.correctCardId;
            const isWrong = isChecked && placedCardId && placedCardId !== zone.correctCardId;

            return (
              <div
                key={zone.id}
                onClick={() => handleZoneClick(zone.id)}
                onDrop={(e) => handleZoneDrop(e, zone.id)}
                onDragOver={handleZoneDragOver}
                style={{
                  left: `${zone.x}%`,
                  top: `${zone.y}%`,
                  width: `${zone.width}%`,
                  height: `${zone.height}%`,
                }}
                className={`absolute rounded-xl flex items-center justify-center p-1.5 transition-all cursor-pointer ${
                  isChecked
                    ? isCorrect
                      ? 'border-3 border-emerald-500 bg-emerald-100/90 shadow-md ring-2 ring-emerald-300'
                      : isWrong
                      ? 'border-3 border-rose-500 bg-rose-100/90 shadow-md ring-2 ring-rose-300'
                      : 'border-2 border-dashed border-slate-300 bg-white/70'
                    : placedCard
                    ? 'border-2 border-emerald-600 bg-white shadow-md hover:ring-2 hover:ring-emerald-300'
                    : selectedCardId
                    ? 'border-3 border-dashed border-sky-500 bg-sky-200/60 animate-pulse-subtle'
                    : 'border-2 border-dashed border-sky-400 bg-white/80 hover:bg-white hover:border-sky-600'
                }`}
              >
                {placedCard ? (
                  <div className="flex items-center gap-1.5 font-extrabold text-xs md:text-sm text-slate-800 text-center truncate max-w-full px-1">
                    {isChecked && (
                      isCorrect ? (
                        <Check className="w-4 h-4 text-emerald-600 stroke-[3] flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-rose-600 stroke-[3] flex-shrink-0" />
                      )
                    )}
                    <span className="truncate">{placedCard.text}</span>
                  </div>
                ) : (
                  <div className="text-center font-bold text-xs text-slate-400 truncate max-w-full pointer-events-none">
                    {zone.label || 'Vùng thả'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Answer Cards Bank */}
      <div className="bg-white rounded-3xl p-5 shadow-md border border-slate-200">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <h3 className="font-black text-sm text-slate-700 flex items-center gap-2">
            <Tag className="w-4 h-4 text-sky-500" />
            <span>Thẻ Câu Trả Lời (Bé chọn để kéo vào hình):</span>
          </h3>
          <span className="text-xs text-slate-400">Còn lại: {availableCards.length} thẻ</span>
        </div>

        {availableCards.length === 0 ? (
          <div className="text-center py-4 text-xs md:text-sm text-emerald-600 font-bold bg-emerald-50 rounded-2xl">
            🎉 Bé đã kéo hết tất cả các thẻ vào hình ảnh rồi! Hãy nhấn nút <strong>"Kiểm tra kết quả"</strong> nhé!
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 justify-center">
            {availableCards.map((card) => {
              const isSelected = selectedCardId === card.id;

              return (
                <div
                  key={card.id}
                  draggable={!isChecked}
                  onDragStart={(e) => handleDragStart(e, card.id)}
                  onClick={() => handleCardClick(card.id)}
                  className={`px-4 py-2.5 rounded-2xl font-black text-xs md:text-sm shadow-sm transition-all cursor-grab active:cursor-grabbing transform hover:-translate-y-0.5 ${
                    isSelected
                      ? 'bg-sky-500 text-white ring-4 ring-sky-200 shadow-md scale-105'
                      : 'bg-slate-50 hover:bg-sky-50 text-slate-800 border-2 border-slate-200 hover:border-sky-400'
                  }`}
                >
                  {card.text}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
