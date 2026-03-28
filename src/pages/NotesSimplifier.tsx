import { useState } from 'react';
import { simplifyNotes } from '../services/geminiService';
import { FileText, Sparkles, Loader2, Copy, Check } from 'lucide-react';

export default function NotesSimplifierPage() {
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<{ summary: string; explanation: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSimplify = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    try {
      const data = await simplifyNotes(notes);
      setResult(data);
    } catch (error) {
      console.error("Error simplifying notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!result) return;
    const text = `Summary:\n${result.summary}\n\nExplanation:\n${result.explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Notes Simplifier</h1>
        <p className="text-neutral-500 mt-1">Paste your complex academic notes and let AI simplify them for you.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <label className="block text-sm font-bold text-neutral-900 mb-2">Your Notes</label>
            <textarea
              className="w-full h-96 p-4 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-neutral-700 leading-relaxed"
              placeholder="Paste your notes here..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <button
              onClick={handleSimplify}
              disabled={loading || !notes.trim()}
              className="w-full mt-4 flex items-center justify-center px-6 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Simplifying...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Simplify with AI
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {result ? (
            <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-neutral-50">
                <h2 className="font-bold text-neutral-900 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                  AI Result
                </h2>
                <button
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-neutral-200 rounded-lg transition-colors text-neutral-500"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
              <div className="p-8 space-y-8">
                <section>
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Summary</h3>
                  <p className="text-neutral-700 leading-relaxed">{result.summary}</p>
                </section>
                <section>
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Simplified Explanation</h3>
                  <p className="text-neutral-700 leading-relaxed">{result.explanation}</p>
                </section>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-neutral-100 border border-dashed border-neutral-300 rounded-2xl p-12 text-center">
              <FileText className="w-16 h-16 text-neutral-300 mb-4" />
              <p className="text-neutral-500">Your simplified notes will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
