import React, { ChangeEvent, useState } from 'react';
import { parseMarkdownQuestions } from '../services/parser';
import { Question } from '../types';

interface FileUploadProps {
  onUpload: (questions: Question[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onUpload }) => {
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [textInput, setTextInput] = useState('');

  const processContent = (content: string) => {
    try {
      const parsed = parseMarkdownQuestions(content);
      if (parsed.length === 0) {
        setError("No valid questions found. Please check the format.");
      } else {
        setError(null);
        onUpload(parsed);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to parse content.");
    }
  };

  const handleFile = (file: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        processContent(content);
      }
    };
    reader.readAsText(file);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      setError("Please paste some text first.");
      return;
    }
    processContent(textInput);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 max-w-xl mx-auto w-full">
      <div 
        className={`w-full h-48 border-4 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors cursor-pointer bg-white
          ${isDragOver ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('fileInput')?.click()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="text-gray-600 font-medium text-lg">Upload File</p>
        <p className="text-gray-400 text-sm mt-1">.md or .txt</p>
        <input 
          id="fileInput" 
          type="file" 
          accept=".md,.txt" 
          className="hidden" 
          onChange={handleInputChange}
        />
      </div>

      <div className="flex items-center w-full my-6">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-3 text-gray-400 text-sm font-medium uppercase tracking-wider">OR</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-gray-700 mb-2">Paste Text Directly</label>
        <textarea
          className="w-full h-40 p-3 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-mono shadow-sm resize-none"
          placeholder={`1. Question text here?
- [ ] Answer A
- [x] Answer B`}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
        />
        <button
          onClick={handleTextSubmit}
          className="mt-3 w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-sm active:transform active:scale-[0.98]"
        >
          Load Questions
        </button>
      </div>
      
      {error && (
        <div className="mt-6 p-3 bg-red-100 text-red-700 rounded-lg w-full text-center border border-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="mt-8 text-left w-full bg-blue-50 p-4 rounded-lg border border-blue-100">
        <h3 className="font-bold text-blue-800 mb-2 text-sm">Expected Format:</h3>
        <pre className="text-xs text-blue-900 overflow-x-auto whitespace-pre-wrap font-mono">
{`1. Question text here?
- [ ] Incorrect answer
- [ ] Another incorrect
- [x] Correct answer
2. Next question...`}
        </pre>
      </div>
    </div>
  );
};

export default FileUpload;