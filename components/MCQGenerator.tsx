import React, { useState } from 'react';
import { AppMode, MCQ } from '../types';
import { generateMCQs } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import FileExportIcon from './icons/FileExportIcon';

interface MCQGeneratorProps {
  mode: AppMode;
  text: string;
  setText: (text: string) => void;
  mcqs: MCQ[];
  setMcqs: (mcqs: MCQ[]) => void;
  onExportPdf: () => void;
  canExport: boolean;
}

const MCQGenerator: React.FC<MCQGeneratorProps> = ({ mode, text, setText, mcqs, setMcqs, onExportPdf, canExport }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnswers, setShowAnswers] = useState<boolean[]>([]);

  const handleGenerateMCQs = async () => {
    if (!text.trim()) {
      setError('Please enter some text to generate questions from.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setMcqs([]);
    setShowAnswers([]);

    try {
      if (mode === AppMode.Cloud) {
        const result = await generateMCQs(text);
        setMcqs(result);
        setShowAnswers(new Array(result.length).fill(false));
      } else {
        // Offline simulation
        await new Promise(resolve => setTimeout(resolve, 500));
        const offlineMcqs: MCQ[] = [
          {
            question: "What is the capital of France? (Offline Demo)",
            options: ["Berlin", "Madrid", "Paris", "Rome"],
            correctAnswer: "Paris"
          },
          {
            question: "This is a sample offline question.",
            options: ["Option A", "Option B", "Correct", "Option D"],
            correctAnswer: "Correct"
          }
        ];
        setMcqs(offlineMcqs);
        setShowAnswers(new Array(offlineMcqs.length).fill(false));
      }
    } catch (e) {
      setError('Failed to generate MCQs. The model might have returned an unexpected format.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleAnswer = (index: number) => {
    setShowAnswers(prev => {
        const newAnswers = [...prev];
        newAnswers[index] = !newAnswers[index];
        return newAnswers;
    });
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-100 mb-4">MCQ Generator</h2>
      <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
        Provide context from your study material, and the assistant will create multiple-choice questions to test your knowledge.
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
          onClick={handleGenerateMCQs}
          disabled={isLoading || !text.trim()}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
        >
          {isLoading ? (
            'Generating...'
          ) : (
             <>
              {mode === AppMode.Cloud && <SparklesIcon className="h-5 w-5 mr-2" />}
              Generate MCQs
            </>
          )}
        </button>
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
        {mcqs.length > 0 && (
          <div className="mt-4 space-y-4">
             <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-800 dark:text-gray-200">Generated Questions:</h3>
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
            {mcqs.map((mcq, index) => (
              <div key={index} className="p-4 bg-slate-100 dark:bg-slate-900/70 rounded-md border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-gray-200 mb-3">{index + 1}. {mcq.question}</p>
                <ul className="space-y-2">
                  {mcq.options.map((option, i) => (
                    <li key={i} className="text-slate-700 dark:text-gray-300">{String.fromCharCode(65 + i)}. {option}</li>
                  ))}
                </ul>
                <button onClick={() => toggleAnswer(index)} className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 mt-3">
                  {showAnswers[index] ? 'Hide' : 'Show'} Answer
                </button>
                {showAnswers[index] && (
                    <p className="mt-2 text-sm bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 p-2 rounded-md">Correct Answer: {mcq.correctAnswer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MCQGenerator;