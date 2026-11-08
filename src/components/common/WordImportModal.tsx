/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  FileText, 
  Check, 
  X, 
  Layers, 
  Image as ImageIcon, 
  Grid, 
  AlertCircle,
  HelpCircle,
  BookOpen
} from 'lucide-react';
import { ParsedWordGame } from '../../utils/wordTemplate';
import { GameData } from '../../types/game';
import { sound } from '../../utils/audio';

interface WordImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedWordGame | null;
  onConfirmImport: (parsed: ParsedWordGame) => void;
}

export const WordImportModal: React.FC<WordImportModalProps> = ({
  isOpen,
  onClose,
  parsedData,
  onConfirmImport,
}) => {
  if (!isOpen || !parsedData) return null;

  const getModeLabel = () => {
    switch (parsedData.mode) {
      case 'matching': return 'Dạng 1: Nối ý';
      case 'image_drop': return 'Dạng 2: Thả vào hình ảnh';
      case 'categorize': return 'Dạng 3: Phân loại nhóm';
    }
  };

  const getCountText = () => {
    if (parsedData.mode === 'matching') {
      return `${parsedData.matchingPairs.length} cặp nối ý`;
    }
    if (parsedData.mode === 'image_drop') {
      return `${parsedData.imageAnswerCards.length} thẻ câu trả lời`;
    }
    return `${parsedData.categories.length} nhóm phân loại (${parsedData.categorizeCards.length} thẻ)`;
  };

  const handleConfirm = () => {
    sound.playSnap();
    onConfirmImport(parsedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-800">
                Xem Trước Nội Dung Tệp Word (.DOCX)
              </h3>
              <p className="text-xs text-slate-500">
                Đã trích xuất thành công {getCountText()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs md:text-sm space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Tên bài tập:</span>
              <span className="font-extrabold text-slate-800">{parsedData.title || '(Chưa đặt)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Dạng trò chơi:</span>
              <span className="font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">{getModeLabel()}</span>
            </div>
            {parsedData.subject && (
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Môn học / Chủ đề:</span>
                <span className="font-semibold text-slate-700">{parsedData.subject}</span>
              </div>
            )}
            {parsedData.instructions && (
              <div className="pt-1 border-t border-slate-200">
                <span className="font-semibold text-slate-500 block mb-0.5">Hướng dẫn:</span>
                <p className="text-slate-700 italic">{parsedData.instructions}</p>
              </div>
            )}
          </div>

          {/* Detailed Preview Items */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
              Danh sách chi tiết ({getCountText()}):
            </h4>

            {parsedData.mode === 'matching' && (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {parsedData.matchingPairs.map((p, idx) => (
                  <div key={p.id} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 text-xs">
                    <span className="w-5 font-bold text-slate-400">{idx + 1}.</span>
                    <span className="font-extrabold text-sky-800 flex-1">{p.leftText}</span>
                    <span className="text-slate-400 font-bold">⟷</span>
                    <span className="font-extrabold text-amber-800 flex-1 text-right">{p.rightText}</span>
                  </div>
                ))}
              </div>
            )}

            {parsedData.mode === 'categorize' && (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {parsedData.categories.map((cat) => {
                  const cards = parsedData.categorizeCards.filter(c => c.targetCategoryId === cat.id);
                  return (
                    <div key={cat.id} className="p-3 rounded-xl border border-slate-200 bg-white">
                      <div className="font-black text-xs text-violet-800 mb-1">
                        Nhóm: {cat.title} ({cards.length} thẻ)
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {cards.map(c => (
                          <span key={c.id} className="text-[11px] font-semibold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-md border border-violet-100">
                            {c.text}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {parsedData.mode === 'image_drop' && (
              <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto pr-1">
                {parsedData.imageAnswerCards.map((c, idx) => (
                  <span key={c.id} className="text-xs font-bold bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
                    {idx + 1}. {c.text}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs md:text-sm font-black bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-200 transition"
          >
            <Check className="w-4 h-4" />
            <span>Nạp vào bài tập</span>
          </button>
        </div>
      </div>
    </div>
  );
};
