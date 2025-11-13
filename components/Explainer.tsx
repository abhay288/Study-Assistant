import React, { useState } from 'react';
import { AppMode } from '../types';
import { generateExplanation, generateDiagram } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';

interface ExplainerProps {
  mode: AppMode;
  contextText: string;
}

const Explainer: React.FC<ExplainerProps> = ({ mode, contextText }) => {
  const [topic, setTopic] = useState('');
  const [explanation, setExplanation] = useState('');
  const [diagramUrl, setDiagramUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDiagramLoading, setIsDiagramLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to explain.');
      return;
    }
    setError(null);
    setIsLoading(true);
    setExplanation('');
    setDiagramUrl(null);

    try {
      if (mode === AppMode.Cloud) {
        const result = await generateExplanation(topic, contextText);
        setExplanation(result);
      } else {
        await new Promise(resolve => setTimeout(resolve, 500));
        setExplanation(`This is a basic offline explanation for "${topic}". For a more detailed answer and diagrams, please switch to Cloud Boost mode.`);
      }
    } catch (e) {
      setError('Failed to generate explanation.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateDiagram = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic first before generating a diagram.');
      return;
    }
    setError(null);
    setIsDiagramLoading(true);
    setDiagramUrl(null);
    try {
        const result = await generateDiagram(topic);
        setDiagramUrl(result);
    } catch (e) {
        setError('Failed to generate diagram.');
        console.error(e);
    } finally {
        setIsDiagramLoading(false);
    }
  };


  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-100 mb-4">Explain Any Topic</h2>
      <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
        Enter a concept, term, or question, and get a clear explanation. In Cloud mode, you can also generate a helpful diagram.
      </p>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
            <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Photosynthesis, The Pythagorean Theorem"
                className="flex-grow p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-slate-700 dark:text-gray-300"
                disabled={isLoading || isDiagramLoading}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        handleExplain();
                    }
                }}
            />
            <button
                onClick={handleExplain}
                disabled={isLoading || isDiagramLoading || !topic.trim()}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
            >
                {isLoading ? 'Explaining...' : 'Explain'}
            </button>
            {mode === AppMode.Cloud && (
                 <button
                    onClick={handleGenerateDiagram}
                    disabled={isLoading || isDiagramLoading || !topic.trim()}
                    className="flex items-center justify-center px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-sky-500"
                >
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    {isDiagramLoading ? 'Generating...' : 'Diagram'}
                </button>
            )}
        </div>

        {contextText && (
          <p className="text-xs text-center text-slate-400 dark:text-gray-500 -mt-2">
            Using provided text as context.
          </p>
        )}
        
        {error && <p className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</p>}

        {explanation && (
          <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900/70 rounded-md border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold mb-2 text-slate-800 dark:text-gray-200">Explanation:</h3>
            <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-gray-300 whitespace-pre-wrap">{explanation}</div>
          </div>
        )}
        
        {diagramUrl && (
            <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900/70 rounded-md border border-slate-200 dark:border-slate-700">
                 <h3 className="font-semibold mb-2 text-slate-800 dark:text-gray-200">Generated Diagram:</h3>
                 <div className="p-2 bg-white/50 dark:bg-slate-950/50 rounded-lg mt-2">
                    <img src={diagramUrl} alt={`Diagram for ${topic}`} className="rounded-lg max-w-full h-auto mx-auto shadow-lg"/>
                 </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Explainer;