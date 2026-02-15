import React, { useState, useRef, useEffect } from 'react';
import { Check, X, ArrowRight, RotateCcw, Info, ExternalLink } from 'lucide-react';
import questionsData from './data.json';

// --- Colors & Theme ---
const colors = [
  '#EF4444', // Red (Signs)
  '#F59E0B', // Amber (Lights)
  '#10B981', // Emerald (Green)
  '#3B82F6', // Blue (Motorway)
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#F97316', // Orange
  '#64748B', // Slate
];

// --- Wheel Component ---
const SpinningWheel = ({ onFinished }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  
  // Extract categories from data
  const segments = questionsData.map(q => q.category);
  const segmentAngle = 360 / segments.length;

  // Build the conic-gradient string for the wheel background
  // Gradient starts from 90deg (3 o'clock position in CSS, where 0deg = 12 o'clock)
  const gradientParts = segments.map((_, i) => {
    const color = colors[i % colors.length];
    const start = i * segmentAngle;
    const end = (i + 1) * segmentAngle;
    return `${color} ${start}deg ${end}deg`;
  });
  const conicGradient = `conic-gradient(from 90deg, ${gradientParts.join(', ')})`;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);

    // 1. Pick a random winner index
    const winningIndex = Math.floor(Math.random() * segments.length);
    
    // 2. Calculate rotation to land the winning segment at the top pointer
    // - Gradient starts at 90deg (3 o'clock)
    // - Segment i center is at: 90 + (i * segmentAngle) + (segmentAngle / 2)
    // - Top pointer is at 0deg (12 o'clock)
    // - We need: (segmentCenter + rotation) % 360 = 0
    // - So: rotation = -segmentCenter (normalized)
    
    const segmentCenter = 90 + (winningIndex * segmentAngle) + (segmentAngle / 2);
    let targetRotation = -segmentCenter;
    
    // Normalize to positive angle
    targetRotation = targetRotation % 360;
    if (targetRotation < 0) targetRotation += 360;
    
    // Calculate rotation from current position
    const currentNormalized = rotation % 360;
    let rotationDiff = targetRotation - currentNormalized;
    if (rotationDiff < 0) rotationDiff += 360;
    
    // Add multiple spins for effect
    const spins = 5 + Math.floor(Math.random() * 3);
    const newRotation = rotation + (spins * 360) + rotationDiff;

    setRotation(newRotation);

    // 3. Show the winning question after spin completes
    setTimeout(() => {
      setIsSpinning(false);
      onFinished(questionsData[winningIndex]);
    }, 4000); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[600px] w-full bg-slate-50 p-4">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-slate-800 mb-2">Highway Code Quiz</h1>
        <p className="text-slate-600">Spin the wheel to select a category!</p>
      </div>

      <div className="relative w-80 h-80 sm:w-96 sm:h-96">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
          <div className="w-8 h-10 bg-slate-800 [clip-path:polygon(50%_100%,_0%_0%,_100%_0%)] shadow-lg" />
        </div>

        {/* Wheel Container */}
        <div
          className="w-full h-full rounded-full border-4 border-slate-800 shadow-2xl relative overflow-hidden transition-transform cubic-bezier(0.2, 0.8, 0.2, 1)"
          style={{
            transform: `rotate(${rotation}deg)`,
            transitionDuration: '4s',
            background: conicGradient
          }}
        >
          {segments.map((segment, index) => {
            const rotate = index * segmentAngle;
            return (
              <div
                key={index}
                className="absolute w-full h-full top-0 left-0"
                style={{
                  transform: `rotate(${rotate}deg)`,
                }}
              >
                {/* Text Label - Positioned in the middle of the slice */}
                <div 
                  className="absolute left-1/2 top-1/2 w-1/2 h-8 -mt-4 origin-left flex items-center justify-end pr-8"
                  style={{
                    transform: `rotate(${segmentAngle / 2}deg)`,
                  }}
                >
                  <span className="text-white font-bold text-sm uppercase drop-shadow-md truncate max-w-[120px]">
                    {segment}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Center Cap */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white rounded-full border-4 border-slate-800 z-10 flex items-center justify-center shadow-inner">
           <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
        </div>
      </div>

      <button
        onClick={handleSpin}
        disabled={isSpinning}
        className={`mt-12 px-12 py-4 rounded-full text-xl font-bold text-white shadow-lg transform transition-all 
          ${isSpinning 
            ? 'bg-slate-400 cursor-not-allowed scale-95' 
            : 'bg-indigo-600 hover:bg-indigo-700 hover:scale-105 active:scale-95 ring-4 ring-indigo-200'}`}
      >
        {isSpinning ? 'Spinning...' : 'SPIN!'}
      </button>
    </div>
  );
};

// --- Quiz Component ---
const QuizView = ({ categoryData, onBack }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  
  if (!categoryData) return null;

  const { category, question, options, correctIndex, explanation, reference, link } = categoryData;
  const isAnswered = selectedOption !== null;
  const isCorrect = selectedOption === correctIndex;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4 animate-fade-in">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-800 p-6 text-white flex justify-between items-center">
          <div>
            <span className="text-slate-400 text-sm font-semibold tracking-wider uppercase">Category</span>
            <h2 className="text-2xl font-bold">{category}</h2>
          </div>
          <div className="bg-white/10 p-2 rounded-lg">
             <Info className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <h3 className="text-xl font-medium text-slate-900 mb-8 leading-relaxed">
            {question}
          </h3>

          <div className="space-y-4">
            {options.map((option, index) => {
              // Determine styles based on state
              let containerStyle = "border-slate-200 hover:border-indigo-300 hover:bg-slate-50";
              let icon = <div className="w-5 h-5 rounded-full border-2 border-slate-300" />;
              
              if (isAnswered) {
                if (index === correctIndex) {
                  containerStyle = "border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500";
                  icon = <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>;
                } else if (index === selectedOption) {
                  containerStyle = "border-red-500 bg-red-50 ring-1 ring-red-500";
                  icon = <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center"><X className="w-3 h-3 text-white" /></div>;
                } else {
                  containerStyle = "border-slate-100 opacity-50";
                }
              }

              return (
                <button
                  key={index}
                  disabled={isAnswered}
                  onClick={() => setSelectedOption(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${containerStyle}`}
                >
                  <div className="flex-shrink-0">
                    {icon}
                  </div>
                  <span className={`font-medium ${isAnswered && index === correctIndex ? 'text-emerald-900' : 'text-slate-700'}`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback Section */}
        {isAnswered && (
          <div className={`p-6 border-t-2 ${isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <div className="flex gap-4">
              <div className={`mt-1 p-2 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {isCorrect ? <Check className="w-6 h-6" /> : <X className="w-6 h-6" />}
              </div>
              <div className="flex-1">
                <h4 className={`text-lg font-bold mb-1 ${isCorrect ? 'text-emerald-800' : 'text-red-800'}`}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h4>
                <p className="text-slate-700 mb-4 leading-relaxed">
                  {explanation}
                </p>
                
                <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-200/60">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <span>Reference: <strong>{reference}</strong></span>
                  </div>
                  
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                  >
                    Read Official Rule <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="bg-slate-50 p-6 flex justify-end border-t border-slate-200">
          {!isAnswered ? (
             <div className="text-slate-400 text-sm italic">Select an answer to continue</div>
          ) : (
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors font-medium shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              Go Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [view, setView] = useState('spinner'); // 'spinner' | 'quiz'
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  const handleSpinFinished = (questionData) => {
    setSelectedQuestion(questionData);
    // Add a tiny delay for user to see where it landed
    setTimeout(() => {
      setView('quiz');
    }, 1000);
  };

  const handleBack = () => {
    setView('spinner');
    setSelectedQuestion(null);
  };

  return (
    <div className="font-sans text-slate-900 bg-slate-100 min-h-screen">
      {view === 'spinner' && (
        <SpinningWheel onFinished={handleSpinFinished} />
      )}
      
      {view === 'quiz' && (
        <QuizView categoryData={selectedQuestion} onBack={handleBack} />
      )}
    </div>
  );
}