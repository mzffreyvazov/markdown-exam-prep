import React, { useState } from 'react';
import { Question } from '../types';
import QuestionCard from './QuestionCard';

interface SavedQuestionsViewProps {
  savedQuestions: Question[];
  onToggleSave: (q: Question) => void;
  onBack: () => void;
  onClearAll: () => void;
}

const SavedQuestionsView: React.FC<SavedQuestionsViewProps> = ({ 
  savedQuestions, 
  onToggleSave, 
  onBack,
  onClearAll
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'practice'>('list');
  const [practiceIndex, setPracticeIndex] = useState(0);

  const handleNext = () => {
    if (practiceIndex < savedQuestions.length - 1) {
      setPracticeIndex(prev => prev + 1);
    } else {
      setViewMode('list'); // Finish practice
    }
  };

  const handleExportPDF = () => {
    if (savedQuestions.length === 0) return;

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to export PDF.");
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Saved Questions Export</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; max-width: 800px; mx-auto; }
          h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
          .meta { color: #6b7280; font-size: 0.9em; margin-bottom: 30px; }
          .question-item { margin-bottom: 30px; page-break-inside: avoid; border-bottom: 1px dashed #e5e7eb; padding-bottom: 20px; }
          .q-title { font-weight: bold; font-size: 1.1em; margin-bottom: 10px; display: flex; gap: 10px; }
          .q-id { color: #4f46e5; min-width: 30px; }
          .answers { margin-left: 40px; font-size: 0.95em; }
          .answer { margin-bottom: 5px; position: relative; padding-left: 20px; }
          .answer.correct { color: #047857; font-weight: bold; }
          .answer.correct::before { content: '✓'; position: absolute; left: 0; color: #047857; font-weight: bold; }
          .answer.wrong { color: #555; }
          .answer::before { content: '○'; position: absolute; left: 0; color: #9ca3af; }
          .answer.correct::before { content: '●'; color: #047857; }
        </style>
      </head>
      <body>
        <h1>Saved Questions</h1>
        <div class="meta">Exported on ${new Date().toLocaleDateString()} &bull; ${savedQuestions.length} Questions</div>
        
        ${savedQuestions.map(q => `
          <div class="question-item">
            <div class="q-title">
              <span class="q-id">#${q.id}</span>
              <span>${q.text}</span>
            </div>
            <div class="answers">
              ${q.answers.map(a => `
                <div class="answer ${a.isCorrect ? 'correct' : 'wrong'}">
                  ${a.text}
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}

        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (savedQuestions.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900">No saved questions yet</h3>
        <p className="text-gray-500 mt-1">Bookmark questions during an exam to see them here.</p>
        <button onClick={onBack} className="mt-6 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h2 className="text-2xl font-bold text-gray-800">Saved Questions <span className="text-gray-400 font-normal">({savedQuestions.length})</span></h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onClearAll}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors shadow-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete All
          </button>
          
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export to PDF
          </button>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              List
            </button>
            <button
              onClick={() => { setPracticeIndex(0); setViewMode('practice'); }}
              className={`px-3 sm:px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'practice' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Practice
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid gap-4">
          {savedQuestions.map((q) => (
            <div key={q.uniqueId} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
               <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-600 mb-2">Question #{q.id}</span>
                    <p className="font-medium text-lg text-gray-900">{q.text}</p>
                    <p className="text-sm text-gray-500 mt-2">{q.answers.length} options</p>
                  </div>
                  <button 
                    onClick={() => onToggleSave(q)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                    title="Remove from saved"
                  >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                  </button>
               </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
           <div className="mb-4 text-center text-sm text-gray-500">
             Saved Question {practiceIndex + 1} of {savedQuestions.length}
           </div>
           <QuestionCard
             question={savedQuestions[practiceIndex]}
             isSaved={true}
             onSaveToggle={onToggleSave}
             onNext={handleNext}
             showNextButton={true}
           />
        </div>
      )}
    </div>
  );
};

export default SavedQuestionsView;