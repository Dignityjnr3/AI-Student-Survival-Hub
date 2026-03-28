import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { CheckCircle, Camera, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';

interface AttendanceScannerProps {
  user: UserProfile;
}

export default function AttendanceScanner({ user }: AttendanceScannerProps) {
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success' | 'error' | 'loading'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (!user) return null;

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (status === 'scanning') {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((decodedText) => {
        try {
          const data = JSON.parse(decodedText);
          if (data.lecturerId && data.courseId) {
            handleAttendance(data);
            scanner?.clear();
          } else {
            setErrorMessage("This QR code is not a valid attendance code.");
            setStatus('error');
            scanner?.clear();
          }
        } catch (e) {
          setErrorMessage("Failed to read QR code. Please make sure it's the correct code.");
          setStatus('error');
          scanner?.clear();
        }
      }, (error) => {
        // Only show error if it's a critical failure, not just a scan miss
        if (error?.includes("NotFoundException")) return;
        console.warn("QR Scan error:", error);
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error));
      }
    };
  }, [status]);

  const handleAttendance = async (data: { lecturerId: string; courseId: string }) => {
    setStatus('loading');
    const today = format(new Date(), 'yyyy-MM-dd');
    
    try {
      // Check if already marked for today
      const q = query(
        collection(db, 'attendance'),
        where('studentId', '==', user.uid),
        where('courseId', '==', data.courseId),
        where('date', '==', today)
      );
      const existing = await getDocs(q);
      
      if (!existing.empty) {
        setErrorMessage("Attendance already marked for today!");
        setStatus('error');
        return;
      }

      await addDoc(collection(db, 'attendance'), {
        studentId: user.uid,
        studentName: user.name,
        courseId: data.courseId,
        lecturerId: data.lecturerId,
        date: today,
        timestamp: new Date().toISOString(),
        status: 'present'
      });

      setStatus('success');
    } catch (error) {
      console.error("Error marking attendance:", error);
      setErrorMessage("Failed to mark attendance. Please try again.");
      setStatus('error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Attendance Scanner</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">Scan the QR code provided by your lecturer to mark your attendance.</p>
      </header>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-8 shadow-xl dark:shadow-none">
        {status === 'idle' && (
          <div className="text-center space-y-6 py-12">
            <div className="w-24 h-24 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto text-indigo-600 dark:text-indigo-400">
              <Camera className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Ready to scan?</h2>
              <p className="text-neutral-500 dark:text-neutral-400">Make sure you have allowed camera permissions in your browser.</p>
            </div>
            <button 
              onClick={() => setStatus('scanning')}
              className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              Start Camera
            </button>
          </div>
        )}

        {status === 'scanning' && (
          <div className="space-y-6">
            <div id="reader" className="overflow-hidden rounded-2xl border-2 border-indigo-100 dark:border-neutral-800"></div>
            <button 
              onClick={() => setStatus('idle')}
              className="w-full py-3 text-neutral-500 dark:text-neutral-400 font-medium hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              Cancel Scanning
            </button>
          </div>
        )}

        {status === 'loading' && (
          <div className="text-center py-20 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">Processing your attendance...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
              <CheckCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Success!</h2>
              <p className="text-neutral-500 dark:text-neutral-400">Your attendance has been marked for today.</p>
            </div>
            <button 
              onClick={() => setStatus('idle')}
              className="px-8 py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-xl font-bold hover:opacity-90 transition-all"
            >
              Done
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-12 space-y-6">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
              <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Oops!</h2>
              <p className="text-red-600 dark:text-red-400 font-medium">{errorMessage}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                onClick={() => setStatus('scanning')}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
              >
                Try Again
              </button>
              <button 
                onClick={() => setStatus('idle')}
                className="px-8 py-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-xl font-bold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/20">
        <h3 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center">
          <Info className="w-4 h-4 mr-2" />
          Quick Tips
        </h3>
        <ul className="text-sm text-indigo-700/70 dark:text-indigo-400/70 space-y-2 list-disc list-inside">
          <li>Ensure you have a stable internet connection.</li>
          <li>Hold your phone steady and center the QR code in the box.</li>
          <li>If the camera doesn't start, check your browser's site settings.</li>
        </ul>
      </div>
    </div>
  );
}
