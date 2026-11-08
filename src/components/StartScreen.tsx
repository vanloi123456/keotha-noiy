/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useEffect } from 'react';
import { 
  Sparkles, 
  Play, 
  Edit3, 
  PlusCircle, 
  FolderOpen, 
  Upload, 
  Clock, 
  HelpCircle, 
  BookOpen, 
  Layers, 
  Image as ImageIcon, 
  Grid,
  CheckCircle2,
  AlertCircle,
  Save,
  Trash2,
  Copy,
  FileCode,
  FileJson
} from 'lucide-react';
import { GameData, GameMode } from '../types/game';
import { 
  getSavedGamesList, 
  loadGameFromStorage, 
  deleteGameFromStorage, 
  saveGameToStorage,
  SavedGameSummary,
  exportGameToJson 
} from '../utils/storage';
import { exportStandaloneHtml } from '../utils/exportHtml';
import { sound } from '../utils/audio';
import { ConfirmDeleteModal } from './common/ConfirmDeleteModal';

interface StartScreenProps {
  game: GameData;
  onUpdateGame: (updated: Partial<GameData>) => void;
  onStartNewGame: (mode: GameMode) => void;
  onGoToEditor: () => void;
  onStartPlaying: () => void;
  onOpenSaved: () => void;
  onOpenSaveModal: () => void;
  onLoadSavedGame: (loaded: GameData, playDirectly?: boolean) => void;
  onImportJson: (file: File) => void;
  onDownloadWordTemplate: () => void;
  onUploadWordFile: (file: File) => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  game,
  onUpdateGame,
  onStartNewGame,
  onGoToEditor,
  onStartPlaying,
  onOpenSaved,
  onOpenSaveModal,
  onLoadSavedGame,
  onImportJson,
  onDownloadWordTemplate,
  onUploadWordFile,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wordFileInputRef = useRef<HTMLInputElement>(null);
  const [savedGames, setSavedGames] = useState<SavedGameSummary[]>([]);
  const [deletingTarget, setDeletingTarget] = useState<{ id: string; title: string } | null>(null);

  // Refresh saved games
  const refreshSavedGames = () => {
    setSavedGames(getSavedGamesList());
  };

  useEffect(() => {
    refreshSavedGames();
  }, []);

  // Check if current game has content to play
  const hasContent = () => {
    if (game.mode === 'matching') return game.matchingPairs.length > 0;
    if (game.mode === 'image_drop') return !!game.backgroundImage && game.imageDropZones.length > 0;
    if (game.mode === 'categorize') return game.categories.length > 0 && game.categorizeCards.length > 0;
    return false;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportJson(file);
    }
  };

  const handlePlaySavedGame = (id: string) => {
    const loaded = loadGameFromStorage(id);
    if (loaded) {
      sound.playSnap();
      onLoadSavedGame(loaded, true);
    }
  };

  const handleEditSavedGame = (id: string) => {
    const loaded = loadGameFromStorage(id);
    if (loaded) {
      sound.playSnap();
      onLoadSavedGame(loaded, false);
    }
  };

  const handleDuplicateSavedGame = (id: string) => {
    const loaded = loadGameFromStorage(id);
    if (loaded) {
      const duplicated: GameData = {
        ...loaded,
        id: 'game_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
        title: (loaded.title || 'Bài tập') + ' (Bản sao)',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      saveGameToStorage(duplicated);
      refreshSavedGames();
      sound.playPop();
    }
  };

  const confirmDelete = () => {
    if (!deletingTarget) return;
    deleteGameFromStorage(deletingTarget.id);
    refreshSavedGames();
    setDeletingTarget(null);
    sound.playPop();
  };

  const getModeBadge = (mode: GameData['mode']) => {
    switch (mode) {
      case 'matching':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
            <Layers className="w-3 h-3" /> Nối ý
          </span>
        );
      case 'image_drop':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
            <ImageIcon className="w-3 h-3" /> Vào hình ảnh
          </span>
        );
      case 'categorize':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-700 bg-violet-100 px-2 py-0.5 rounded-full">
            <Grid className="w-3 h-3" /> Phân loại
          </span>
        );
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-center items-center px-4 py-8 max-w-5xl mx-auto space-y-8">
      {/* Hero Badge & Title */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 via-rose-100 to-sky-100 text-sky-800 font-extrabold text-xs md:text-sm shadow-sm mb-3 border border-amber-200">
          <Sparkles className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Nền tảng trò chơi tương tác giáo dục tiểu học</span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-tight">
          THỬ TÀI KÉO THẢ – NỐI Ý
        </h1>
        <p className="text-slate-500 text-sm md:text-base mt-2 max-w-xl mx-auto">
          Dành cho giáo viên tự thiết kế bài giảng sinh động và học sinh tiểu học thực hành tương tác trực quan.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="w-full bg-white rounded-3xl shadow-xl shadow-sky-900/5 border border-sky-100 p-6 md:p-8 transition-all">
        {/* Game Mode Selector */}
        <div className="mb-6">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-2">
            1. Chọn dạng trò chơi
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onUpdateGame({ mode: 'matching' });
              }}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                game.mode === 'matching'
                  ? 'border-sky-500 bg-sky-50/70 shadow-md shadow-sky-100 ring-2 ring-sky-300'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${game.mode === 'matching' ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-black text-slate-800 text-sm">Dạng 1: Nối ý</span>
                <span className="block text-xs text-slate-500 mt-0.5">Ghép các ý tương ứng giữa 2 cột bằng đường nối</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onUpdateGame({ mode: 'image_drop' });
              }}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                game.mode === 'image_drop'
                  ? 'border-emerald-500 bg-emerald-50/70 shadow-md shadow-emerald-100 ring-2 ring-emerald-300'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${game.mode === 'image_drop' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-black text-slate-800 text-sm">Dạng 2: Vào hình ảnh</span>
                <span className="block text-xs text-slate-500 mt-0.5">Kéo thẻ từ khóa thả vào các vị trí trên hình ảnh</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                sound.playPop();
                onUpdateGame({ mode: 'categorize' });
              }}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border-2 text-left transition-all ${
                game.mode === 'categorize'
                  ? 'border-violet-500 bg-violet-50/70 shadow-md shadow-violet-100 ring-2 ring-violet-300'
                  : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
              }`}
            >
              <div className={`p-2.5 rounded-xl ${game.mode === 'categorize' ? 'bg-violet-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                <Grid className="w-5 h-5" />
              </div>
              <div>
                <span className="block font-black text-slate-800 text-sm">Dạng 3: Phân loại tự do</span>
                <span className="block text-xs text-slate-500 mt-0.5">Phân chia nhóm và kéo các thẻ vào giỏ thích hợp</span>
              </div>
            </button>
          </div>
        </div>

        {/* Inputs (Completely empty initially by strict rule) */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <span>Tên trò chơi</span>
              <span className="text-slate-400 font-normal lowercase">(giáo viên tự đặt)</span>
            </label>
            <input
              type="text"
              value={game.title}
              onChange={(e) => onUpdateGame({ title: e.target.value })}
              placeholder="Nhập tên trò chơi (để trống nếu chưa muốn đặt)..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-slate-800 text-sm md:text-base font-bold placeholder:font-normal placeholder:text-slate-400 outline-none transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span>Tên bài học hoặc chủ đề</span>
              </label>
              <input
                type="text"
                value={game.subject}
                onChange={(e) => onUpdateGame({ subject: e.target.value })}
                placeholder="Ví dụ: Tự nhiên và Xã hội, Tiếng Việt, Toán..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-slate-800 text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Thời gian chơi (giây, không bắt buộc)</span>
              </label>
              <input
                type="number"
                min="0"
                step="10"
                value={game.timeLimitSeconds || ''}
                onChange={(e) => onUpdateGame({ timeLimitSeconds: Math.max(0, parseInt(e.target.value) || 0) })}
                placeholder="Để trống hoặc 0 = Không giới hạn thời gian"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-slate-800 text-sm font-semibold placeholder:font-normal placeholder:text-slate-400 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Hướng dẫn chơi (cho học sinh)</span>
            </label>
            <textarea
              rows={2}
              value={game.instructions}
              onChange={(e) => onUpdateGame({ instructions: e.target.value })}
              placeholder="Nhập lời hướng dẫn hoặc dặn dò các con khi tham gia trò chơi..."
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-sky-500 focus:ring-4 focus:ring-sky-100 text-slate-800 text-sm placeholder:font-normal placeholder:text-slate-400 outline-none transition resize-none"
            />
          </div>
        </div>

        {/* Status notice */}
        {!hasContent() && (
          <div className="mt-5 p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3 text-amber-800 text-xs md:text-sm">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>
              Trò chơi hiện chưa có nội dung. Quý thầy cô hãy nhấn <strong>"Chỉnh sửa nội dung"</strong> để thêm câu hỏi, tải ảnh hoặc tạo các thẻ đáp án.
            </span>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 justify-center flex-wrap">
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onStartNewGame(game.mode);
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <PlusCircle className="w-5 h-5 text-slate-500" />
            <span>Tạo trò chơi mới</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onGoToEditor();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-sm bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-200 transition transform hover:-translate-y-0.5"
          >
            <Edit3 className="w-5 h-5" />
            <span>Chỉnh sửa nội dung</span>
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onOpenSaveModal();
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-sm bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition"
            title="Lưu bài tập này vào máy"
          >
            <Save className="w-5 h-5 text-amber-600" />
            <span>Lưu bài tập</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (!hasContent()) {
                alert('Vui lòng tạo ít nhất 1 nội dung câu hỏi trước khi bắt đầu chơi!');
                return;
              }
              sound.playPop();
              onStartPlaying();
            }}
            disabled={!hasContent()}
            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-2xl font-black text-sm transition transform ${
              hasContent()
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg shadow-emerald-200 hover:-translate-y-0.5 cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Bắt đầu chơi</span>
          </button>
        </div>
      </div>

      {/* Auxiliary Teacher Tools: Word Template & JSON Import */}
      <div className="flex items-center justify-center gap-3 flex-wrap text-xs">
        <button
          onClick={onDownloadWordTemplate}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-extrabold shadow-xs transition"
          title="Tải file mẫu Word (.docx) để soạn bài tập trên máy tính"
        >
          <FileCode className="w-4 h-4 text-blue-600" />
          <span>Tải xuống file mẫu Word (.DOCX)</span>
        </button>

        <button
          onClick={() => wordFileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-800 font-extrabold shadow-xs transition"
          title="Tải lên bài tập đã soạn từ file Word (.docx)"
        >
          <Upload className="w-4 h-4 text-indigo-600" />
          <span>Tải lên file Word (.DOCX)</span>
        </button>
        <input
          ref={wordFileInputRef}
          type="file"
          accept=".docx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUploadWordFile(file);
              e.target.value = '';
            }
          }}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold shadow-xs transition"
        >
          <Upload className="w-4 h-4 text-slate-500" />
          <span>Nhập tệp (.JSON)</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* DIRECT LIST OF SAVED EXERCISES ON START SCREEN */}
      <div className="w-full bg-white rounded-3xl shadow-xl shadow-sky-900/5 border border-sky-100 p-6 md:p-8 transition-all">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5 flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-black text-slate-800">
                Danh Sách Bài Tập Của Thầy Cô Đã Lưu
              </h2>
              <p className="text-xs text-slate-500">
                Lưu trên trình duyệt thiết bị này • Thầy cô có thể mở chơi, chỉnh sửa hoặc xóa bất cứ lúc nào
              </p>
            </div>
          </div>
          <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 text-slate-600">
            {savedGames.length} bài tập
          </span>
        </div>

        {savedGames.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
            <FolderOpen className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="font-extrabold text-sm text-slate-700 mb-1">
              Chưa có bài tập nào được lưu
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Khi thầy cô bấm nút <strong>"Lưu bài tập"</strong> sau khi soạn, bài tập sẽ tự động xuất hiện tại đây để xem lại, cho học sinh chơi hoặc chỉnh sửa.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {savedGames.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 bg-white hover:bg-sky-50/20 transition-all flex items-center justify-between gap-4 flex-wrap shadow-xs"
              >
                <div className="flex-1 min-w-[240px]">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="font-black text-sm md:text-base text-slate-800">
                      {item.title}
                    </h3>
                    {getModeBadge(item.mode)}
                    {item.itemCount > 0 && (
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {item.itemCount} câu/thẻ
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                    {item.subject && (
                      <span className="text-sky-700 font-semibold">Chủ đề: {item.subject}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.updatedAt).toLocaleDateString('vi-VN')} {new Date(item.updatedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handlePlaySavedGame(item.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition"
                    title="Vào chơi ngay bài tập này"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Chơi ngay</span>
                  </button>

                  <button
                    onClick={() => handleEditSavedGame(item.id)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-extrabold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition"
                    title="Mở bài tập để chỉnh sửa nội dung"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Sửa</span>
                  </button>

                  <button
                    onClick={() => handleDuplicateSavedGame(item.id)}
                    className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
                    title="Tạo bản sao bài tập này"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const loaded = loadGameFromStorage(item.id);
                      if (loaded) exportStandaloneHtml(loaded);
                    }}
                    className="p-2 rounded-xl text-indigo-600 hover:bg-indigo-50 transition"
                    title="Xuất file HTML độc lập (chạy không cần mạng)"
                  >
                    <FileCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      const loaded = loadGameFromStorage(item.id);
                      if (loaded) exportGameToJson(loaded);
                    }}
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
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingTarget}
        title="Xác Nhận Xóa Bài Tập"
        itemName={deletingTarget?.title}
        message="Thầy/cô có chắc chắn muốn xóa bài tập này khỏi thiết bị không? Hành động này không thể hoàn tác."
        onConfirm={confirmDelete}
        onClose={() => setDeletingTarget(null)}
      />
    </div>
  );
};
