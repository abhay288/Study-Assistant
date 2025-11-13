import React, { useState, useMemo, useEffect } from 'react';
import { AppMode, Feature, MCQ, Flashcard } from './types';
import Header from './components/Header';
import Summarizer from './components/Summarizer';
import MCQGenerator from './components/MCQGenerator';
import Explainer from './components/Explainer';
import TrashIcon from './components/icons/TrashIcon';
import FileExportIcon from './components/icons/FileExportIcon';
import { exportToPdf } from './services/pdfService';
import FlashcardsGenerator from './components/FlashcardsGenerator';

const App: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedTheme = window.localStorage.getItem('theme');
      if (storedTheme) return storedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark'; // Default theme
  });

  const [mode, setMode] = useState<AppMode>(AppMode.Cloud);
  const [activeFeature, setActiveFeature] = useState<Feature>(Feature.Summarizer);
  
  // Lifted state
  const [sharedText, setSharedText] = useState('');
  const [summary, setSummary] = useState('');
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [sourceFileName, setSourceFileName] = useState('Pasted Text');

  const [clearCounter, setClearCounter] = useState(0);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const featureTabs = useMemo(() => [
    Feature.Summarizer,
    Feature.MCQGenerator,
    Feature.Explainer,
    Feature.Flashcards,
  ], []);

  const handleClearAll = () => {
    setSharedText('');
    setSummary('');
    setMcqs([]);
    setFlashcards([]);
    setSourceFileName('Pasted Text');
    setClearCounter(prev => prev + 1);
  };

  const handleExportPdf = () => {
    exportToPdf(sourceFileName, summary, mcqs, flashcards);
  };
  
  // Fix: Ensure canExport is always a boolean by converting the summary string to a boolean.
  const canExport = !!summary || mcqs.length > 0 || flashcards.length > 0;

  const renderActiveFeature = () => {
    // The key is crucial for resetting component state when it changes
    switch (activeFeature) {
      case Feature.Summarizer:
        return <Summarizer 
                  key={clearCounter} 
                  mode={mode} 
                  text={sharedText} 
                  setText={setSharedText} 
                  summary={summary}
                  setSummary={setSummary}
                  setSourceFileName={setSourceFileName}
                  onExportPdf={handleExportPdf}
                  canExport={canExport}
                />;
      case Feature.MCQGenerator:
        return <MCQGenerator 
                  key={clearCounter} 
                  mode={mode} 
                  text={sharedText} 
                  setText={setSharedText} 
                  mcqs={mcqs}
                  setMcqs={setMcqs}
                  onExportPdf={handleExportPdf}
                  canExport={canExport}
                />;
      case Feature.Explainer:
        return <Explainer key={clearCounter} mode={mode} contextText={sharedText} />;
      case Feature.Flashcards:
        return <FlashcardsGenerator 
                  key={clearCounter} 
                  mode={mode} 
                  text={sharedText} 
                  setText={setSharedText}
                  flashcards={flashcards}
                  setFlashcards={setFlashcards}
                  onExportPdf={handleExportPdf}
                  canExport={canExport}
                />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-gray-200 font-sans">
      <Header mode={mode} setMode={setMode} theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200 dark:border-slate-700">
            <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
              {featureTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFeature(tab)}
                  className={`${
                    activeFeature === tab
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-500'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm sm:text-base transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-t-md`}
                >
                  {tab}
                </button>
              ))}
            </nav>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearAll}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                aria-label="Clear all content"
                title="Clear All Content"
              >
                <TrashIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Clear All</span>
              </button>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-xl shadow-lg dark:shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50 p-4 sm:p-6 ring-1 ring-slate-900/10 dark:ring-white/10">
            {renderActiveFeature()}
          </div>
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-slate-500 dark:text-gray-400 opacity-50">
        made by Abhay Kushwaha
      </footer>
    </div>
  );
};

export default App;
