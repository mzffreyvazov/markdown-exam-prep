import React, { useState, useEffect } from 'react';
import { Question, ExamConfig } from '../types';

interface SetupExamProps {
  questions: Question[];
  onStart: (config: ExamConfig) => void;
  onCancel: () => void;
}

const SetupExam: React.FC<SetupExamProps> = ({ questions, onStart, onCancel }) => {
  const minId = questions.length > 0 ? questions[0].id : 1;
  const maxId = questions.length > 0 ? questions[questions.length - 1].id : 0;

  const [rangeStart, setRangeStart] = useState<number | ''>(minId);
  const [rangeEnd, setRangeEnd] = useState<number | ''>(maxId);
  const [count, setCount] = useState<number | ''>(50);

  // Calculate valid count based on range
  const numRangeStart = typeof rangeStart === 'number' ? rangeStart : minId;
  const numRangeEnd = typeof rangeEnd === 'number' ? rangeEnd : maxId;
  const validQuestionsInRange = questions.filter(q => q.id >= numRangeStart && q.id <= numRangeEnd).length;

  useEffect(() => {
    // Adjust count if it exceeds available questions in range
    const numCount = typeof count === 'number' ? count : 0;
    if (numCount > validQuestionsInRange && validQuestionsInRange > 0) {
      setCount(validQuestionsInRange);
    }
  }, [rangeStart, rangeEnd, validQuestionsInRange, count]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStart = typeof rangeStart === 'number' ? rangeStart : minId;
    const finalEnd = typeof rangeEnd === 'number' ? rangeEnd : maxId;
    const finalCount = typeof count === 'number' ? count : 1;
    onStart({
      startRange: finalStart,
      endRange: finalEnd,
      questionCount: Math.min(finalCount, validQuestionsInRange)
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white p-4 sm:p-8 rounded-xl shadow-lg border border-gray-100 mt-4 md:mt-10">
      <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6">Exam Configuration</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Question Range</label>
          <div className="flex items-center space-x-4">
            <input
              type="number"
              min={minId}
              max={numRangeEnd || maxId}
              value={rangeStart}
              onChange={(e) => {
                const val = e.target.value;
                setRangeStart(val === '' ? '' : Number(val));
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setRangeStart(minId);
                }
              }}
              placeholder={minId.toString()}
              className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
            <span className="text-gray-400 font-bold">-</span>
            <input
              type="number"
              min={numRangeStart || minId}
              max={maxId}
              value={rangeEnd}
              onChange={(e) => {
                const val = e.target.value;
                setRangeEnd(val === '' ? '' : Number(val));
              }}
              onBlur={(e) => {
                if (e.target.value === '') {
                  setRangeEnd(maxId);
                }
              }}
              placeholder={maxId.toString()}
              className="flex-1 px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
             <span>Start (Min: {minId})</span>
             <span>End (Max: {maxId})</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Number of Questions
          </label>
          <input
            type="number"
            min={1}
            max={validQuestionsInRange}
            value={count}
            onChange={(e) => {
              const val = e.target.value;
              setCount(val === '' ? '' : Number(val));
            }}
            onBlur={(e) => {
              if (e.target.value === '') {
                setCount(Math.min(50, validQuestionsInRange));
              }
            }}
            placeholder="50"
            className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1 px-1">
            <span>Available in range: {validQuestionsInRange}</span>
            <span>Default: 50</span>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm md:text-base"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={validQuestionsInRange === 0}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm md:text-base"
          >
            Start Exam
          </button>
        </div>
      </form>
    </div>
  );
};

export default SetupExam;