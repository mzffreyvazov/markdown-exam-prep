import React from 'react';
import { ExamSession, Question } from '../types';
import QuestionCard from './QuestionCard';

interface ExamResultsProps {
  session: ExamSession;
  savedQuestionIds: string[];
  onToggleSave: (q: Question) => void;
  onRestart: () => void;
}

const ExamResults: React.FC<ExamResultsProps> = ({ 
  session, 
  savedQuestionIds, 
  onToggleSave, 
  onRestart 
}) => {
  const { questions, userAnswers } = session;

  // Filter to find questions that have actually been answered
  const answeredQuestions = questions.filter(q => userAnswers[q.uniqueId] !== undefined);

  // From the answered questions, filter those that are incorrect
  const wrongQuestions = answeredQuestions.filter(q => {
    const userAnswerIndex = userAnswers[q.uniqueId];
    const selectedAnswer = q.answers[userAnswerIndex];
    return !selectedAnswer || !selectedAnswer.isCorrect;
  });

  const correctCount = answeredQuestions.length - wrongQuestions.length;
  const skippedCount = questions.length - answeredQuestions.length;
  
  // Calculate score based on accuracy of attempted questions
  const score = answeredQuestions.length > 0 
    ? Math.round((correctCount / answeredQuestions.length) * 100) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto w-full pb-20">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Complete</h2>
        <p className="text-gray-500 text-sm mb-6">
          You answered {answeredQuestions.length} out of {questions.length} questions.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x divide-gray-200 my-6">
          <div className="text-center p-2">
             <div className="text-3xl md:text-4xl font-bold text-indigo-600">{score}%</div>
             <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wide font-semibold mt-1">Accuracy</div>
          </div>
          <div className="text-center p-2">
             <div className="text-3xl md:text-4xl font-bold text-green-600">{correctCount}</div>
             <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wide font-semibold mt-1">Correct</div>
          </div>
          <div className="text-center p-2">
             <div className="text-3xl md:text-4xl font-bold text-red-600">{wrongQuestions.length}</div>
             <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wide font-semibold mt-1">Wrong</div>
          </div>
          <div className="text-center p-2">
             <div className="text-3xl md:text-4xl font-bold text-gray-400">{skippedCount}</div>
             <div className="text-xs md:text-sm text-gray-500 uppercase tracking-wide font-semibold mt-1">Skipped</div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm w-full md:w-auto"
        >
          Start New Exam
        </button>
      </div>

      {answeredQuestions.length === 0 ? (
        <div className="text-center p-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
           <p className="text-gray-500">You ended the session without answering any questions.</p>
        </div>
      ) : wrongQuestions.length > 0 ? (
        <div className="space-y-8">
          <h3 className="text-xl font-bold text-gray-800 border-b pb-4">
            Review Incorrect Answers ({wrongQuestions.length})
          </h3>
          {wrongQuestions.map((q) => (
            <QuestionCard
              key={q.uniqueId}
              question={q}
              isSaved={savedQuestionIds.includes(q.uniqueId)}
              onSaveToggle={onToggleSave}
              readOnly={true}
              userSelectedAnswerIndex={userAnswers[q.uniqueId]}
              displayNumber={q.id} // Show original ID so user can find it later
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-10 bg-green-50 rounded-xl border border-green-100">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-bold text-green-800">Great Job!</h3>
            <p className="text-green-700 mt-2">You answered all attempted questions correctly.</p>
        </div>
      )}
    </div>
  );
};

export default ExamResults;