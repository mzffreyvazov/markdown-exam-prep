import { ExamSession, Question } from '../types';

const STORAGE_KEY = 'markdownExam_userData';
const USER_ID_KEY = 'markdownExam_userId';

interface StoredQuestionRef {
  uniqueId: string;
  // Maps the current (shuffled) index to the original question's answer index
  // e.g. [2, 0, 1] means the first answer displayed is the 3rd answer in original
  answerPermutation: number[]; 
}

interface SerializedSession {
  questions: StoredQuestionRef[];
  currentIndex: number;
  config: any;
  userAnswers: Record<string, number>; // index in the SHUFFLED array
  status: 'ACTIVE' | 'COMPLETED';
}

interface UserData {
  userId: string;
  savedQuestionIds: string[];
  activeSession: SerializedSession | null;
}

const generateUserId = () => 'user_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

export const storage = {
  // Initialize storage if needed
  init: () => {
    if (!localStorage.getItem(USER_ID_KEY)) {
      localStorage.setItem(USER_ID_KEY, generateUserId());
    }
    if (!localStorage.getItem(STORAGE_KEY)) {
      const initial: UserData = {
        userId: localStorage.getItem(USER_ID_KEY)!,
        savedQuestionIds: [],
        activeSession: null
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    }
  },

  getUserId: () => localStorage.getItem(USER_ID_KEY),

  // Get only the IDs of saved questions
  getSavedQuestionIds: (): string[] => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return data.savedQuestionIds || [];
    } catch (e) {
      console.error("Failed to load saved question IDs", e);
      return [];
    }
  },

  // Save the list of IDs
  setSavedQuestionIds: (ids: string[]) => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      data.savedQuestionIds = ids;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save question IDs", e);
    }
  },

  // Save the current session state by serializing references
  saveSession: (session: ExamSession | null, allOriginalQuestions: Question[]) => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      
      if (!session) {
        data.activeSession = null;
      } else {
        // Serialize questions to references and answer permutations
        const serializedQuestions: StoredQuestionRef[] = session.questions.map(q => {
          const original = allOriginalQuestions.find(oq => oq.uniqueId === q.uniqueId);
          // If we can't find the original (e.g. content changed), we can't reliably map, return empty permutation
          if (!original) return { uniqueId: q.uniqueId, answerPermutation: [] };

          // Map shuffled answers back to original indices
          const permutation = q.answers.map(a => {
              return original.answers.findIndex(oa => oa.text === a.text);
          });

          return {
            uniqueId: q.uniqueId,
            answerPermutation: permutation
          };
        });

        const serialized: SerializedSession = {
          questions: serializedQuestions,
          currentIndex: session.currentIndex,
          config: session.config,
          userAnswers: session.userAnswers,
          status: session.status
        };
        data.activeSession = serialized;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.error("Failed to save session", e);
    }
  },

  // Reconstruct session from storage
  loadSession: (allOriginalQuestions: Question[]): ExamSession | null => {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const sSession = data.activeSession as SerializedSession;

      if (!sSession) return null;

      // Rehydrate questions
      const questions: Question[] = sSession.questions.map(ref => {
        const original = allOriginalQuestions.find(q => q.uniqueId === ref.uniqueId);
        if (!original) return null;

        // Reconstruct shuffled answers using the stored permutation
        // If permutation is missing or length mismatch (content changed), fallback to original order
        let finalAnswers = original.answers;
        if (ref.answerPermutation && ref.answerPermutation.length === original.answers.length) {
            const shuffled = ref.answerPermutation.map(index => original.answers[index]);
            if (shuffled.every(Boolean)) {
                finalAnswers = shuffled;
            }
        }

        return {
          ...original,
          answers: finalAnswers
        };
      }).filter(Boolean) as Question[];

      if (questions.length === 0) return null;

      return {
        questions,
        currentIndex: sSession.currentIndex,
        config: sSession.config,
        userAnswers: sSession.userAnswers,
        status: sSession.status
      };
    } catch (e) {
      console.error("Failed to load session", e);
      return null;
    }
  }
};