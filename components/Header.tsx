import React from 'react';
import { AppMode } from '../types';
import CloudIcon from './icons/CloudIcon';
import OfflineIcon from './icons/OfflineIcon';
import SparklesIcon from './icons/SparklesIcon';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

interface HeaderProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  theme: string;
  toggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ mode, setMode, theme, toggleTheme }) => {
  const isCloud = mode === AppMode.Cloud;

  return (
    <header className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-10 p-4 border-b border-slate-200 dark:border-slate-700/50">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-gray-100 flex items-center">
          <span className="text-indigo-600 dark:text-indigo-400 mr-2">Study</span>
          <span>Assistant</span>
        </h1>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-full text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-indigo-500 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5 text-yellow-300" />
            ) : (
              <MoonIcon className="h-5 w-5 text-slate-700" />
            )}
          </button>
          
          <span className="text-sm font-medium text-slate-500 dark:text-gray-400 hidden sm:block">
            {isCloud ? 'Cloud Boost' : 'Offline'} Mode
          </span>
          <button
            onClick={() => setMode(isCloud ? AppMode.Offline : AppMode.Cloud)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-indigo-500 ${
              isCloud ? 'bg-indigo-600' : 'bg-slate-400 dark:bg-slate-600'
            }`}
          >
            <span className="sr-only">Toggle Mode</span>
            <span
              className={`inline-flex items-center justify-center h-6 w-6 transform rounded-full bg-white shadow-lg ring-1 ring-slate-900/5 transition-transform duration-300 ease-in-out ${
                isCloud ? 'translate-x-8' : 'translate-x-1'
              }`}
            >
              {isCloud ? (
                <CloudIcon className="h-4 w-4 text-indigo-600" />
              ) : (
                <OfflineIcon className="h-4 w-4 text-slate-600" />
              )}
            </span>
            {isCloud && (
              <SparklesIcon className="absolute right-1.5 h-4 w-4 text-yellow-300" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;