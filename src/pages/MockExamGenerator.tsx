import { useState, useEffect } from 'react';
import { generateMockExam } from '../services/geminiService';
import { MockExam, Question } from '../types';
import { Sparkles, Loader2, Clock, CheckCircle, AlertCircle, Play, ArrowLeft } from 'lucide-react';

export default function MockExamGenerator() {
  const [content, setContent] = useState('');
  const [exam, setExam] = useState<MockExam | null>(null);
  const [loading, setLoading] = useState(false);
  const [duration, setDuration] = useState(10);
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isExamFinished, setIsExamFinished] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isExamStarted && timeLeft > 0 && !isExamFinished) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isExamStarted && !isExamFinished) {
      handleFinishExam();
    }
    return () => clearInterval(timer);
  }, [isExamStarted, timeLeft, isExamFinished]);

  const handleGenerate = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const data = await generateMockExam(content);
      setExam({
        id: Date.now().toString(),
        title: "AI Generated Mock Exam",
        questions: data.questions,
        durationMinutes: duration,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error generating exam:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = () => {
    setIsExamStarted(true);
    setTimeLeft(duration * 60);
    setAnswers({});
    setIsExamFinished(false);
  };

  const handleFinishExam = () => {
    setIsExamFinished(true);
    // Calculate score for MCQs
    let correct = 0;
    exam?.questions.forEach(q => {
      if (q.type === 'mcq' && answers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    setScore(correct);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isExamStarted && !isExamFinished) {
    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="sticky top-0 bg-white/80 backdrop-blur-md p-4 border-b border-neutral-200 flex justify-between items-center z-10 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-neutral-900">{exam?.title}</h2>
          <div className={cn(
            "flex items-center px-4 py-2 rounded-lg font-mono font-bold",
            timeLeft < 60 ? "bg-red-50 text-red-600 animate-pulse" : "bg-neutral-100 text-neutral-700"
          )}>
            <Clock className="w-5 h-5 mr-2" />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="space-y-8 pb-24">
          {exam?.questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm">
              <div className="flex items-start gap-4">
                <span className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 space-y-4">
                  <p className="text-lg font-medium text-neutral-900">{q.question}</p>
                  
                  {q.type === 'mcq' ? (
                    <div className="grid gap-3">
                      {q.options?.map((opt) => (
                        <label 
                          key={opt}
                          className={cn(
                            "flex items-center p-4 border rounded-xl cursor-pointer transition-all",
                            answers[q.id] === opt 
                              ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200" 
                              : "hover:bg-neutral-50 border-neutral-200"
                          )}
                        >
                          <input 
                            type="radio" 
                            name={q.id} 
                            value={opt}
                            checked={answers[q.id] === opt}
                            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                            className="hidden"
                          />
                          <span className="text-neutral-700">{opt}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea 
                      className="w-full p-4 border border-neutral-200 rounded-xl h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Type your answer here..."
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
          <button 
            onClick={handleFinishExam}
            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
          >
            Submit Exam
          </button>
        </div>
      </div>
    );
  }

  if (isExamFinished) {
    const mcqs = exam?.questions.filter(q => q.type === 'mcq') || [];
    return (
      <div className="max-w-2xl mx-auto space-y-8 text-center py-12">
        <div className="bg-white border border-neutral-200 p-12 rounded-3xl shadow-xl">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-neutral-900 mb-2">Exam Completed!</h2>
          <p className="text-neutral-500 mb-8">Great job finishing the mock exam.</p>
          
          <div className="bg-neutral-50 p-8 rounded-2xl mb-8">
            <p className="text-sm text-neutral-500 uppercase font-bold tracking-widest mb-2">Your Score</p>
            <p className="text-6xl font-black text-indigo-600">
              {score}<span className="text-2xl text-neutral-400 font-normal">/{mcqs.length}</span>
            </p>
            <p className="text-sm text-neutral-400 mt-2">(MCQs only)</p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={() => setIsExamStarted(false)}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
            >
              Back to Generator
            </button>
          </div>
        </div>

        <div className="text-left space-y-6">
          <h3 className="text-xl font-bold text-neutral-900">Review Answers</h3>
          {exam?.questions.map((q, idx) => (
            <div key={q.id} className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm">
              <p className="font-bold text-neutral-900 mb-2">{idx + 1}. {q.question}</p>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-bold text-neutral-500">Your Answer:</span> {answers[q.id] || '(No answer)'}
                </p>
                <p className="text-sm">
                  <span className="font-bold text-green-600">Correct Answer:</span> {q.correctAnswer}
                </p>
                {q.explanation && (
                  <p className="text-sm text-neutral-500 italic mt-2">
                    <span className="font-bold">Explanation:</span> {q.explanation}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">AI Mock Exam Generator</h1>
        <p className="text-neutral-500 mt-1">Generate a custom timed test from your course content or notes.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-neutral-900 mb-2">Course Content / Notes</label>
            <textarea
              className="w-full h-96 p-4 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-neutral-700 leading-relaxed"
              placeholder="Paste the content you want to be tested on..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm">
            <h2 className="font-bold text-neutral-900 mb-4">Exam Settings</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-600 mb-1">Duration (Minutes)</label>
                <input 
                  type="number" 
                  min="1" 
                  max="180"
                  className="w-full px-4 py-2 border border-neutral-200 rounded-lg"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value))}
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !content.trim()}
                className="w-full flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Exam
                  </>
                )}
              </button>
            </div>
          </div>

          {exam && (
            <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg shadow-indigo-200 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="font-bold text-lg mb-2">Exam Ready!</h3>
              <p className="text-indigo-100 text-sm mb-6">
                Your mock exam with {exam.questions.length} questions is ready.
              </p>
              <button 
                onClick={handleStartExam}
                className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center"
              >
                <Play className="w-4 h-4 mr-2 fill-current" />
                Start Timed Exam
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
