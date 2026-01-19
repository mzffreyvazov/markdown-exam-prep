import { Question, Answer } from '../types';

export const parseMarkdownQuestions = (content: string): Question[] => {
  const lines = content.split('\n');
  const questions: Question[] = [];
  
  let currentQuestion: Question | null = null;
  
  // Regex to match "1. Some question text"
  const questionRegex = /^(\d+)\.\s+(.+)/;
  // Regex to match "- [ ] Answer" or "- [x] Answer"
  const answerRegex = /^-\s+\[(x|X| )\]\s+(.+)/;

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;

    const questionMatch = trimmedLine.match(questionRegex);
    const answerMatch = trimmedLine.match(answerRegex);

    if (questionMatch) {
      // If we have a previous question processing, push it
      if (currentQuestion) {
        questions.push(currentQuestion);
      }
      
      const id = parseInt(questionMatch[1], 10);
      const text = questionMatch[2].trim();
      
      currentQuestion = {
        id,
        text,
        answers: [],
        uniqueId: `${id}-${text.substring(0, 15)}`
      };
    } else if (answerMatch && currentQuestion) {
      const isCorrect = answerMatch[1].toLowerCase() === 'x';
      const text = answerMatch[2].trim();
      
      const answer: Answer = {
        text,
        isCorrect
      };
      
      currentQuestion.answers.push(answer);
    }
  });

  // Push the last question
  if (currentQuestion) {
    questions.push(currentQuestion);
  }

  return questions;
};

// Fisher-Yates shuffle
export const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};