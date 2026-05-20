import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useCourses from '../hooks/useCourses';
import API from '../api/axios';
import QuizCard from '../components/QuizCard';
import { 
  Sparkles, 
  BookOpen, 
  UploadCloud, 
  FileText, 
  HelpCircle, 
  Trash2, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle, 
  XCircle,
  Award,
  BookOpenCheck,
  BrainCircuit,
  Loader
} from 'lucide-react';

const QuizPage = () => {
  const { addExperiencePoints } = useAuth();
  const { courses } = useCourses();
  
  // States
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  
  // Create / Generation state parameters
  const [courseId, setCourseId] = useState('');
  const [materialText, setMaterialText] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isPdfMode, setIsPdfMode] = useState(false); // toggle between text and pdf
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Active quiz testing state
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // 'A', 'B', 'C', 'D'
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [attemptFinished, setAttemptFinished] = useState(false);
  const [attemptLoading, setAttemptLoading] = useState(false);
  const [attemptOutcome, setAttemptOutcome] = useState(null); // { attempt, xpGained }

  const fetchQuizzes = async () => {
    setLoadingQuizzes(true);
    try {
      const response = await API.get('/quizzes');
      if (response.data && response.data.success) {
        setQuizzes(response.data.quizzes);
      }
    } catch (err) {
      console.error('Failed to load academic quizzes:', err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadFile(e.target.files[0]);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!courseId) {
      setErrorMessage('Please select a course/subject first.');
      return;
    }

    if (!isPdfMode && (!materialText || materialText.trim().length < 50)) {
      setErrorMessage('Please paste at least 50 characters of study notes, slides, or textbook text.');
      return;
    }

    if (isPdfMode && !uploadFile) {
      setErrorMessage('Please choose a valid PDF file to upload.');
      return;
    }

    setIsGenerating(true);
    const formData = new FormData();
    formData.append('courseId', courseId);
    
    if (isPdfMode) {
      formData.append('file', uploadFile);
    } else {
      formData.append('text', materialText);
    }

    try {
      const response = await API.post('/quizzes/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data && response.data.success) {
        setSuccessMessage('AI has successfully parsed the material and compiled an interactive multiple-choice quiz!');
        setQuizzes((prev) => [response.data.quiz, ...prev]);
        setMaterialText('');
        setUploadFile(null);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to compile AI Quiz. Check file size or key limits.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteQuiz = async (id) => {
    try {
      const response = await API.delete(`/quizzes/${id}`);
      if (response.data && response.data.success) {
        setQuizzes((prev) => prev.filter((q) => q._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete quiz:', err);
    }
  };

  // Quiz-taking flow triggers
  const handleStartQuiz = (quiz) => {
    setActiveQuiz(quiz);
    setActiveQuestionIdx(0);
    setSelectedOption(null);
    setAnswerSubmitted(false);
    setCorrectAnswersCount(0);
    setAttemptFinished(false);
    setAttemptOutcome(null);
  };

  const handleSelectOption = (opt) => {
    if (answerSubmitted) return;
    setSelectedOption(opt);
  };

  const handleSubmitAnswer = () => {
    if (!selectedOption || answerSubmitted) return;
    
    const currentQuestion = activeQuiz.questions[activeQuestionIdx];
    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setCorrectAnswersCount((prev) => prev + 1);
    }
    
    setAnswerSubmitted(true);
  };

  const handleNextQuestion = async () => {
    const nextIdx = activeQuestionIdx + 1;
    if (nextIdx < activeQuiz.questions.length) {
      setActiveQuestionIdx(nextIdx);
      setSelectedOption(null);
      setAnswerSubmitted(false);
    } else {
      // Quiz finished, save attempt
      setAttemptLoading(true);
      try {
        const response = await API.post(`/quizzes/${activeQuiz._id}/attempt`, {
          score: correctAnswersCount,
        });

        if (response.data && response.data.success) {
          setAttemptOutcome({
            attempt: response.data.attempt,
            xpGained: response.data.xpGained,
            message: response.data.message
          });
          // Sync with local XP
          addExperiencePoints(response.data.xpGained);
        }
      } catch (err) {
        console.error('Failed to log quiz attempt:', err);
      } finally {
        setAttemptLoading(false);
        setAttemptFinished(true);
      }
    }
  };

  const handleCloseQuizTaker = () => {
    setActiveQuiz(null);
    fetchQuizzes(); // Refresh scores on main panel
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 mb-20 md:mb-0">
      
      {/* 1. INTERACTIVE QUIZ-TAKING OVERLAY LAYOUT */}
      {activeQuiz ? (
        <div className="glass-card p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-slide-up">
          
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
            <button
              onClick={handleCloseQuizTaker}
              className="glass-btn-secondary py-1.5 px-3 rounded-lg text-xs font-bold flex items-center gap-1.5 active:scale-95"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit Quiz Board
            </button>
            
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Taking AI Quiz
              </span>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-xs block">
                {activeQuiz.title}
              </span>
            </div>
          </div>

          {!attemptFinished ? (
            // TEST QUESTIONS SLIDES
            <div className="space-y-6">
              
              {/* Question Index Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Question {activeQuestionIdx + 1} of {activeQuiz.questions.length}</span>
                  <span>Correct: {correctAnswersCount} / {activeQuiz.questions.length}</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${((activeQuestionIdx + 1) / activeQuiz.questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question title */}
              <div className="p-5 bg-slate-50 dark:bg-[#121624]/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white leading-relaxed">
                  {activeQuiz.questions[activeQuestionIdx].questionText}
                </h3>
              </div>

              {/* Choice options (A, B, C, D) */}
              <div className="grid gap-3">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const currentQ = activeQuiz.questions[activeQuestionIdx];
                  const optText = currentQ.options[opt];
                  if (!optText) return null;

                  let optStyles = 'border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-slate-600 dark:text-slate-300';
                  
                  if (!answerSubmitted) {
                    if (selectedOption === opt) {
                      optStyles = 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400 ring-2 ring-brand-500/20';
                    }
                  } else {
                    // Answer is submitted
                    if (opt === currentQ.correctAnswer) {
                      // Correct option
                      optStyles = 'border-success bg-success/10 text-success dark:text-success ring-2 ring-success/10';
                    } else if (selectedOption === opt) {
                      // Selected incorrect option
                      optStyles = 'border-danger bg-danger/10 text-danger dark:text-danger ring-2 ring-danger/10';
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      disabled={answerSubmitted}
                      className={`flex gap-3 items-center p-4 rounded-xl text-xs text-left font-semibold border active:scale-[0.99] transition-all duration-200 ${optStyles}`}
                    >
                      <span className={`w-6 h-6 rounded-lg font-black shrink-0 flex items-center justify-center border text-[10px] ${
                        selectedOption === opt 
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                      }`}>
                        {opt}
                      </span>
                      <span className="flex-1">{optText}</span>
                      
                      {answerSubmitted && opt === currentQ.correctAnswer && (
                        <CheckCircle className="w-5 h-5 text-success shrink-0" />
                      )}
                      {answerSubmitted && selectedOption === opt && opt !== currentQ.correctAnswer && (
                        <XCircle className="w-5 h-5 text-danger shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanations & Next Action */}
              <div className="space-y-4 pt-2">
                {answerSubmitted && (
                  <div className="p-4 bg-brand-500/5 border border-brand-500/10 dark:bg-[#151329]/30 rounded-xl space-y-1.5 animate-slide-up">
                    <div className="flex items-center gap-1.5 text-brand-500 font-extrabold text-[11px] uppercase tracking-wider">
                      <BrainCircuit className="w-4 h-4" />
                      Academic Reasoning Explanation
                    </div>
                    <p className="text-[11px] leading-relaxed font-semibold text-slate-500 dark:text-slate-400">
                      {activeQuiz.questions[activeQuestionIdx].explanation || 'Understand the core context behind this question statement.'}
                    </p>
                  </div>
                )}

                {!answerSubmitted ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!selectedOption}
                    className="w-full glass-btn-primary py-3 rounded-xl font-bold text-xs shadow-md shadow-brand-600/15 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all"
                  >
                    Confirm & Evaluate Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="w-full glass-btn-secondary py-3 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1 hover:border-brand-500/20 active:scale-95 transition-all"
                  >
                    {activeQuestionIdx + 1 === activeQuiz.questions.length ? 'Finalize Quiz Score' : 'Next Question'}
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>
                )}
              </div>

            </div>
          ) : (
            // SCORE SUMMARY ATTEMPT RESULTS PAGE
            <div className="space-y-6 text-center max-w-md mx-auto py-6 animate-slide-up">
              
              <div className="w-20 h-20 rounded-full bg-brand-500/10 border border-brand-500/10 flex items-center justify-center mx-auto text-brand-500">
                <Award className="w-10 h-10 animate-bounce" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Assessment Board Complete!</h3>
                <p className="text-slate-400 text-xs font-semibold">You have logged and submitted your answers successfully.</p>
              </div>

              {/* Stats Card */}
              {attemptLoading ? (
                <div className="py-6 flex justify-center">
                  <Loader className="w-6 h-6 animate-spin text-brand-500" />
                </div>
              ) : attemptOutcome ? (
                <div className="space-y-4">
                  <div className="p-6 bg-slate-50 dark:bg-[#121624]/60 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl space-y-3.5">
                    
                    <div className="flex justify-between items-center px-2">
                      <span className="text-xs text-slate-400 font-bold">Accuracy Percentage</span>
                      <span className="text-base font-black text-brand-600 dark:text-brand-400">{attemptOutcome.attempt?.percentage}%</span>
                    </div>

                    <div className="flex justify-between items-center px-2 border-t border-slate-200/50 dark:border-slate-800/40 pt-3">
                      <span className="text-xs text-slate-400 font-bold">Total Correct</span>
                      <span className="text-xs font-black text-slate-800 dark:text-white">
                        {attemptOutcome.attempt?.score} / {attemptOutcome.attempt?.totalQuestions}
                      </span>
                    </div>

                    <div className="p-3 bg-brand-500/10 border border-brand-500/15 text-brand-600 dark:text-brand-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm">
                      <Sparkles className="w-4 h-4 fill-current/15" />
                      XP Gained: +{attemptOutcome.xpGained} XP
                    </div>

                  </div>

                  <p className="text-xs font-bold text-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10 py-2 px-4 rounded-xl border border-emerald-500/10 w-fit mx-auto">
                    {attemptOutcome.message}
                  </p>
                </div>
              ) : (
                <div className="p-4 text-xs text-rose-500 font-semibold bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  Attempt logged locally, database synchronizing...
                </div>
              )}

              <button
                onClick={handleCloseQuizTaker}
                className="w-full glass-btn-primary py-3 rounded-xl font-bold text-xs"
              >
                Return to Assessment Board
              </button>

            </div>
          )}

        </div>
      ) : (
        // 2. MAIN ASSESSMENT LIST BOARD & INTAKE PANEL
        <div className="space-y-6">
          
          {/* HEADER TITLE */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-5">
            <div>
              <h2 className="text-2xl md:text-3.5xl font-black text-slate-800 dark:text-white leading-tight">
                AI Study Assessment Board 📝
              </h2>
              <p className="text-slate-400 text-xs md:text-sm font-semibold leading-relaxed mt-1 flex items-center gap-1.5">
                <BookOpenCheck className="w-4.5 h-4.5 text-brand-500" />
                Upload PDF summaries or paste custom notes to synthesize adaptive multiple-choice quizzes.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* INTAKE TOOLS FORM (col-span-5) */}
            <div className="lg:col-span-5 glass-card p-5 md:p-6 space-y-5">
              
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200">Synthesize AI Quiz Companion</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Parse materials with Gemini to generate dynamic MCQ quizzes.</p>
              </div>

              {errorMessage && (
                <div className="p-3 bg-danger/10 border border-danger/25 text-danger rounded-xl text-xs font-bold leading-normal">
                  {errorMessage}
                </div>
              )}

              {successMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold leading-normal">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleCreateQuiz} className="space-y-4">
                
                {/* Course selector */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Associated Course</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full glass-input py-2.5 text-xs bg-slate-50 dark:bg-slate-900/50 font-semibold"
                    disabled={isGenerating}
                  >
                    <option value="">Select coursework subject...</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.code} - {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tab selector for Text / PDF */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Material Mode</label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
                    <button
                      type="button"
                      onClick={() => setIsPdfMode(false)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        !isPdfMode 
                          ? 'bg-white dark:bg-[#121624] text-slate-800 dark:text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      Paste Study Notes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPdfMode(true)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        isPdfMode 
                          ? 'bg-white dark:bg-[#121624] text-slate-800 dark:text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                      }`}
                    >
                      Upload Chapter PDF
                    </button>
                  </div>
                </div>

                {/* TEXT INPUT BLOCK */}
                {!isPdfMode ? (
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Material Content</label>
                    <textarea
                      value={materialText}
                      onChange={(e) => setMaterialText(e.target.value)}
                      placeholder="Paste notes, text, chapters or lecture scripts here (min 50 characters)..."
                      rows={6}
                      className="w-full glass-input text-xs font-semibold bg-slate-50 dark:bg-slate-900/50 placeholder-slate-400 leading-relaxed"
                      disabled={isGenerating}
                    />
                  </div>
                ) : (
                  // PDF UPLOAD DRAGZONE
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">PDF File</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 text-center hover:border-brand-500/30 transition-colors bg-slate-50/50 dark:bg-slate-900/20">
                      <UploadCloud className="w-9 h-9 mx-auto text-slate-400 shrink-0 mb-2 animate-pulse-subtle" />
                      
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-normal">
                        {uploadFile ? uploadFile.name : 'Select structured PDF chapter'}
                      </div>
                      
                      <p className="text-[9px] text-slate-400 mt-1 font-semibold">
                        PDF up to 5MB limit size.
                      </p>

                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                        id="pdf-upload"
                        disabled={isGenerating}
                      />
                      
                      <label
                        htmlFor="pdf-upload"
                        className="mt-3.5 inline-block px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-[10px] font-black rounded-lg cursor-pointer transition-colors active:scale-95"
                      >
                        Choose File
                      </label>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full glass-btn-primary py-3 text-xs font-bold rounded-xl shadow-md shadow-brand-600/10 flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin text-white" />
                      Synthesizing AI Quiz...
                    </>
                  ) : (
                    <>
                      <BrainCircuit className="w-4 h-4" />
                      Synthesize AI Study Quiz
                    </>
                  )}
                </button>

              </form>

            </div>

            {/* CREATED QUIZZES GALLERY (col-span-7) */}
            <div className="lg:col-span-7 space-y-4">
              
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 pl-1">Compiled Subject Quizzes</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 pl-1">Review topics and check past accuracy levels.</p>
              </div>

              {loadingQuizzes ? (
                <div className="py-20 text-center animate-pulse text-xs text-slate-400 font-bold uppercase pl-1">
                  Syncing interactive quizzes...
                </div>
              ) : quizzes.length === 0 ? (
                <div className="glass-card py-20 text-center space-y-4 max-w-md mx-auto border-dashed border border-slate-200 dark:border-slate-800/80 bg-white/30 dark:bg-[#121624]/20 shadow-sm mt-6">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto text-slate-400 border border-slate-200/50 dark:border-slate-800/40">
                    <FileText className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-200">No AI Study Quizzes Compiled</h4>
                    <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                      Use the intake panel to paste notes or upload slides, and compile your first smart study quiz.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {quizzes.map((quiz) => (
                    <QuizCard
                      key={quiz._id}
                      quiz={quiz}
                      onTakeQuiz={handleStartQuiz}
                      onDeleteQuiz={handleDeleteQuiz}
                    />
                  ))}
                </div>
              )}

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default QuizPage;
