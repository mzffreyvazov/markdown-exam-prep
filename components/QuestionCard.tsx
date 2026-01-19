import React, { useState, useEffect } from 'react';
import { Question } from '../types';

interface QuestionCardProps {
  question: Question;
  isSaved: boolean;
  onSaveToggle: (question: Question) => void;
  onNext?: (selectedAnswerIndex: number | null) => void;
  showNextButton?: boolean;
  displayNumber?: number;
  readOnly?: boolean; // For results view
  userSelectedAnswerIndex?: number; // For results view
}

const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  isSaved, 
  onSaveToggle, 
  onNext,
  showNextButton = true,
  displayNumber,
  readOnly = false,
  userSelectedAnswerIndex
}) => {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // Initialize state based on props (reset for new question, or set for readOnly)
  useEffect(() => {
    if (readOnly) {
      setIsAnswered(true);
      // In readOnly mode, we don't necessarily need to set selectedAnswerIndex 
      // because we rely on userSelectedAnswerIndex prop for rendering
    } else {
      setSelectedAnswerIndex(null);
      setIsAnswered(false);
    }
  }, [question, readOnly]);

  const handleAnswerClick = (index: number) => {
    if (isAnswered || readOnly) return;
    setSelectedAnswerIndex(index);
    setIsAnswered(true);
  };

  const handleShowAnswer = () => {
    if (isAnswered || readOnly) return;
    setIsAnswered(true);
  };

  const handleNextClick = () => {
    if (onNext) {
      onNext(selectedAnswerIndex);
    }
  };

  return (
    <div className={`bg-white rounded-xl md:rounded-2xl shadow-sm border p-4 sm:p-6 md:p-8 max-w-3xl mx-auto ${readOnly ? 'border-red-100' : 'border-gray-200'}`}>
      <div className="flex justify-between items-start mb-4 md:mb-6 gap-3 md:gap-4">
        <div className="flex items-start space-x-3 md:space-x-4">
          <span className={`flex-shrink-0 inline-flex items-center justify-center h-8 w-8 md:h-10 md:w-10 rounded-full font-bold text-sm md:text-base mt-0.5 ${readOnly ? 'bg-red-100 text-red-700' : 'bg-indigo-100 text-indigo-700'}`}>
            {displayNumber ?? question.id}
          </span>
          <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-snug pt-0.5 md:pt-1 break-words">
            {question.text}
          </h3>
        </div>
        <button
          onClick={() => onSaveToggle(question)}
          className={`flex-shrink-0 p-2 rounded-full transition-colors mt-0.5 md:mt-1 ${
            isSaved ? 'text-red-500 bg-red-50 hover:bg-red-100' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
          }`}
          title={isSaved ? "Unsave question" : "Save for later"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6" fill={isSaved ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 md:space-y-3">
        {question.answers.map((answer, index) => {
          let optionClass = "border-gray-200 hover:border-gray-300 hover:bg-gray-50";
          let icon = null;

          // Determine styling based on state (Exam mode vs Result mode)
          if (readOnly) {
            // Result Mode Logic
            if (answer.isCorrect) {
              // Always highlight correct answer in Green
              optionClass = "border-green-500 bg-green-50 text-green-900";
              icon = <CheckIcon color="text-green-600" />;
            } else if (userSelectedAnswerIndex === index) {
              // Highlight user's wrong selection in Red
              optionClass = "border-red-500 bg-red-50 text-red-900";
              icon = <XIcon color="text-red-600" />;
            } else {
              // Neutral for other wrong answers
              optionClass = "border-gray-100 opacity-50";
            }
          } else {
            // Exam Mode Logic
            if (isAnswered) {
              if (answer.isCorrect) {
                optionClass = "border-green-500 bg-green-50 text-green-800";
                icon = <CheckIcon color="text-green-500" />;
              } else if (selectedAnswerIndex === index) {
                optionClass = "border-red-500 bg-red-50 text-red-800";
                icon = <XIcon color="text-red-500" />;
              } else {
                optionClass = "border-gray-200 opacity-60";
              }
            } else if (selectedAnswerIndex === index) {
               optionClass = "border-indigo-500 bg-indigo-50 text-indigo-800";
            }
          }

          return (
            <button
              key={index}
              onClick={() => handleAnswerClick(index)}
              disabled={isAnswered || readOnly}
              className={`w-full text-left p-3 md:p-4 rounded-lg md:rounded-xl border-2 transition-all duration-200 flex items-center justify-between group ${optionClass}`}
            >
              <span className="text-sm md:text-base leading-normal break-words">{answer.text}</span>
              {icon}
            </button>
          );
        })}
      </div>

      {!readOnly && (
        <div className="flex justify-end mt-6 md:mt-8">
          {!isAnswered ? (
            <button
              onClick={handleShowAnswer}
              className="text-indigo-600 hover:text-indigo-800 font-medium px-4 py-2 hover:bg-indigo-50 rounded-lg transition-colors text-sm md:text-base"
            >
              Show Answer
            </button>
          ) : (
            showNextButton && onNext && (
              <div className="animate-fade-in w-full md:w-auto">
                <button
                  onClick={handleNextClick}
                  className="w-full md:w-auto flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg font-medium text-sm md:text-base"
                >
                  <span>Next Question</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

const CheckIcon = ({ color }: { color: string }) => (
  <svg className={`h-5 w-5 ${color} flex-shrink-0 ml-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ color }: { color: string }) => (
  <svg className={`h-5 w-5 ${color} flex-shrink-0 ml-2`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default QuestionCard;