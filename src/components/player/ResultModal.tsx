/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  RotateCcw, 
  Eye, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Star,
  Sparkles
} from 'lucide-react';
import { PlayerResult } from '../../types/game';
import { sound } from '../../utils/audio';

interface ResultModalProps {
  isOpen: boolean;
  result: PlayerResult | null;
  onClose: () => void;
  onRetry: () => void;
  onOpenCertificate: (studentName: string) => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  result,
  onClose,
  onRetry,
  onOpenCertificate,
}) => {
  const [studentName, setStudentName] = React.useState('');

  useEffect(() => {
    if (isOpen && result) {
      if (result.scorePercentage === 100) {
        sound.playFanfare();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#fbbf24', '#34d399', '#f472b6'],
        });
      } else if (result.scorePercentage >= 50) {
        sound.playCorrect();
      } else {
        sound.playIncorrect();
      }
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const isPerfect = result.scorePercentage === 100;
  const isGood = result.scorePercentage >= 60;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 text-center shadow-2xl border border-sky-100 transform transition-all animate-pulse-subtle">
        {/* Celebration Icon */}
        <div className="relative inline-block mb-3">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg ${
            isPerfect
              ? 'bg-gradient-to-tr from-amber-400 to-yellow-300 text-white shadow-amber-200'
              : isGood
              ? 'bg-gradient-to-tr from-sky-400 to-emerald-400 text-white shadow-sky-200'
              : 'bg-gradient-to-tr from-indigo-400 to-purple-400 text-white shadow-indigo-200'
          }`}>
            <Trophy className="w-10 h-10 animate-bounce" />
          </div>
          {isPerfect && (
            <div className="absolute -top-2 -right-2 text-amber-500 animate-spin" style={{ animationDuration: '4s' }}>
              <Sparkles className="w-6 h-6" />
            </div>
          )}
        </div>

        {/* Title Feedback */}
        <h2 className="text-2xl font-black text-slate-800">
          {isPerfect ? 'Xuất Sắc! Bé Giỏi Quá!' : isGood ? 'Rất Tốt! Hoan Hô Bé!' : 'Cố Gắng Lên Nào!'}
        </h2>

        <p className="text-slate-500 text-xs md:text-sm mt-1">
          {isPerfect
            ? 'Bé đã trả lời chính xác tất cả các câu!'
            : isGood
            ? 'Bé làm rất tốt, hãy kiểm tra lại những câu chưa đúng nhé!'
            : 'Đừng nản lòng, hãy xem lại bài và thử lại lần nữa nhé!'}
        </p>

        {/* Score Badge */}
        <div className="my-5 p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-around">
          <div>
            <span className="block text-3xl font-black text-sky-600">
              {result.scorePercentage}%
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Tỷ lệ chính xác
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div>
            <span className="block text-2xl font-black text-emerald-600">
              {result.correctAnswers}/{result.totalQuestions}
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Số câu đúng
            </span>
          </div>

          <div className="h-8 w-px bg-slate-200" />

          <div>
            <span className="block text-2xl font-black text-amber-600">
              {result.timeSpentSeconds}s
            </span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Thời gian
            </span>
          </div>
        </div>

        {/* Optional Student Name for Certificate */}
        <div className="mb-5 text-left">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1">
            Nhập tên học sinh để in Giấy khen / Phiếu điểm (tùy chọn):
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Họ và tên học sinh..."
            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 focus:border-sky-500 outline-none"
          />
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={() => {
              sound.playPop();
              onOpenCertificate(studentName);
            }}
            className="w-full py-2.5 px-4 rounded-2xl font-black text-xs md:text-sm bg-amber-400 hover:bg-amber-500 text-amber-950 flex items-center justify-center gap-2 shadow-md shadow-amber-200 transition"
          >
            <Award className="w-4 h-4" />
            <span>In Giấy Khen / Phiếu Kết Quả</span>
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                sound.playPop();
                onClose();
              }}
              className="py-2.5 px-3 rounded-2xl font-bold text-xs md:text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <Eye className="w-4 h-4" />
              <span>Xem lại bài</span>
            </button>

            <button
              onClick={() => {
                sound.playPop();
                onRetry();
              }}
              className="py-2.5 px-3 rounded-2xl font-extrabold text-xs md:text-sm bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center gap-1.5 shadow-md shadow-sky-200 transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Chơi lại</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
