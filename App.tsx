import React, { useState, useEffect } from 'react';
import { Question, ExamConfig, AppMode, ExamSession } from './types';
import SetupExam from './components/SetupExam';
import ExamView from './components/ExamView';
import ExamResults from './components/ExamResults';
import SavedQuestionsView from './components/SavedQuestionsView';
import { parseMarkdownQuestions, shuffleArray } from './services/parser';
import { storage } from './services/storage';
import { markdownContent } from './data/examData';

const App: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [mode, setMode] = useState<AppMode>(AppMode.SETUP);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Session State
  const [activeSession, setActiveSession] = useState<ExamSession | null>(null);

  // Persisted Saved Questions
  const [savedQuestions, setSavedQuestions] = useState<Question[]>([]);

  // Initialization: Load questions, init storage, and hydrate state
  useEffect(() => {
    try {
      // 1. Parse static content
      const parsed = parseMarkdownQuestions(markdownContent);
      setQuestions(parsed);
      
      // 2. Initialize persistence layer
      storage.init();
      
      // 3. Hydrate saved questions (map IDs back to objects)
      const savedIds = storage.getSavedQuestionIds();
      const hydratedSaved = parsed.filter(q => savedIds.includes(q.uniqueId));
      setSavedQuestions(hydratedSaved);

      // 4. Hydrate active session
      const restoredSession = storage.loadSession(parsed);
      if (restoredSession) {
          setActiveSession(restoredSession);
          // Restore correct mode based on session status
          if (restoredSession.status === 'ACTIVE') {
            setMode(AppMode.EXAM);
          } else if (restoredSession.status === 'COMPLETED') {
            setMode(AppMode.RESULTS);
          }
      }
      
      setIsLoaded(true);
    } catch (e) {
      console.error("Failed to initialize app", e);
      setIsLoaded(true);
    }
  }, []);

  // Persist active session whenever it changes
  useEffect(() => {
    if (isLoaded) {
      storage.saveSession(activeSession, questions);
    }
  }, [activeSession, questions, isLoaded]);

  const handleStartExam = (config: ExamConfig) => {
    // 1. Filter by range
    const filtered = questions.filter(
      q => q.id >= config.startRange && q.id <= config.endRange
    );
    // 2. Shuffle questions
    const shuffled = shuffleArray(filtered);
    // 3. Slice to count
    const selected = shuffled.slice(0, config.questionCount);

    // 4. Shuffle answers for each question
    const questionsWithShuffledAnswers = selected.map(q => ({
      ...q,
      answers: shuffleArray(q.answers)
    }));

    const newSession: ExamSession = {
      questions: questionsWithShuffledAnswers,
      currentIndex: 0,
      config: config,
      userAnswers: {},
      status: 'ACTIVE'
    };

    setActiveSession(newSession);
    setMode(AppMode.EXAM);
  };

  const handleEndSession = () => {
    setActiveSession(current => {
      if (current) {
        return { ...current, status: 'COMPLETED' };
      }
      return null;
    });
    setMode(AppMode.RESULTS);
  };

  const handleFinishExam = () => {
    setActiveSession(current => {
      if (current) {
        return { ...current, status: 'COMPLETED' };
      }
      return null;
    });
    setMode(AppMode.RESULTS);
  };

  const handleResetToSetup = () => {
    if (activeSession && activeSession.status === 'ACTIVE') {
      if (window.confirm("You have an exam in progress. Going to the dashboard will end your session. Continue?")) {
        setActiveSession(null);
        setMode(AppMode.SETUP);
      }
    } else {
      setActiveSession(null);
      setMode(AppMode.SETUP);
    }
  };

  const handleClearSession = () => {
      setActiveSession(null);
      setMode(AppMode.SETUP);
  };

  const handleToggleSave = (question: Question) => {
    setSavedQuestions(prev => {
      let newState: Question[];
      const exists = prev.find(q => q.uniqueId === question.uniqueId);
      
      if (exists) {
        newState = prev.filter(q => q.uniqueId !== question.uniqueId);
      } else {
        newState = [...prev, question];
      }
      
      // Persist IDs immediately
      storage.setSavedQuestionIds(newState.map(q => q.uniqueId));
      return newState;
    });
  };

  const getSavedIds = () => savedQuestions.map(q => q.uniqueId);

  // Wrapper to update session and implicitly persist it via useEffect
  const handleUpdateSession = (session: ExamSession) => {
    setActiveSession(session);
  };

  const renderContent = () => {
    if (!isLoaded || questions.length === 0) {
      return <div className="p-10 text-center text-gray-500">Loading questions and history...</div>;
    }

    switch (mode) {
      case AppMode.SETUP:
        if (activeSession && activeSession.status === 'ACTIVE') {
           return (
             <div className="max-w-md mx-auto mt-10">
               <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8 text-center">
                 <h3 className="text-lg font-medium text-indigo-900">Session in Progress</h3>
                 <p className="text-indigo-700 mt-2 mb-4">You have an exam session active at Question {activeSession.currentIndex + 1}.</p>
                 <button 
                   onClick={() => setMode(AppMode.EXAM)}
                   className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors w-full sm:w-auto"
                 >
                   Resume Session
                 </button>
               </div>
               <div className="relative">
                  <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-slate-50 text-sm text-gray-500">or start new</span>
                  </div>
               </div>
               <SetupExam 
                questions={questions}
                onStart={(config) => {
                   if(window.confirm("Starting a new exam will discard your current session. Continue?")) {
                      handleStartExam(config);
                   }
                }}
                onCancel={() => {}} 
              />
             </div>
           );
        }
        return (
          <SetupExam 
            questions={questions}
            onStart={handleStartExam}
            onCancel={() => {}} 
          />
        );
      
      case AppMode.EXAM:
        if (!activeSession || activeSession.status === 'COMPLETED') {
          if (activeSession?.status === 'COMPLETED') setMode(AppMode.RESULTS);
          else setMode(AppMode.SETUP);
          return null;
        }
        return (
          <ExamView
            session={activeSession}
            savedQuestionIds={getSavedIds()}
            onToggleSave={handleToggleSave}
            onUpdateSession={handleUpdateSession}
            onExit={handleEndSession}
            onFinish={handleFinishExam}
          />
        );
      
      case AppMode.RESULTS:
        if (!activeSession) {
            setMode(AppMode.SETUP);
            return null;
        }
        return (
            <ExamResults 
                session={activeSession}
                savedQuestionIds={getSavedIds()}
                onToggleSave={handleToggleSave}
                onRestart={handleClearSession}
            />
        );

      case AppMode.SAVED:
        return (
          <SavedQuestionsView
            savedQuestions={savedQuestions}
            onToggleSave={handleToggleSave}
            onBack={() => {
              if (activeSession) {
                  if (activeSession.status === 'COMPLETED') setMode(AppMode.RESULTS);
                  else setMode(AppMode.EXAM);
              }
              else setMode(AppMode.SETUP);
            }}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 h-16 flex justify-between items-center gap-2">
          <div 
            className="flex items-center cursor-pointer min-w-0 flex-shrink-0" 
            onClick={handleResetToSetup}
          >
            <div className="bg-indigo-600 rounded-lg p-1.5 sm:mr-2 mr-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
            </div>
            <h1 className="text-base sm:text-xl font-bold text-gray-900 tracking-tight">ExamPrep</h1>
          </div>

          <nav className="flex items-center gap-1.5 sm:gap-2 md:gap-4 flex-shrink min-w-0">
            {activeSession && activeSession.status === 'ACTIVE' && mode === AppMode.EXAM && (
               <button
                 type="button"
                 onClick={handleEndSession}
                 className="cursor-pointer px-2 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-semibold text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 whitespace-nowrap"
               >
                 <span className="hidden sm:inline">End Session</span>
                 <span className="sm:hidden">End</span>
               </button>
            )}
            
            <button
               type="button"
               onClick={handleResetToSetup}
               className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${mode === AppMode.EXAM || mode === AppMode.SETUP || mode === AppMode.RESULTS ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-900'}`}
             >
               <span className="hidden sm:inline">{activeSession && activeSession.status === 'ACTIVE' ? 'Exam' : 'New Exam'}</span>
               <span className="sm:hidden">Exam</span>
             </button>

            <button
              type="button"
              onClick={() => setMode(AppMode.SAVED)}
              className={`flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${mode === AppMode.SAVED ? 'text-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:mr-1.5" fill={mode === AppMode.SAVED ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="hidden sm:inline">Saved</span>
              <span className="ml-1 text-xs bg-gray-200 px-1.5 py-0.5 rounded-full">{savedQuestions.length}</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;