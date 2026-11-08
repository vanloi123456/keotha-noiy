/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { sound } from '../../utils/audio';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  itemName?: string;
  message?: string;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  title,
  itemName,
  message,
  onConfirm,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center shadow-2xl border border-rose-100 transform transition-all animate-pulse-subtle">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-4 border border-rose-100">
          <Trash2 className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-slate-800 mb-1">{title}</h3>

        {itemName && (
          <p className="font-extrabold text-sm text-rose-600 bg-rose-50/70 px-3 py-1.5 rounded-xl inline-block my-2 max-w-full truncate border border-rose-200">
            "{itemName}"
          </p>
        )}

        <p className="text-slate-500 text-xs md:text-sm my-2">
          {message || 'Hành động này sẽ xóa hoàn toàn bài tập khỏi thiết bị của thầy cô và không thể hoàn tác.'}
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Hủy bỏ
          </button>

          <button
            type="button"
            onClick={() => {
              sound.playPop();
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl text-xs md:text-sm font-extrabold bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 transition"
          >
            Xác nhận xóa
          </button>
        </div>
      </div>
    </div>
  );
};
