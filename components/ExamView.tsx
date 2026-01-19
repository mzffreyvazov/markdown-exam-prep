import React from 'react';
import { Question, ExamSession } from '../types';
import QuestionCard from './QuestionCard';

interface ExamViewProps {
  session: ExamSession;
  savedQuestionIds: string[];
  onToggleSave: (q: Question) => void;
  onUpdateSession: (session: ExamSession) => void;
  onExit: () => void; // Used for early exit (End Session button)
  onFinish: () => void; // Used for natural completion
}

const ExamView: React.FC<ExamViewProps> = ({ 
  session,
  savedQuestionIds, 
  onToggleSave,
  onUpdateSession,
  onExit,
  onFinish
}) => {
  const { questions, currentIndex, userAnswers } = session;

  const handleNext = (selectedAnswerIndex: number | null) => {
    const currentQ = questions[currentIndex];
    
    // Update answers record
    const updatedAnswers = { ...userAnswers };
    if (selectedAnswerIndex !== null) {
      updatedAnswers[currentQ.uniqueId] = selectedAnswerIndex;
    }

    if (currentIndex < questions.length - 1) {
      onUpdateSession({
        ...session,
        userAnswers: updatedAnswers,
        currentIndex: currentIndex + 1
      });
    } else {
      // Last question finished
      onUpdateSession({
        ...session,
        userAnswers: updatedAnswers
      });
      onFinish();
    }
  };

  if (questions.length === 0) {
    return (
      <div className="text-center p-10">
        <p className="text-xl text-gray-600 mb-4">No questions found in this session.</p>
        <button onClick={onExit} className="text-indigo-600 underline">End Exam</button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isSaved = savedQuestionIds.includes(currentQuestion.uniqueId);
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-4xl mx-auto w-full pb-10">
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div>
           <h2 className="text-xl md:text-2xl font-bold text-gray-800">
             Question {currentIndex + 1} <span className="text-gray-400 text-base md:text-lg font-normal">/ {questions.length}</span>
           </h2>
        </div>
        <div className="w-full sm:w-48">
          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-right text-gray-500 mt-1">{Math.round(progress)}% Complete</p>
        </div>
      </div>

      <QuestionCard 
        question={currentQuestion}
        isSaved={isSaved}
        onSaveToggle={onToggleSave}
        onNext={handleNext}
        showNextButton={true}
        displayNumber={currentIndex + 1}
      />
    </div>
  );
};

export default ExamView;