/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Save, Copy, X, Check, BookOpen, Layers, Image as ImageIcon, Grid, Sparkles } from 'lucide-react';
import { GameData } from '../../types/game';
import { getItemCount } from '../../utils/storage';
import { sound } from '../../utils/audio';

interface SaveGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: GameData;
  isExistingInStorage: boolean;
  onSave: (title: string, subject: string) => void;
  onSaveAsNew: (title: string, subject: string) => void;
}

export const SaveGameModal: React.FC<SaveGameModalProps> = ({
  isOpen,
  onClose,
  game,
  isExistingInStorage,
  onSave,
  onSaveAsNew,
}) => {
  const [title, setTitle] = useState(game.title);
  const [subject, setSubject] = useState(game.subject);

  React.useEffect(() => {
    if (isOpen) {
      setTitle(game.title);
      setSubject(game.subject);
    }
  }, [isOpen, game.title, game.subject]);

  if (!isOpen) return null;

  const count = getItemCount(game);

  const getModeLabel = () => {
    switch (game.mode) {
      case 'matching': return 'Nối ý (2 cột)';
      case 'image_drop': return 'Thả câu trả lời vào hình ảnh';
      case 'categorize': return 'Phân loại nhóm tự do';
    }
  };

  const handleSave = () => {
    sound.playSnap();
    onSave(title, subject);
    onClose();
  };

  const handleSaveAsCopy = () => {
    sound.playSnap();
    onSaveAsNew(title, subject);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-sky-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-800">
                {isExistingInStorage ? 'Lưu Cập Nhật Bài Tập' : 'Lưu Bài Tập Mới'}
              </h3>
              <p className="text-xs text-slate-500">Lưu vào bộ nhớ thiết bị để dùng lại</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5">
              Tên bài tập / trò chơi <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Nối từ ngữ với hình ảnh, Phân loại động vật..."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-sm font-bold text-slate-800 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>Chủ đề / Môn học (không bắt buộc)</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ví dụ: Tiếng Việt 2, Tự nhiên và Xã hội 3..."
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-sm font-semibold text-slate-800 outline-none transition"
            />
          </div>

          {/* Quick info */}
          <div className="p-3 rounded-2xl bg-sky-50/70 border border-sky-100 flex items-center justify-between text-xs text-sky-800">
            <span>Dạng bài: <strong>{getModeLabel()}</strong></span>
            <span>Số câu/mục: <strong>{count}</strong></span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5 justify-end">
          {isExistingInStorage && (
            <button
              type="button"
              onClick={handleSaveAsCopy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs md:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
              title="Lưu thành một bài tập mới độc lập"
            >
              <Copy className="w-4 h-4 text-slate-500" />
              <span>Lưu thành bản sao mới</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs md:text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-md shadow-sky-200 transition"
          >
            <Check className="w-4 h-4" />
            <span>{isExistingInStorage ? 'Lưu cập nhật' : 'Xác nhận lưu bài'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
