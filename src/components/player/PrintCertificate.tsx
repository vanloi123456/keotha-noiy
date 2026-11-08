/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Star, CheckCircle, Clock } from 'lucide-react';
import { GameData, PlayerResult } from '../../types/game';

interface PrintCertificateProps {
  game: GameData;
  result: PlayerResult;
  onClose: () => void;
}

export const PrintCertificate: React.FC<PrintCertificateProps> = ({
  game,
  result,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(result.completedAt).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative">
        {/* Screen controls */}
        <div className="no-print flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Award className="w-5 h-5 text-amber-500" />
            <span>Phiếu Kết Quả & Giấy Khen Học Tập</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs md:text-sm shadow-md transition"
            >
              In Phiếu / Lưu PDF
            </button>
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs md:text-sm transition"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* Printable Certificate Sheet */}
        <div className="border-8 border-amber-300 rounded-3xl p-6 md:p-8 bg-gradient-to-b from-amber-50/40 via-white to-sky-50/40 text-center relative overflow-hidden">
          {/* Decorative Corner Stars */}
          <div className="absolute top-3 left-3 text-amber-400">
            <Star className="w-6 h-6 fill-amber-300" />
          </div>
          <div className="absolute top-3 right-3 text-amber-400">
            <Star className="w-6 h-6 fill-amber-300" />
          </div>
          <div className="absolute bottom-3 left-3 text-amber-400">
            <Star className="w-6 h-6 fill-amber-300" />
          </div>
          <div className="absolute bottom-3 right-3 text-amber-400">
            <Star className="w-6 h-6 fill-amber-300" />
          </div>

          <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <Award className="w-10 h-10" />
          </div>

          <span className="text-xs font-black uppercase tracking-widest text-amber-600 block mb-1">
            GIẤY CHỨNG NHẬN HOÀN THÀNH
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 mb-2">
            THỬ TÀI KÉO THẢ – NỐI Ý
          </h2>

          <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
            Khen ngợi học sinh đã nỗ lực hoàn thành xuất sắc thử thách bài học!
          </p>

          {/* Student Name Input or placeholder */}
          <div className="my-4 inline-block min-w-[240px] border-b-2 border-slate-400 pb-1 text-lg font-black text-sky-800">
            {result.studentName?.trim() ? result.studentName : 'Em: .....................................................'}
          </div>

          {/* Details Table */}
          <div className="bg-white/80 rounded-2xl p-4 border border-amber-200 max-w-md mx-auto my-4 text-xs md:text-sm text-slate-700 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Bài học / Trò chơi:</span>
              <span className="font-extrabold text-slate-800">{game.title || 'Bài tập kéo thả nối ý'}</span>
            </div>
            {game.subject && (
              <div className="flex justify-between">
                <span className="font-semibold text-slate-500">Chủ đề môn học:</span>
                <span className="font-bold text-slate-800">{game.subject}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Số câu trả lời đúng:</span>
              <span className="font-extrabold text-emerald-600">
                {result.correctAnswers} / {result.totalQuestions} câu ({result.scorePercentage}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Thời gian làm bài:</span>
              <span className="font-bold text-slate-800">{result.timeSpentSeconds} giây</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Ngày hoàn thành:</span>
              <span className="font-bold text-slate-800">{formattedDate}</span>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-end px-6 text-xs text-slate-500">
            <div>
              <p className="font-semibold">Nhận xét của Giáo viên:</p>
              <p className="font-bold text-emerald-700 italic mt-1">
                {result.scorePercentage === 100
                  ? '🌟 Em học rất chăm chỉ, hiểu bài rất sâu sắc!'
                  : result.scorePercentage >= 60
                  ? '👏 Em đã làm rất tốt, tiếp tục phát huy nhé!'
                  : '💪 Em hãy xem lại và rèn luyện thêm lần nữa nhé!'}
              </p>
            </div>
            <div className="text-center">
              <p className="font-semibold mb-12">Chữ ký Giáo viên</p>
              <div className="w-28 border-t border-slate-300 mx-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
