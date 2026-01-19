export interface Answer {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: number; // The number parsed from "1. Question text"
  text: string;
  answers: Answer[];
  uniqueId: string; // A unique identifier (e.g., hash of text) to avoid collision in saved list
}

export interface ExamConfig {
  startRange: number;
  endRange: number;
  questionCount: number;
}

export interface ExamSession {
  questions: Question[];
  currentIndex: number;
  config: ExamConfig;
  userAnswers: Record<string, number>; // Maps uniqueId to answer index
  status: 'ACTIVE' | 'COMPLETED';
}

export enum AppMode {
  SETUP = 'SETUP',
  EXAM = 'EXAM',
  SAVED = 'SAVED',
  RESULTS = 'RESULTS',
}