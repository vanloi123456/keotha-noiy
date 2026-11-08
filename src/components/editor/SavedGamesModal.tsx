/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  FolderOpen, 
  Trash2, 
  Copy, 
  Download, 
  FileCode, 
  FileJson, 
  AlertCircle, 
  Clock, 
  BookOpen, 
  Layers, 
  Image as ImageIcon, 
  Grid 
} from 'lucide-react';
import { GameData } from '../../types/game';
import { 
  getSavedGamesList, 
  loadGameFromStorage, 
  saveGameToStorage, 
  deleteGameFromStorage, 
  exportGameToJson, 
  SavedGameSummary 
} from '../../utils/storage';
import { exportStandaloneHtml } from '../../utils/exportHtml';
import { sound } from '../../utils/audio';

import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

interface SavedGamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadGame: (game: GameData) => void;
  currentGame: GameData;
  onGameDeleted?: (id: string) => void;
}

export const SavedGamesModal: React.FC<SavedGamesModalProps> = ({
  isOpen,
  onClose,
  onLoadGame,
  currentGame,
  onGameDeleted,
}) => {
  const [savedList, setSavedList] = useState<SavedGameSummary[]>([]);
  const [deletingTarget, setDeletingTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSavedList(getSavedGamesList());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectGame = (id: string) => {
    const loaded = loadGameFromStorage(id);
    if (loaded) {
      sound.playSnap();
      onLoadGame(loaded);
      onClose();
    }
  };

  const confirmDelete = () => {
    if (!deletingTarget) return;
    deleteGameFromStorage(deletingTarget.id);
    setSavedList(getSavedGamesList());
    if (onGameDeleted) onGameDeleted(deletingTarget.id);
    setDeletingTarget(null);
    sound.playPop();
  };

  const handleDuplicate = (id: string) => {
    const loaded = loadGameFromStorage(id);
    if (loaded) {
      const duplicated: GameData = {
        ...loaded,
        id: 'game_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        title: (loaded.title || 'Trò chơi') + ' (Bản sao)',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      saveGameToStorage(duplicated);
      setSavedList(getSavedGamesList());
      sound.playPop();
    }
  };

  const handleExportJson = (id: string) => {
    const loaded = loadGameFromStorage(id);
    if (loaded) exportGameToJson(loaded);
  };

  const handleExportHtml = (id: string) => {
    const loaded = loadGameFromStorage(id);
    if (loaded) exportStandaloneHtml(loaded);
  };

  const getModeBadge = (mode: GameData['mode']) => {
    switch (mode) {
      case 'matching':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full"><Layers className="w-3 h-3" /> Nối ý</span>;
      case 'image_drop':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"><ImageIcon className="w-3 h-3" /> Vào hình ảnh</span>;
      case 'categorize':
        return <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full"><Grid className="w-3 h-3" /> Phân loại</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-800">Bộ Sưu Tập Trò Chơi Đã Lưu</h2>
              <p className="text-xs text-slate-500">Quản lý và xuất trò chơi học tập</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice required by Section 7 */}
        <div className="bg-amber-50/70 border-b border-amber-200/60 px-5 py-2.5 text-xs text-amber-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Dữ liệu trò chơi được lưu trữ cục bộ trên trình duyệt máy tính này. Hãy xuất tệp <strong>.JSON</strong> hoặc <strong>.HTML</strong> nếu muốn chuyển sang máy khác.
          </span>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {savedList.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold">Chưa có trò chơi nào được lưu trên thiết bị.</p>
              <p className="text-xs mt-1">Hãy thiết kế trò chơi và bấm nút <strong>"Lưu"</strong> ở thanh trên cùng nhé.</p>
            </div>
          ) : (
            savedList.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/30 transition flex items-center justify-between gap-3 flex-wrap"
              >
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-extrabold text-sm text-slate-800">{item.title}</h3>
                    {getModeBadge(item.mode)}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    {item.subject && <span>Môn: {item.subject}</span>}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.updatedAt).toLocaleDateString('vi-VN')} {new Date(item.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <button
                    onClick={() => handleSelectGame(item.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-black bg-sky-500 hover:bg-sky-600 text-white transition shadow-sm"
                  >
                    Mở chơi / sửa
                  </button>

                  <button
                    onClick={() => handleDuplicate(item.id)}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                    title="Tạo bản sao"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleExportHtml(item.id)}
                    className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition"
                    title="Xuất file HTML độc lập (chạy không cần mạng)"
                  >
                    <FileCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleExportJson(item.id)}
                    className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition"
                    title="Tải tệp JSON"
                  >
                    <FileJson className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setDeletingTarget({ id: item.id, title: item.title })}
                    className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition"
                    title="Xóa bài tập này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-slate-500 font-bold">
            Trò chơi đang mở: {currentGame.title || 'Chưa đặt tên'}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportStandaloneHtml(currentGame)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition shadow-sm"
              title="Xuất trò chơi hiện tại thành file HTML độc lập"
            >
              <FileCode className="w-4 h-4 text-indigo-600" />
              <span>Xuất bản HTML hiện tại</span>
            </button>
            <button
              onClick={() => exportGameToJson(currentGame)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 transition shadow-sm"
              title="Xuất trò chơi hiện tại thành file JSON"
            >
              <FileJson className="w-4 h-4 text-amber-600" />
              <span>Xuất JSON hiện tại</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Delete Submodal */}
      <ConfirmDeleteModal
        isOpen={!!deletingTarget}
        title="Xóa Bài Tập Đã Lưu"
        itemName={deletingTarget?.title}
        message="Thầy/cô có chắc chắn muốn xóa bài tập này không? Bài tập sẽ bị xóa khỏi bộ nhớ thiết bị."
        onConfirm={confirmDelete}
        onClose={() => setDeletingTarget(null)}
      />
    </div>
  );
};
