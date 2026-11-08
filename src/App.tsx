/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  GameData, 
  GameMode, 
  createEmptyGame, 
  PlayerResult 
} from './types/game';
import { Header } from './components/Header';
import { StartScreen } from './components/StartScreen';
import { EditorMatching } from './components/editor/EditorMatching';
import { EditorImageDrop } from './components/editor/EditorImageDrop';
import { EditorCategorize } from './components/editor/EditorCategorize';
import { SavedGamesModal } from './components/editor/SavedGamesModal';
import { GameSettingsModal } from './components/editor/GameSettingsModal';
import { SaveGameModal } from './components/common/SaveGameModal';
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';
import { WordImportModal } from './components/common/WordImportModal';
import { PlayerMatching } from './components/player/PlayerMatching';
import { PlayerImageDrop } from './components/player/PlayerImageDrop';
import { PlayerCategorize } from './components/player/PlayerCategorize';
import { ResultModal } from './components/player/ResultModal';
import { PrintCertificate } from './components/player/PrintCertificate';
import { 
  saveGameToStorage, 
  loadGameFromStorage,
  deleteGameFromStorage,
  getSavedGamesList,
  parseGameFromJson 
} from './utils/storage';
import { 
  downloadWordTemplate, 
  parseWordFile, 
  ParsedWordGame 
} from './utils/wordTemplate';
import { sound } from './utils/audio';
import { 
  AlertCircle, 
  HelpCircle, 
  Settings, 
  Layers, 
  Image as ImageIcon, 
  Grid, 
  Save, 
  Trash2, 
  CheckCircle2, 
  FolderCheck,
  FileCode,
  FileText,
  Upload
} from 'lucide-react';

export default function App() {
  // Main state - strictly starts empty per requirement #11
  const [game, setGame] = useState<GameData>(() => createEmptyGame('matching'));
  const [currentView, setCurrentView] = useState<'start' | 'editor' | 'player'>('start');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isDeleteCurrentModalOpen, setIsDeleteCurrentModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [currentResult, setCurrentResult] = useState<PlayerResult | null>(null);

  // Word docx template state
  const [parsedWordData, setParsedWordData] = useState<ParsedWordGame | null>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const editorWordFileInputRef = useRef<HTMLInputElement>(null);

  // Student player interactive state
  const [userPairs, setUserPairs] = useState<Record<string, string>>({});
  const [zoneAnswers, setZoneAnswers] = useState<Record<string, string>>({});
  const [categorizeAnswers, setCategorizeAnswers] = useState<Record<string, string>>({});
  const [isChecked, setIsChecked] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sound sync
  const toggleSound = () => {
    sound.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
  };

  const handleUpdateGame = (updates: Partial<GameData>) => {
    setGame((prev) => ({ ...prev, ...updates }));
  };

  // Check if current game already exists in storage
  const isSavedInStorage = () => {
    return !!loadGameFromStorage(game.id);
  };

  // Start new blank game
  const handleStartNewGame = (mode: GameMode) => {
    setGame(createEmptyGame(mode));
    setCurrentView('editor');
    resetStudentState();
  };

  // Student reset
  const resetStudentState = () => {
    setUserPairs({});
    setZoneAnswers({});
    setCategorizeAnswers({});
    setIsChecked(false);
    setIsResultModalOpen(false);
    setIsCertificateOpen(false);
    setCurrentResult(null);

    if (game.timeLimitSeconds > 0) {
      setTimeRemaining(game.timeLimitSeconds);
    } else {
      setTimeRemaining(null);
    }
    startTimeRef.current = Date.now();
  };

  // Timer countdown in student mode
  useEffect(() => {
    if (currentView !== 'player' || isChecked || timeRemaining === null) return;

    if (timeRemaining <= 0) {
      handleCheckStudentAnswers();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [currentView, isChecked, timeRemaining]);

  const hasGameContent = () => {
    if (game.mode === 'matching') return game.matchingPairs.length > 0;
    if (game.mode === 'image_drop') return !!game.backgroundImage && game.imageDropZones.length > 0;
    if (game.mode === 'categorize') return game.categories.length > 0 && game.categorizeCards.length > 0;
    return false;
  };

  // Switch to player mode
  const handleStartPlaying = () => {
    if (!hasGameContent()) {
      alert('Trò chơi hiện chưa có nội dung. Quý thầy cô vui lòng tạo câu hỏi trước khi bắt đầu chơi nhé!');
      return;
    }
    resetStudentState();
    setCurrentView('player');
  };

  // Load saved game from catalog or start screen
  const handleLoadSavedGame = (loaded: GameData, playDirectly = false) => {
    setGame(loaded);
    resetStudentState();
    if (playDirectly) {
      setCurrentView('player');
    } else {
      setCurrentView('editor');
    }
    showToast(`Đã mở bài tập "${loaded.title || 'Bài tập'}"`);
  };

  // Evaluate answers
  const handleCheckStudentAnswers = () => {
    if (isChecked) return;
    setIsChecked(true);

    let total = 0;
    let correct = 0;

    if (game.mode === 'matching') {
      total = game.matchingPairs.length;
      game.matchingPairs.forEach((pair) => {
        if (userPairs[pair.id] === pair.id) {
          correct++;
        }
      });
    } else if (game.mode === 'image_drop') {
      total = game.imageDropZones.length;
      game.imageDropZones.forEach((zone) => {
        if (zoneAnswers[zone.id] === zone.correctCardId && zone.correctCardId) {
          correct++;
        }
      });
    } else if (game.mode === 'categorize') {
      total = game.categorizeCards.length;
      game.categorizeCards.forEach((card) => {
        if (categorizeAnswers[card.id] === card.targetCategoryId && card.targetCategoryId) {
          correct++;
        }
      });
    }

    const timeSpent = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    const result: PlayerResult = {
      totalQuestions: total,
      correctAnswers: correct,
      scorePercentage: percentage,
      timeSpentSeconds: timeSpent,
      completedAt: Date.now(),
    };

    setCurrentResult(result);
    setIsResultModalOpen(true);
  };

  // Save game handlers
  const handleSaveGame = (title: string, subject: string) => {
    const updatedGame: GameData = {
      ...game,
      title: title.trim(),
      subject: subject.trim(),
      updatedAt: Date.now(),
    };
    setGame(updatedGame);
    const success = saveGameToStorage(updatedGame);
    if (success) {
      sound.playSnap();
      showToast(`✅ Đã lưu bài tập "${updatedGame.title || 'Chưa đặt tên'}" thành công!`);
    } else {
      alert('Có lỗi xảy ra khi lưu bài tập!');
    }
  };

  const handleSaveAsNewGame = (title: string, subject: string) => {
    const newId = 'game_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
    const newGame: GameData = {
      ...game,
      id: newId,
      title: title.trim() ? title.trim() + ' (Bản sao)' : 'Bản sao bài tập',
      subject: subject.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setGame(newGame);
    const success = saveGameToStorage(newGame);
    if (success) {
      sound.playSnap();
      showToast(`✅ Đã lưu thành bài tập mới: "${newGame.title}"!`);
    } else {
      alert('Có lỗi xảy ra khi lưu bản sao!');
    }
  };

  // Delete current game
  const handleDeleteCurrentGame = () => {
    deleteGameFromStorage(game.id);
    sound.playPop();
    showToast(`🗑 Đã xóa bài tập "${game.title || 'hiện tại'}" khỏi máy.`);
    // Reset to empty game and return to start screen
    setGame(createEmptyGame(game.mode));
    setCurrentView('start');
  };

  // Import JSON
  const handleImportJson = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const parsed = parseGameFromJson(content);
      if (parsed) {
        setGame(parsed);
        sound.playSnap();
        showToast(`Đã nhập bài tập "${parsed.title || 'Mới'}" thành công!`);
        setCurrentView('editor');
      } else {
        alert('Tệp JSON không hợp lệ hoặc không đúng định dạng!');
      }
    };
    reader.readAsText(file);
  };

  // Word (.docx) Template Download & Upload
  const handleDownloadWordTemplate = async () => {
    try {
      sound.playSnap();
      await downloadWordTemplate(game.mode, game);
      showToast('📄 Đã tải xuống file mẫu Word (.docx) thành công!');
    } catch (e) {
      console.error('Error downloading Word template', e);
      alert('Không thể tạo file Word. Vui lòng thử lại!');
    }
  };

  const handleUploadWordFile = async (file: File) => {
    try {
      sound.playPop();
      const parsed = await parseWordFile(file);
      setParsedWordData(parsed);
      setIsWordModalOpen(true);
    } catch (e) {
      console.error('Error parsing word file', e);
      alert('Không thể đọc file Word này. Vui lòng kiểm tra định dạng .docx!');
    }
  };

  const handleConfirmWordImport = (parsed: ParsedWordGame) => {
    setGame((prev) => ({
      ...prev,
      title: parsed.title || prev.title,
      subject: parsed.subject || prev.subject,
      instructions: parsed.instructions || prev.instructions,
      timeLimitSeconds: parsed.timeLimitSeconds || prev.timeLimitSeconds,
      mode: parsed.mode,
      matchingPairs: parsed.matchingPairs.length > 0 ? parsed.matchingPairs : prev.matchingPairs,
      categories: parsed.categories.length > 0 ? parsed.categories : prev.categories,
      categorizeCards: parsed.categorizeCards.length > 0 ? parsed.categorizeCards : prev.categorizeCards,
      imageAnswerCards: parsed.imageAnswerCards.length > 0 ? parsed.imageAnswerCards : prev.imageAnswerCards,
    }));
    resetStudentState();
    setCurrentView('editor');
    showToast('✅ Đã nạp nội dung từ file Word thành công!');
  };

  const currentSaved = isSavedInStorage();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-sky-50/60 via-amber-50/30 to-violet-50/40 text-slate-800">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="font-extrabold text-xs md:text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        game={game}
        isStudentMode={currentView === 'player'}
        onToggleMode={(studentMode) => {
          if (studentMode) {
            handleStartPlaying();
          } else {
            setCurrentView('editor');
          }
        }}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenSaved={() => setIsSavedModalOpen(true)}
        onSave={() => setIsSaveModalOpen(true)}
        onGoHome={() => setCurrentView('start')}
        onResetStudent={resetStudentState}
        onCheckStudent={handleCheckStudentAnswers}
        timeRemaining={timeRemaining}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {currentView === 'start' && (
          <StartScreen
            game={game}
            onUpdateGame={handleUpdateGame}
            onStartNewGame={handleStartNewGame}
            onGoToEditor={() => setCurrentView('editor')}
            onStartPlaying={handleStartPlaying}
            onOpenSaved={() => setIsSavedModalOpen(true)}
            onOpenSaveModal={() => setIsSaveModalOpen(true)}
            onLoadSavedGame={handleLoadSavedGame}
            onImportJson={handleImportJson}
            onDownloadWordTemplate={handleDownloadWordTemplate}
            onUploadWordFile={handleUploadWordFile}
          />
        )}

        {currentView === 'editor' && (
          <div className="space-y-5">
            {/* Exercise Storage Status & Quick Save/Delete Bar in Editor */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-sky-100 flex items-center justify-between flex-wrap gap-3">
              {/* Left: Mode Selection Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 mr-1">
                  Dạng bài:
                </span>
                <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
                  <button
                    onClick={() => {
                      sound.playPop();
                      handleUpdateGame({ mode: 'matching' });
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      game.mode === 'matching' ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>Nối ý</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playPop();
                      handleUpdateGame({ mode: 'image_drop' });
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      game.mode === 'image_drop' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Thả vào hình</span>
                  </button>

                  <button
                    onClick={() => {
                      sound.playPop();
                      handleUpdateGame({ mode: 'categorize' });
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      game.mode === 'categorize' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                    <span>Phân loại</span>
                  </button>
                </div>
              </div>

              {/* Right: Storage & Exercise Controls */}
              <div className="flex items-center gap-2 flex-wrap">
                {currentSaved && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                    <FolderCheck className="w-3.5 h-3.5" />
                    <span>Đã lưu trong máy</span>
                  </span>
                )}

                <button
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  title="Cài đặt tên bài học, thời gian, hướng dẫn"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  <span>Cài đặt bài ({game.title ? game.title : 'Chưa đặt tên'})</span>
                </button>

                <button
                  onClick={handleDownloadWordTemplate}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition"
                  title="Tải file mẫu Word (.docx) của bài tập này"
                >
                  <FileCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Mẫu Word</span>
                </button>

                <button
                  onClick={() => editorWordFileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
                  title="Nạp nội dung từ file Word (.docx)"
                >
                  <Upload className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Nạp Word</span>
                </button>
                <input
                  ref={editorWordFileInputRef}
                  type="file"
                  accept=".docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadWordFile(file);
                      e.target.value = '';
                    }
                  }}
                  className="hidden"
                />

                <button
                  onClick={() => setIsSaveModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-white shadow-sm transition"
                  title="Lưu bài tập này vào máy"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{currentSaved ? 'Lưu cập nhật' : 'Lưu bài tập'}</span>
                </button>

                {currentSaved && (
                  <button
                    onClick={() => setIsDeleteCurrentModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                    title="Xóa bài tập này khỏi thiết bị"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa bài này</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mode-specific Editors */}
            {game.mode === 'matching' && (
              <EditorMatching
                game={game}
                onUpdatePairs={(pairs) => handleUpdateGame({ matchingPairs: pairs })}
                onUpdateGame={handleUpdateGame}
              />
            )}

            {game.mode === 'image_drop' && (
              <EditorImageDrop
                game={game}
                onUpdateGame={handleUpdateGame}
              />
            )}

            {game.mode === 'categorize' && (
              <EditorCategorize
                game={game}
                onUpdateGame={handleUpdateGame}
              />
            )}
          </div>
        )}

        {currentView === 'player' && (
          <div className="space-y-5">
            {/* Student Game Banner (Topic & Instructions if teacher provided) */}
            {(game.title || game.subject || game.instructions) && (
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-sky-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-800">
                    {game.title || 'Trò Chơi Học Tập'}
                  </h2>
                  {game.subject && (
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full inline-block mt-1">
                      {game.subject}
                    </span>
                  )}
                </div>

                {game.instructions && (
                  <div className="flex items-start gap-2 max-w-xl text-xs md:text-sm text-slate-600 bg-amber-50/70 p-3 rounded-2xl border border-amber-200/80">
                    <HelpCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span>{game.instructions}</span>
                  </div>
                )}
              </div>
            )}

            {/* Student Play Boards */}
            {game.mode === 'matching' && (
              <PlayerMatching
                game={game}
                userPairs={userPairs}
                onChangeUserPairs={setUserPairs}
                isChecked={isChecked}
              />
            )}

            {game.mode === 'image_drop' && (
              <PlayerImageDrop
                game={game}
                zoneAnswers={zoneAnswers}
                onChangeZoneAnswers={setZoneAnswers}
                isChecked={isChecked}
              />
            )}

            {game.mode === 'categorize' && (
              <PlayerCategorize
                game={game}
                categorizeAnswers={categorizeAnswers}
                onChangeCategorizeAnswers={setCategorizeAnswers}
                isChecked={isChecked}
              />
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <SaveGameModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        game={game}
        isExistingInStorage={currentSaved}
        onSave={handleSaveGame}
        onSaveAsNew={handleSaveAsNewGame}
      />

      <ConfirmDeleteModal
        isOpen={isDeleteCurrentModalOpen}
        title="Xóa Bài Tập Đang Mở"
        itemName={game.title || 'Bài tập hiện tại'}
        message="Thầy/cô có chắc muốn xóa vĩnh viễn bài tập này khỏi thiết bị không? Sau khi xóa, bài sẽ không còn trong danh sách lưu."
        onConfirm={handleDeleteCurrentGame}
        onClose={() => setIsDeleteCurrentModalOpen(false)}
      />

      <SavedGamesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        onLoadGame={handleLoadSavedGame}
        currentGame={game}
        onGameDeleted={(deletedId) => {
          if (deletedId === game.id) {
            setGame(createEmptyGame(game.mode));
          }
          showToast('Đã xóa bài tập khỏi thiết bị.');
        }}
      />

      <GameSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        game={game}
        onUpdateGame={handleUpdateGame}
      />

      <ResultModal
        isOpen={isResultModalOpen}
        result={currentResult}
        onClose={() => setIsResultModalOpen(false)}
        onRetry={resetStudentState}
        onOpenCertificate={(name) => {
          if (currentResult) {
            setCurrentResult({ ...currentResult, studentName: name });
            setIsResultModalOpen(false);
            setIsCertificateOpen(true);
          }
        }}
      />

      <WordImportModal
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        parsedData={parsedWordData}
        onConfirmImport={handleConfirmWordImport}
      />

      {isCertificateOpen && currentResult && (
        <PrintCertificate
          game={game}
          result={currentResult}
          onClose={() => setIsCertificateOpen(false)}
        />
      )}
    </div>
  );
}
