import React, { useState } from 'react';
import { AppMode, Flashcard } from '../types';
import { generateFlashcards } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import './Flashcard.css';
import FileExportIcon from './icons/FileExportIcon';

interface FlashcardsGeneratorProps {
  mode: AppMode;
  text: string;
  setText: (text: string) => void;
  flashcards: Flashcard[];
  setFlashcards: (flashcards: Flashcard[]) => void;
  onExportPdf: () => void;
  canExport: boolean;
}

const FlashcardsGenerator: React.FC<FlashcardsGeneratorProps> = ({ mode, text, setText, flashcards, setFlashcards, onExportPdf, canExport }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flippedStates, setFlippedStates] = useState<boolean[]>([]);

  const handleGenerateFlashcards = async () => {
    if (!text.trim()) {
      setError('Please provide some text to generate flashcards from.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setFlashcards([]);
    setFlippedStates([]);

    try {
      if (mode === AppMode.Cloud) {
        const result = await generateFlashcards(text);
        setFlashcards(result);
        setFlippedStates(new Array(result.length).fill(false));
      } else {
        // Offline simulation
        await new Promise(resolve => setTimeout(resolve, 500));
        const offlineFlashcards: Flashcard[] = [
          { term: "React (Offline Demo)", definition: "A JavaScript library for building user interfaces." },
          { term: "Component", definition: "A reusable, self-contained piece of UI." },
          { term: "State", definition: "An object that represents the parts of the app that can change." },
        ];
        setFlashcards(offlineFlashcards);
        setFlippedStates(new Array(offlineFlashcards.length).fill(false));
      }
    } catch (e) {
      setError('Failed to generate flashcards. The model might have returned an unexpected format.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFlip = (index: number) => {
    setFlippedStates(prev => {
      const newFlipped = [...prev];
      newFlipped[index] = !newFlipped[index];
      return newFlipped;
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-100 mb-4">Flashcard Generator</h2>
      <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
        Automatically identify key terms in your text and generate interactive flashcards to help you study.
      </p>
      <div className="flex flex-col gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste your text here, or switch to the Summarizer to upload a file..."
          className="w-full h-48 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-slate-700 dark:text-gray-300 resize-none"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerateFlashcards}
          disabled={isLoading || !text.trim()}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
        >
          {isLoading ? (
            'Generating...'
          ) : (
             <>
              {mode === AppMode.Cloud && <SparklesIcon className="h-5 w-5 mr-2" />}
              Generate Flashcards
            </>
          )}
        </button>
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
        {flashcards.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700 mb-4">
                <h3 className="font-semibold text-slate-800 dark:text-gray-200">Generated Flashcards:</h3>
                 <button
                    onClick={onExportPdf}
                    disabled={!canExport}
                    className="flex items-center space-x-1.5 px-2 py-1 text-xs font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-200 hover:bg-slate-300/50 dark:bg-slate-800 dark:hover:bg-slate-700/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Export content to PDF"
                >
                    <FileExportIcon className="h-3.5 w-3.5" />
                    <span>Export PDF</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {flashcards.map((card, index) => (
                <div key={index} className="flashcard-container" onClick={() => handleFlip(index)}>
                  <div className={`flashcard ${flippedStates[index] ? 'is-flipped' : ''}`}>
                    <div className="flashcard-face flashcard-front">
                      <p className="text-lg font-bold text-slate-800 dark:text-gray-100">{card.term}</p>
                    </div>
                    <div className="flashcard-face flashcard-back">
                      <p className="text-sm text-slate-600 dark:text-gray-300">{card.definition}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardsGenerator;