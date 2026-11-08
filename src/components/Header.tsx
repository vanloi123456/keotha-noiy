/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Play, 
  Edit3, 
  Save, 
  FolderOpen, 
  Download, 
  Maximize, 
  Minimize, 
  Home, 
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { GameData } from '../types/game';
import { sound } from '../utils/audio';

interface HeaderProps {
  game: GameData;
  isStudentMode: boolean;
  onToggleMode: (studentMode: boolean) => void;
  onOpenSettings: () => void;
  onOpenSaved: () => void;
  onSave: () => void;
  onGoHome: () => void;
  onResetStudent?: () => void;
  onCheckStudent?: () => void;
  timeRemaining?: number | null; // seconds
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  game,
  isStudentMode,
  onToggleMode,
  onOpenSettings,
  onOpenSaved,
  onSave,
  onGoHome,
  onResetStudent,
  onCheckStudent,
  timeRemaining,
  soundEnabled,
  onToggleSound,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getModeLabel = () => {
    switch (game.mode) {
      case 'matching': return 'Nối ý';
      case 'image_drop': return 'Thả vào hình ảnh';
      case 'categorize': return 'Phân loại tự do';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-sm px-4 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        {/* Brand / Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            title="Về màn hình chính"
            className="flex items-center gap-2 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-200 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sky-800 text-sm md:text-base tracking-tight leading-none">
                  Thử Tài Kéo Thả – Nối Ý
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">
                  {getModeLabel()}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[200px] md:max-w-xs mt-0.5">
                {game.title.trim() ? game.title : 'Chưa đặt tên trò chơi'}
              </p>
            </div>
          </button>
        </div>

        {/* Mid section: Timer or Status */}
        {isStudentMode && timeRemaining !== null && timeRemaining !== undefined && (
          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full font-bold text-sm shadow-sm border ${
            timeRemaining <= 10 
              ? 'bg-rose-50 text-rose-600 border-rose-200 animate-bounce' 
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Clock className="w-4 h-4" />
            <span>Thời gian: {formatTime(timeRemaining)}</span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.playPop();
              onToggleSound();
            }}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-sky-600" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors hidden sm:flex"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>

          {/* Teacher vs Student Mode Actions */}
          {!isStudentMode ? (
            <>
              <button
                onClick={onOpenSaved}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                title="Mở bộ sưu tập trò chơi đã lưu"
              >
                <FolderOpen className="w-4 h-4 text-amber-600" />
                <span className="hidden sm:inline">Trò chơi đã lưu</span>
              </button>

              <button
                onClick={onSave}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition"
                title="Lưu trò chơi vào thiết bị"
              >
                <Save className="w-4 h-4 text-sky-600" />
                <span>Lưu</span>
              </button>

              <button
                onClick={() => {
                  sound.playPop();
                  onToggleMode(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs md:text-sm font-extrabold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-md shadow-emerald-200 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                title="Chuyển sang chế độ học sinh chơi"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Bắt đầu chơi</span>
              </button>
            </>
          ) : (
            <>
              {onResetStudent && (
                <button
                  onClick={() => {
                    sound.playPop();
                    onResetStudent();
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition"
                  title="Xóa làm lại từ đầu"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Làm lại</span>
                </button>
              )}

              {onCheckStudent && (
                <button
                  onClick={() => {
                    sound.playPop();
                    onCheckStudent();
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs md:text-sm font-extrabold bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-200 hover:shadow-lg transition-all"
                  title="Kiểm tra đáp án"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Nộp bài & Chấm điểm</span>
                </button>
              )}

              <button
                onClick={() => {
                  sound.playPop();
                  onToggleMode(false);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold bg-violet-100 hover:bg-violet-200 text-violet-800 transition"
                title="Quay lại giao diện soạn giáo án / chỉnh sửa"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa (Giáo viên)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
