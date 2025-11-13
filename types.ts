export enum AppMode {
  Offline = 'Offline',
  Cloud = 'Cloud',
}

export enum Feature {
  Summarizer = 'Summarizer',
  MCQGenerator = 'MCQ Generator',
  Explainer = 'Explainer',
  Flashcards = 'Flashcards',
}

export interface MCQ {
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Flashcard {
  term: string;
  definition: string;
}
