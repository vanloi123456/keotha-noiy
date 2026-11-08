/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Sparkles, Link2 } from 'lucide-react';
import { GameData, MatchingPair } from '../../types/game';
import { sound } from '../../utils/audio';

const PAIR_COLORS = [
  '#0284c7', // Sky
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#6366f1', // Indigo
];

interface PlayerMatchingProps {
  game: GameData;
  userPairs: Record<string, string>; // leftId -> rightId
  onChangeUserPairs: (pairs: Record<string, string>) => void;
  isChecked: boolean;
}

export const PlayerMatching: React.FC<PlayerMatchingProps> = ({
  game,
  userPairs,
  onChangeUserPairs,
  isChecked,
}) => {
  const [shuffledRightItems, setShuffledRightItems] = useState<MatchingPair[]>([]);
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [dragStartPoint, setDragStartPoint] = useState<{ id: string; side: 'left' | 'right'; x: number; y: number } | null>(null);
  const [currentMousePos, setCurrentMousePos] = useState<{ x: number; y: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const leftItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const rightItemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Shuffle right items on first mount or when game pairs change
  useEffect(() => {
    const list = [...game.matchingPairs];
    if (game.randomizeOrder) {
      // Fisher-Yates shuffle
      for (let i = list.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [list[i], list[j]] = [list[j], list[i]];
      }
    }
    setShuffledRightItems(list);
  }, [game.matchingPairs, game.randomizeOrder]);

  const handleLeftClick = (id: string) => {
    if (isChecked) return;
    sound.playPop();

    // If already selected, deselect
    if (selectedLeftId === id) {
      setSelectedLeftId(null);
      return;
    }

    // If already paired, we can unpair it by clicking again
    if (userPairs[id]) {
      const next = { ...userPairs };
      delete next[id];
      onChangeUserPairs(next);
      setSelectedLeftId(id);
      return;
    }

    setSelectedLeftId(id);
  };

  const handleRightClick = (rightId: string) => {
    if (isChecked) return;

    // If we have a selected left item, form the match
    if (selectedLeftId) {
      sound.playSnap();
      const next = { ...userPairs };
      // Remove any existing pairing with this rightId
      for (const [lId, rId] of Object.entries(next)) {
        if (rId === rightId) delete next[lId];
      }
      next[selectedLeftId] = rightId;
      onChangeUserPairs(next);
      setSelectedLeftId(null);
    } else {
      // If clicked without left selected, check if this right item is already paired
      for (const [lId, rId] of Object.entries(userPairs)) {
        if (rId === rightId) {
          // Unpair
          sound.playPop();
          const next = { ...userPairs };
          delete next[lId];
          onChangeUserPairs(next);
          return;
        }
      }
    }
  };

  // Drag-to-connect support (Mouse and Touch)
  const handleDotPointerDown = (id: string, side: 'left' | 'right', e: React.PointerEvent) => {
    if (isChecked) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setDragStartPoint({
      id,
      side,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setCurrentMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragStartPoint || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCurrentMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragStartPoint || !containerRef.current) {
      setDragStartPoint(null);
      setCurrentMousePos(null);
      return;
    }

    // Find if released over a target card
    const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
    const cardEl = elemBelow?.closest('[data-match-item]');
    if (cardEl) {
      const targetId = cardEl.getAttribute('data-item-id');
      const targetSide = cardEl.getAttribute('data-item-side');

      if (targetId && targetSide && targetSide !== dragStartPoint.side) {
        const leftId = dragStartPoint.side === 'left' ? dragStartPoint.id : targetId;
        const rightId = dragStartPoint.side === 'right' ? dragStartPoint.id : targetId;

        sound.playSnap();
        const next = { ...userPairs };
        // Clear conflicting pairs
        for (const [l, r] of Object.entries(next)) {
          if (l === leftId || r === rightId) delete next[l];
        }
        next[leftId] = rightId;
        onChangeUserPairs(next);
      }
    }

    setDragStartPoint(null);
    setCurrentMousePos(null);
  };

  // Calculate connection coordinates for SVG lines
  const getDotCenter = (el: HTMLElement | null) => {
    if (!el || !containerRef.current) return null;
    const containerRect = containerRef.current.getBoundingClientRect();
    const dot = el.querySelector('[data-dot]') || el;
    const dotRect = dot.getBoundingClientRect();
    return {
      x: dotRect.left + dotRect.width / 2 - containerRect.left,
      y: dotRect.top + dotRect.height / 2 - containerRect.top,
    };
  };

  // Find line color for a pair
  const getLineColor = (leftId: string, rightId: string, index: number) => {
    if (isChecked) {
      return leftId === rightId ? '#22c55e' : '#ef4444'; // Green if correct, Red if wrong
    }
    return PAIR_COLORS[index % PAIR_COLORS.length];
  };

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="relative bg-white rounded-3xl p-5 md:p-8 shadow-xl shadow-sky-900/5 border border-sky-100 min-h-[480px] select-none touch-none"
    >
      {/* Top hint */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-2 text-xs md:text-sm text-slate-500 font-semibold">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Bé hãy nhấp hoặc kéo từ cột bên Trái sang cột bên Phải để nối các ý tương ứng nhé!</span>
        </div>
        <div className="font-bold text-sky-700">
          Đã nối: {Object.keys(userPairs).length}/{game.matchingPairs.length} cặp
        </div>
      </div>

      {/* Columns Container */}
      <div className="grid grid-cols-2 gap-8 md:gap-24 relative z-10">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="text-center py-2 px-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 font-black text-sm md:text-base">
            Cột Trái
          </div>
          {game.matchingPairs.map((pair, idx) => {
            const isSelected = selectedLeftId === pair.id;
            const pairedRightId = userPairs[pair.id];
            const isPaired = !!pairedRightId;
            const isCorrect = isChecked && pairedRightId === pair.id;
            const isWrong = isChecked && isPaired && pairedRightId !== pair.id;
            const lineColor = getLineColor(pair.id, pairedRightId || '', idx);

            return (
              <div
                key={pair.id}
                ref={(el) => { leftItemRefs.current[pair.id] = el; }}
                data-match-item="true"
                data-item-id={pair.id}
                data-item-side="left"
                onClick={() => handleLeftClick(pair.id)}
                className={`group relative p-4 rounded-2xl border-3 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isChecked
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 shadow-md'
                      : isWrong
                      ? 'border-rose-500 bg-rose-50/80 text-rose-950 shadow-md'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                    : isSelected
                    ? 'border-sky-500 bg-sky-100/90 shadow-lg scale-102 ring-4 ring-sky-200'
                    : isPaired
                    ? 'border-slate-300 bg-white hover:border-sky-400 shadow-sm'
                    : 'border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/40 shadow-sm'
                }`}
                style={!isChecked && isPaired ? { borderColor: lineColor } : {}}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {pair.leftImage && (
                    <img
                      src={pair.leftImage}
                      alt="Left visual"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                    />
                  )}
                  <span className="font-extrabold text-sm md:text-base text-slate-800 break-words">
                    {pair.leftText}
                  </span>
                </div>

                {/* Right-side Connector Dot */}
                <div
                  data-dot="true"
                  onPointerDown={(e) => handleDotPointerDown(pair.id, 'left', e)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow cursor-crosshair ${
                    isSelected
                      ? 'bg-sky-500 ring-4 ring-sky-200 scale-125'
                      : isPaired
                      ? 'ring-2 ring-white scale-110'
                      : 'bg-slate-200 group-hover:bg-sky-400 group-hover:scale-110'
                  }`}
                  style={!isChecked && isPaired ? { backgroundColor: lineColor } : {}}
                >
                  {isChecked && isCorrect && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  {isChecked && isWrong && <X className="w-4 h-4 text-white stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="text-center py-2 px-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 font-black text-sm md:text-base">
            Cột Phải
          </div>
          {shuffledRightItems.map((pair, idx) => {
            // Find which left item (if any) is paired with this right item
            const matchedLeftEntry = Object.entries(userPairs).find(([, rId]) => rId === pair.id);
            const isPaired = !!matchedLeftEntry;
            const leftId = matchedLeftEntry ? matchedLeftEntry[0] : '';
            const isCorrect = isChecked && leftId === pair.id;
            const isWrong = isChecked && isPaired && leftId !== pair.id;
            const lineColor = leftId ? getLineColor(leftId, pair.id, idx) : '#cbd5e1';

            return (
              <div
                key={pair.id}
                ref={(el) => { rightItemRefs.current[pair.id] = el; }}
                data-match-item="true"
                data-item-id={pair.id}
                data-item-side="right"
                onClick={() => handleRightClick(pair.id)}
                className={`group relative p-4 rounded-2xl border-3 transition-all cursor-pointer flex items-center gap-3 ${
                  isChecked
                    ? isCorrect
                      ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 shadow-md'
                      : isWrong
                      ? 'border-rose-500 bg-rose-50/80 text-rose-950 shadow-md'
                      : 'border-slate-200 bg-slate-50 opacity-60'
                    : isPaired
                    ? 'border-slate-300 bg-white hover:border-amber-400 shadow-sm'
                    : 'border-slate-200 hover:border-amber-300 bg-white hover:bg-amber-50/40 shadow-sm'
                }`}
                style={!isChecked && isPaired ? { borderColor: lineColor } : {}}
              >
                {/* Left-side Connector Dot */}
                <div
                  data-dot="true"
                  onPointerDown={(e) => handleDotPointerDown(pair.id, 'right', e)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow cursor-crosshair ${
                    isPaired
                      ? 'ring-2 ring-white scale-110'
                      : 'bg-slate-200 group-hover:bg-amber-400 group-hover:scale-110'
                  }`}
                  style={!isChecked && isPaired ? { backgroundColor: lineColor } : {}}
                >
                  {isChecked && isCorrect && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  {isChecked && isWrong && <X className="w-4 h-4 text-white stroke-[3]" />}
                </div>

                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {pair.rightImage && (
                    <img
                      src={pair.rightImage}
                      alt="Right visual"
                      className="w-12 h-12 object-cover rounded-xl border border-slate-200 flex-shrink-0"
                    />
                  )}
                  <span className="font-extrabold text-sm md:text-base text-slate-800 break-words">
                    {pair.rightText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SVG Connecting Lines Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        {/* Established matches lines */}
        {Object.entries(userPairs).map(([leftId, rightId], idx) => {
          const leftEl = leftItemRefs.current[leftId];
          const rightEl = rightItemRefs.current[rightId];
          const start = getDotCenter(leftEl);
          const end = getDotCenter(rightEl);

          if (!start || !end) return null;

          const dx = end.x - start.x;
          const cx1 = start.x + dx * 0.45;
          const cx2 = end.x - dx * 0.45;
          const pathData = `M ${start.x} ${start.y} C ${cx1} ${start.y}, ${cx2} ${end.y}, ${end.x} ${end.y}`;
          const color = getLineColor(leftId, rightId, idx);

          return (
            <g key={`${leftId}-${rightId}`}>
              <path
                d={pathData}
                fill="none"
                stroke={color}
                strokeWidth={isChecked ? 5 : 4}
                strokeLinecap="round"
                className="transition-all duration-300"
              />
              {/* Pulsing indicator dot in the middle of line */}
              <circle
                cx={(start.x + end.x) / 2}
                cy={(start.y + end.y) / 2}
                r="4"
                fill={color}
              />
            </g>
          );
        })}

        {/* Dynamic dragging line */}
        {dragStartPoint && currentMousePos && (
          <path
            d={`M ${dragStartPoint.x} ${dragStartPoint.y} C ${
              (dragStartPoint.x + currentMousePos.x) / 2
            } ${dragStartPoint.y}, ${
              (dragStartPoint.x + currentMousePos.x) / 2
            } ${currentMousePos.y}, ${currentMousePos.x} ${currentMousePos.y}`}
            fill="none"
            stroke="#0284c7"
            strokeWidth="3.5"
            strokeDasharray="6,6"
            className="drawing-line"
          />
        )}
      </svg>
    </div>
  );
};
