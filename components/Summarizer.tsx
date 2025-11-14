import React, { useState, useCallback, useEffect } from "react";
import { AppMode } from "../types";
import { generateSummary } from "../services/geminiService";

import SparklesIcon from "./icons/SparklesIcon";
import UploadIcon from "./icons/UploadIcon";
import CopyIcon from "./icons/CopyIcon";
import CheckIcon from "./icons/CheckIcon";
import FilePdfIcon from "./icons/FilePdfIcon";
import FileTextIcon from "./icons/FileTextIcon";
import ScanIcon from "./icons/ScanIcon";
import FileExportIcon from "./icons/FileExportIcon";

// ------------------------------------------------------
// ✅ Correct pdfjs-dist import for Vite + TS + Vercel
// ------------------------------------------------------
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Use CDN worker (Best practice for Vite & avoids build errors)
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

// ------------------------------------------------------
// ✅ Correct Tesseract import
// ------------------------------------------------------
import Tesseract from "tesseract.js";
// Set worker source for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

interface SummarizerProps {
  mode: AppMode;
  text: string;
  setText: (text: string) => void;
  summary: string;
  setSummary: (summary: string) => void;
  setSourceFileName: (name: string) => void;
  onExportPdf: () => void;
  canExport: boolean;
}

type ProcessingFileType = 'pdf' | 'txt' | 'ocr' | 'doc';

const Summarizer: React.FC<SummarizerProps> = ({ mode, text, setText, summary, setSummary, setSourceFileName, onExportPdf, canExport }) => {
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [processingFile, setProcessingFile] = useState<{ name: string; type: ProcessingFileType } | null>(null);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);
  
  const extractTextFromPdf = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    let combinedText = '';

    // First pass: try direct text extraction
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => ('str' in item ? item.str : '')).join(' ');
      combinedText += pageText + '\n\n';
    }

    // Heuristic: If the extracted text is very short, assume it's a scanned/image-based PDF
    if (combinedText.trim().length < 100 && pdf.numPages > 0) {
      setProcessingFile(prev => prev ? { ...prev, type: 'ocr' } : null);
      setLoadingMessage('Scanned PDF detected, starting OCR...');
      combinedText = ''; // Reset for OCR results

      for (let i = 1; i <= pdf.numPages; i++) {
        setLoadingMessage(`Enhancing page ${i} of ${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if(!context) continue;

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;

        // Pre-processing: Binarization (simple thresholding)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let j = 0; j < data.length; j += 4) {
          const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
          const color = avg > 128 ? 255 : 0;
          data[j] = data[j + 1] = data[j + 2] = color;
        }
        context.putImageData(imageData, 0, 0);

        setLoadingMessage(`Extracting text from page ${i}...`);
        const { data: { text } } = await Tesseract.recognize(canvas, 'eng');
        combinedText += text + '\n\n';
      }
    }

    // Clean up the extracted text, whether from direct extraction or OCR
    const cleanedText = combinedText
        .replace(/(\w)-\s/g, '$1') // Re-join hyphenated words that are split across lines
        .replace(/\s+/g, ' ')      // Collapse multiple whitespace characters into a single space
        .trim();
        
    return cleanedText;
  };

  const handleSummarize = async () => {
    if (!text.trim()) {
      setError('Please enter some text to summarize.');
      return;
    }
    setError(null);
    setLoadingMessage('Summarizing...');
    setSummary('');

    try {
      if (mode === AppMode.Cloud) {
        const result = await generateSummary(text);
        setSummary(result);
      } else {
        // Enhanced offline simulation with keyword scoring
        await new Promise(resolve => setTimeout(resolve, 500));
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        if (sentences.length <= 2) {
            setSummary(text);
        } else {
            const stopWords = new Set(['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now']);
            const words = text.toLowerCase().match(/\b\w+\b/g) || [];
            const wordFrequencies: { [key: string]: number } = {};
            words.forEach(word => {
                if (!stopWords.has(word)) {
                    wordFrequencies[word] = (wordFrequencies[word] || 0) + 1;
                }
            });
            const keywords = Object.keys(wordFrequencies).sort((a, b) => wordFrequencies[b] - wordFrequencies[a]).slice(0, 10);

            let bestSentence = '';
            let maxScore = -1;

            sentences.slice(1).forEach(sentence => {
                const sentenceWords = new Set(sentence.toLowerCase().match(/\b\w+\b/g));
                let score = 0;
                keywords.forEach(keyword => {
                    if (sentenceWords.has(keyword)) {
                        score++;
                    }
                });
                if (score > maxScore) {
                    maxScore = score;
                    bestSentence = sentence;
                }
            });
            
            setSummary(`${sentences[0].trim()} ${bestSentence.trim()}`);
        }
      }
    } catch (e) {
      setError('Failed to generate summary. Please try again.');
      console.error(e);
    } finally {
      setLoadingMessage('');
    }
  };

  const processFile = async (file: File) => {
    if (!file) return;

    setSourceFileName(file.name);
    setError(null);
    setSuccessMessage('');
    const fileName = file.name.toLowerCase();
    const isPlainText = file.type === 'text/plain' || fileName.endsWith('.txt');
    const isMarkdown = file.type === 'text/markdown' || fileName.endsWith('.md');
    const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf');
    const isDoc = file.type.startsWith('application/msword') || file.type.startsWith('application/vnd.openxmlformats-officedocument.wordprocessingml') || fileName.endsWith('.doc') || fileName.endsWith('.docx');

    if (isDoc) {
      setProcessingFile({ name: file.name, type: 'doc' });
      setError(`This app cannot read .doc/.docx files directly. Please open the file, copy its content, and paste it into the text area below.`);
      setProcessingFile(null);
      return;
    }

    if (isPdf) {
      setProcessingFile({ name: file.name, type: 'pdf' });
      setLoadingMessage('Processing PDF...');
      try {
        const extractedText = await extractTextFromPdf(file);
        setText(extractedText);
        setSuccessMessage(`Successfully processed '${file.name}'!`);
      } catch (e) {
        console.error("Failed to process PDF", e);
        setError('Could not read text from this PDF. The file might be corrupted, password-protected, or in an unsupported format.');
      } finally {
        setLoadingMessage('');
        setProcessingFile(null);
      }
      return;
    }

    if (isPlainText || isMarkdown) {
      setProcessingFile({ name: file.name, type: 'txt' });
      setLoadingMessage('Reading text file...');
      try {
        const reader = new FileReader();
        reader.onload = (e) => {
            let fileText = e.target?.result;
            if (typeof fileText === 'string') {
                fileText = fileText.replace(/\r\n/g, '\n').trim();
                setText(fileText);
                setSuccessMessage(`Successfully processed '${file.name}'!`);
            } else {
                setError('Failed to read file content.');
            }
        };
        reader.onerror = () => {
            setError('Failed to read the file.');
        };
        reader.readAsText(file);
      } catch (e) {
        setError('An error occurred while reading the file.');
      } finally {
        setLoadingMessage('');
        setProcessingFile(null);
      }
      return;
    }
    
    setError('Unsupported file type. Please upload a .pdf, .txt, or .md file. For other formats like .doc, please copy and paste the text.');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
      e.target.value = ''; 
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  }, [processFile]);

  const handleCopy = useCallback(() => {
    if (!summary || copied) return;
    navigator.clipboard.writeText(summary).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
  }, [summary, copied]);

  const renderIconForType = (type: ProcessingFileType) => {
    const className = `w-10 h-10 ${loadingMessage ? 'animate-pulse' : ''}`;
    switch (type) {
      case 'pdf': return <FilePdfIcon className={`${className} text-red-400`} />;
      case 'txt': return <FileTextIcon className={`${className} text-sky-400`} />;
      case 'ocr': return <ScanIcon className={`${className} text-yellow-400`} />;
      default: return null;
    }
  }

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900 dark:text-gray-100 mb-4">Notes Summarizer</h2>
      <p className="text-sm text-slate-500 dark:text-gray-400 mb-4">
        Upload a file (.pdf, .txt), or paste your notes below. The assistant will provide a concise summary.
      </p>
      <div className="flex flex-col gap-4">
        <label
          htmlFor="file-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative block w-full p-6 text-center border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200 min-h-[140px] flex flex-col items-center justify-center ${
            isDraggingOver ? 'border-indigo-500 bg-slate-100/50 dark:bg-slate-800/50' : 'border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600'
          }`}
        >
          {processingFile ? (
             <div className="flex flex-col items-center justify-center text-center">
              {renderIconForType(processingFile.type)}
              <p className="mt-2 text-sm font-semibold text-slate-700 dark:text-gray-300 truncate max-w-full px-2">{processingFile.name}</p>
              <p className="mt-1 text-xs text-indigo-500 dark:text-indigo-400">{loadingMessage || 'Processing...'}</p>
            </div>
          ) : (
            <>
              <UploadIcon className="w-8 h-8 mx-auto text-slate-400 dark:text-gray-500" />
              <span className="mt-2 block text-sm font-semibold text-slate-500 dark:text-gray-400">
                Upload a file
              </span>
              <span className="mt-1 block text-xs text-slate-400 dark:text-gray-500">
                Drag & drop or click to select a file.
              </span>
            </>
          )}

          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={!!loadingMessage} accept=".txt,.md,.pdf,.doc,.docx,text/plain,text/markdown,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
        </label>
        
        {successMessage && <div className="text-green-600 dark:text-green-400 text-sm text-center -mt-2">{successMessage}</div>}

        <div className="relative flex items-center">
            <span className="flex-grow border-t border-slate-300 dark:border-slate-700"></span>
            <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 dark:text-gray-500 uppercase">OR</span>
            <span className="flex-grow border-t border-slate-300 dark:border-slate-700"></span>
        </div>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setSourceFileName('Pasted Text');
          }}
          placeholder="Paste text from a DOC or any other source here..."
          className="w-full h-48 p-3 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200 text-slate-700 dark:text-gray-300 resize-none"
          disabled={!!loadingMessage}
        />
        <button
          onClick={handleSummarize}
          disabled={!!loadingMessage || !text.trim()}
          className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-indigo-500"
        >
          {loadingMessage && !processingFile ? (
            loadingMessage
          ) : (
            <>
              {mode === AppMode.Cloud && <SparklesIcon className="h-5 w-5 mr-2" />}
              Summarize
            </>
          )}
        </button>
        {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
        {summary && (
          <div className="relative mt-4 p-4 bg-slate-100 dark:bg-slate-900/70 rounded-md border border-slate-200 dark:border-slate-700">
            <div className="absolute top-3 right-3 flex items-center space-x-2">
                <button
                onClick={handleCopy}
                disabled={copied}
                className="flex items-center space-x-1.5 px-2 py-1 text-xs font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-200 hover:bg-slate-300/50 dark:bg-slate-800 dark:hover:bg-slate-700/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:cursor-default"
                aria-label="Copy summary to clipboard"
                >
                {copied ? (
                    <>
                    <CheckIcon className="h-3.5 w-3.5 text-green-500 dark:text-green-400" />
                    <span>Copied!</span>
                    </>
                ) : (
                    <>
                    <CopyIcon className="h-3.5 w-3.5" />
                    <span>Copy</span>
                    </>
                )}
                </button>
                <button
                    onClick={onExportPdf}
                    disabled={!canExport}
                    className="flex items-center space-x-1.5 px-2 py-1 text-xs font-medium text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-200 hover:bg-slate-300/50 dark:bg-slate-800 dark:hover:bg-slate-700/50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Export content to PDF"
                >
                    <FileExportIcon className="h-3.5 w-3.5" />
                    <span>Export</span>
              </button>
            </div>
            
            <h3 className="font-semibold mb-2 text-slate-800 dark:text-gray-200">Summary:</h3>
            <div className="prose prose-sm prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-gray-300 whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Summarizer;
