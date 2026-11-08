/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Plus, 
  Trash2, 
  Copy, 
  Move, 
  Maximize2, 
  RotateCcw, 
  Sparkles, 
  Check, 
  Image as ImageIcon,
  Tag,
  AlertCircle
} from 'lucide-react';
import { GameData, ImageDropZone, ImageAnswerCard } from '../../types/game';
import { sound } from '../../utils/audio';

interface EditorImageDropProps {
  game: GameData;
  onUpdateGame: (updated: Partial<GameData>) => void;
}

export const EditorImageDrop: React.FC<EditorImageDropProps> = ({
  game,
  onUpdateGame,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [draggingZoneId, setDraggingZoneId] = useState<string | null>(null);
  const [resizingZoneId, setResizingZoneId] = useState<string | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef<{ x: number; y: number; origX: number; origY: number; origW: number; origH: number }>({
    x: 0,
    y: 0,
    origX: 0,
    origY: 0,
    origW: 0,
    origH: 0,
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdateGame({ backgroundImage: reader.result as string });
      sound.playSnap();
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (confirm('Thầy cô có chắc chắn muốn gỡ hình ảnh này không?')) {
      onUpdateGame({ backgroundImage: null, imageDropZones: [] });
      sound.playPop();
    }
  };

  // Add a drop zone
  const addDropZone = () => {
    if (!game.backgroundImage) {
      alert('Vui lòng tải ảnh lên trước khi tạo vùng thả!');
      return;
    }
    const newZone: ImageDropZone = {
      id: 'zone_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      label: '',
      x: 35,
      y: 35,
      width: 25,
      height: 12,
      correctCardId: '',
    };
    onUpdateGame({ imageDropZones: [...game.imageDropZones, newZone] });
    setSelectedZoneId(newZone.id);
    sound.playPop();
  };

  const updateZone = (id: string, updates: Partial<ImageDropZone>) => {
    onUpdateGame({
      imageDropZones: game.imageDropZones.map((z) => (z.id === id ? { ...z, ...updates } : z)),
    });
  };

  const removeZone = (id: string) => {
    onUpdateGame({
      imageDropZones: game.imageDropZones.filter((z) => z.id !== id),
    });
    if (selectedZoneId === id) setSelectedZoneId(null);
    sound.playPop();
  };

  // Answer cards
  const addCard = () => {
    const newCard: ImageAnswerCard = {
      id: 'card_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      text: '',
    };
    onUpdateGame({ imageAnswerCards: [...game.imageAnswerCards, newCard] });
    sound.playPop();
  };

  const updateCard = (id: string, text: string) => {
    onUpdateGame({
      imageAnswerCards: game.imageAnswerCards.map((c) => (c.id === id ? { ...c, text } : c)),
    });
  };

  const removeCard = (id: string) => {
    onUpdateGame({
      imageAnswerCards: game.imageAnswerCards.filter((c) => c.id !== id),
      // clear correctCardId on zones using this card
      imageDropZones: game.imageDropZones.map((z) =>
        z.correctCardId === id ? { ...z, correctCardId: '' } : z
      ),
    });
    sound.playPop();
  };

  // Interactive Drag & Resize on image container
  const handleZoneMouseDown = (e: React.MouseEvent, zone: ImageDropZone) => {
    e.stopPropagation();
    setSelectedZoneId(zone.id);
    setDraggingZoneId(zone.id);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      origX: zone.x,
      origY: zone.y,
      origW: zone.width,
      origH: zone.height,
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, zone: ImageDropZone) => {
    e.stopPropagation();
    setSelectedZoneId(zone.id);
    setResizingZoneId(zone.id);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      origX: zone.x,
      origY: zone.y,
      origW: zone.width,
      origH: zone.height,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!imageContainerRef.current) return;
      const rect = imageContainerRef.current.getBoundingClientRect();
      const dxPercent = ((e.clientX - dragStartRef.current.x) / rect.width) * 100;
      const dyPercent = ((e.clientY - dragStartRef.current.y) / rect.height) * 100;

      if (draggingZoneId) {
        const newX = Math.max(0, Math.min(100 - dragStartRef.current.origW, dragStartRef.current.origX + dxPercent));
        const newY = Math.max(0, Math.min(100 - dragStartRef.current.origH, dragStartRef.current.origY + dyPercent));
        updateZone(draggingZoneId, {
          x: Math.round(newX * 10) / 10,
          y: Math.round(newY * 10) / 10,
        });
      } else if (resizingZoneId) {
        const newW = Math.max(8, Math.min(100 - dragStartRef.current.origX, dragStartRef.current.origW + dxPercent));
        const newH = Math.max(5, Math.min(100 - dragStartRef.current.origY, dragStartRef.current.origH + dyPercent));
        updateZone(resizingZoneId, {
          width: Math.round(newW * 10) / 10,
          height: Math.round(newH * 10) / 10,
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingZoneId(null);
      setResizingZoneId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingZoneId, resizingZoneId, game.imageDropZones]);

  const selectedZone = game.imageDropZones.find((z) => z.id === selectedZoneId);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-600" />
            <span>Kéo Thả Câu Trả Lời Vào Hình Ảnh</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải ảnh lên, thêm các vùng thả tương ứng trên ảnh, tạo các thẻ trả lời và gán đáp án chính xác.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {game.backgroundImage && (
            <>
              <button
                onClick={addDropZone}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-extrabold bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm vùng thả trên ảnh</span>
              </button>
              <button
                onClick={removeImage}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Gỡ ảnh</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Canvas & Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Image & Zones Overlay */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border border-slate-200">
            {!game.backgroundImage ? (
              /* Blank Upload Area Required by Section 5 */
              <div className="border-3 border-dashed border-slate-300 rounded-3xl p-12 text-center bg-slate-50 hover:bg-slate-100/60 transition flex flex-col items-center justify-center min-h-[360px]">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8" />
                </div>
                <h3 className="text-base md:text-lg font-black text-slate-700">Chưa có hình ảnh</h3>
                <p className="text-slate-500 text-xs md:text-sm max-w-sm mt-1 mb-5">
                  Tải ảnh bài học từ máy tính (hỗ trợ định dạng PNG, JPG, JPEG)
                </p>
                <label className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-200 cursor-pointer transition transform hover:-translate-y-0.5">
                  <Upload className="w-5 h-5" />
                  <span>Tải ảnh lên</span>
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-full flex justify-between items-center mb-2 px-1 text-xs text-slate-500 font-semibold">
                  <span>💡 Nhấp và kéo vùng thả để di chuyển. Kéo góc dưới-phải để chỉnh kích thước.</span>
                  <span className="font-bold text-emerald-700">{game.imageDropZones.length} vùng thả</span>
                </div>

                {/* Interactive Image Container */}
                <div
                  ref={imageContainerRef}
                  onClick={() => setSelectedZoneId(null)}
                  className="relative max-w-full overflow-hidden rounded-2xl border border-slate-300 shadow-inner bg-slate-900/5 select-none"
                  style={{ touchAction: 'none' }}
                >
                  <img
                    src={game.backgroundImage}
                    alt="Lesson visual"
                    className="block max-h-[500px] w-auto max-w-full object-contain pointer-events-none"
                    draggable={false}
                  />

                  {/* Drop zones overlay */}
                  {game.imageDropZones.map((zone, idx) => {
                    const isSelected = selectedZoneId === zone.id;
                    const correctCard = game.imageAnswerCards.find((c) => c.id === zone.correctCardId);

                    return (
                      <div
                        key={zone.id}
                        onMouseDown={(e) => handleZoneMouseDown(e, zone)}
                        style={{
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          width: `${zone.width}%`,
                          height: `${zone.height}%`,
                        }}
                        className={`absolute rounded-xl flex items-center justify-center p-1.5 cursor-move transition-shadow ${
                          isSelected
                            ? 'border-2 border-emerald-600 bg-emerald-500/30 shadow-lg ring-2 ring-emerald-400'
                            : 'border-2 border-dashed border-sky-600 bg-sky-400/25 hover:bg-sky-400/35'
                        }`}
                      >
                        <div className="text-center font-extrabold text-xs text-slate-900 pointer-events-none truncate max-w-full">
                          {correctCard ? (
                            <span className="bg-white/95 px-2 py-0.5 rounded shadow text-emerald-800">
                              {correctCard.text || `Thẻ #${idx + 1}`}
                            </span>
                          ) : (
                            <span className="bg-white/90 px-1.5 py-0.5 rounded text-slate-700 text-[11px]">
                              {zone.label || `Vùng ${idx + 1}`}
                            </span>
                          )}
                        </div>

                        {/* Resize handle in bottom-right corner */}
                        <div
                          onMouseDown={(e) => handleResizeMouseDown(e, zone)}
                          className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-600 hover:bg-emerald-700 rounded-tl-lg cursor-se-resize flex items-center justify-center shadow"
                          title="Kéo để chỉnh kích thước"
                        >
                          <div className="w-1.5 h-1.5 bg-white rounded-full pointer-events-none" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Selected Zone Configuration & Answer Cards Bank */}
        <div className="space-y-6">
          {/* Selected Zone Inspector */}
          {selectedZone ? (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-emerald-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <span className="font-black text-sm text-emerald-800 flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Cài đặt Vùng thả đang chọn</span>
                </span>
                <button
                  onClick={() => removeZone(selectedZone.id)}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  title="Xóa vùng thả này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nhãn ghi chú (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={selectedZone.label || ''}
                    onChange={(e) => updateZone(selectedZone.id, { label: e.target.value })}
                    placeholder="Ví dụ: Vị trí số 1..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Đáp án chính xác cho vùng này:
                  </label>
                  {game.imageAnswerCards.length === 0 ? (
                    <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg">
                      Chưa có thẻ trả lời nào. Vui lòng thêm thẻ ở mục bên dưới trước.
                    </p>
                  ) : (
                    <select
                      value={selectedZone.correctCardId}
                      onChange={(e) => updateZone(selectedZone.id, { correctCardId: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-emerald-500 outline-none bg-white"
                    >
                      <option value="">-- Chọn thẻ đáp án đúng --</option>
                      {game.imageAnswerCards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.text || '(Thẻ trống)'}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                  <div>Vị trí X: {selectedZone.x}%</div>
                  <div>Vị trí Y: {selectedZone.y}%</div>
                  <div>Rộng: {selectedZone.width}%</div>
                  <div>Cao: {selectedZone.height}%</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-5 border border-dashed border-slate-200 text-center text-xs text-slate-500">
              Nhấp vào một vùng thả trên ảnh để thiết lập đáp án đúng hoặc nhãn hiển thị.
            </div>
          )}

          {/* Cards Bank Management */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h3 className="font-black text-sm text-slate-800">
                  Thẻ Câu Trả Lời Cho Học Sinh
                </h3>
                <p className="text-[11px] text-slate-500">
                  Các từ khóa/câu trả lời học sinh sẽ kéo vào ảnh.
                </p>
              </div>
              <button
                onClick={addCard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-sky-500 hover:bg-sky-600 text-white transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm thẻ</span>
              </button>
            </div>

            {game.imageAnswerCards.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                Chưa có thẻ nào. Bấm <strong>"Thêm thẻ"</strong> để tạo từ khóa.
              </div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {game.imageAnswerCards.map((card, idx) => (
                  <div key={card.id} className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 w-5">{idx + 1}.</span>
                    <input
                      type="text"
                      value={card.text}
                      onChange={(e) => updateCard(card.id, e.target.value)}
                      placeholder="Nhập từ hoặc câu trả lời..."
                      className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-sky-500 outline-none"
                    />
                    <button
                      onClick={() => removeCard(card.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition"
                      title="Xóa thẻ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
