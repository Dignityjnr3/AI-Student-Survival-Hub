import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Attendance, Course } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import { User, Calendar, CheckCircle, Clock, Users, ChevronRight, ChevronLeft, Camera, X } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface LecturerAttendanceProps {
  user: UserProfile;
}

export default function LecturerAttendance({ user }: LecturerAttendanceProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (!user) return null;

  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'courses'), where('lecturerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
      setCourses(coursesData);
      if (coursesData.length > 0 && !selectedCourse) {
        setSelectedCourse(coursesData[0]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user.uid]);

  useEffect(() => {
    if (!selectedCourse) return;

    const q = query(collection(db, 'attendance'), where('courseId', '==', selectedCourse.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAttendance(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Attendance)));
    });

    return () => unsubscribe();
  }, [selectedCourse]);

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  if (loading) return <div className="p-12 text-center dark:text-white">Loading attendance...</div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Attendance Tracking</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Monitor student attendance and generate QR codes.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            value={selectedCourse?.id}
            onChange={(e) => setSelectedCourse(courses.find(c => c.id === e.target.value) || null)}
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          <button 
            onClick={() => setShowQR(true)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center"
          >
            <Camera className="w-4 h-4 mr-2" />
            Generate QR
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold text-neutral-900 dark:text-white mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
              Quick Stats
            </h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl">
                <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase font-bold">Today</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                  {attendance.filter(a => a.date === format(new Date(), 'yyyy-MM-dd')).length}
                </p>
              </div>
              <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl">
                <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase font-bold">Total Records</p>
                <p className="text-2xl font-black text-neutral-900 dark:text-white">{attendance.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center">
              <h2 className="font-bold text-neutral-900 dark:text-white">Monthly Overview</h2>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-neutral-600 dark:text-neutral-400"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="font-bold text-sm min-w-[120px] text-center text-neutral-900 dark:text-white">
                  {format(currentMonth, 'MMMM yyyy')}
                </span>
                <button 
                  onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                  className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors text-neutral-600 dark:text-neutral-400"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="text-neutral-400 dark:text-neutral-500 uppercase text-[10px] font-bold tracking-widest border-b border-neutral-100 dark:border-neutral-800">
                    <th className="text-left py-3 px-4 sticky left-0 bg-white dark:bg-neutral-900 z-10">Student Name</th>
                    {daysInMonth.map(day => (
                      <th key={day.toString()} className="text-center py-3 px-2 min-w-[40px]">
                        {format(day, 'dd')}
                      </th>
                    ))}
                    <th className="text-center py-3 px-4 sticky right-0 bg-white dark:bg-neutral-900 z-10">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50 dark:divide-neutral-800">
                  {Array.from(new Set(attendance.map(a => a.studentId))).map(studentId => {
                    const studentName = attendance.find(a => a.studentId === studentId)?.studentName || 'Unknown';
                    const studentAttendance = attendance.filter(a => a.studentId === studentId);
                    
                    return (
                      <tr key={studentId} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <td className="py-4 px-4 font-medium text-neutral-900 dark:text-white sticky left-0 bg-white dark:bg-neutral-900 z-10 border-r border-neutral-50 dark:border-neutral-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          {studentName}
                        </td>
                        {daysInMonth.map(day => {
                          const isPresent = studentAttendance.some(a => a.date === format(day, 'yyyy-MM-dd'));
                          return (
                            <td key={day.toString()} className="text-center py-4 px-2">
                              {isPresent ? (
                                <div className="flex items-center justify-center">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                </div>
                              ) : (
                                <div className="w-1.5 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full mx-auto" />
                              )}
                            </td>
                          );
                        })}
                        <td className="text-center py-4 px-4 font-bold text-indigo-600 dark:text-indigo-400 sticky right-0 bg-white dark:bg-neutral-900 z-10 border-l border-neutral-50 dark:border-neutral-800 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                          {studentAttendance.length}
                        </td>
                      </tr>
                    );
                  })}
                  {attendance.length === 0 && (
                    <tr>
                      <td colSpan={daysInMonth.length + 2} className="py-12 text-center text-neutral-400 dark:text-neutral-500 italic">
                        No attendance records found for this course.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] max-w-md w-full p-10 shadow-2xl border border-neutral-200 dark:border-neutral-800 text-center space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Course QR Code</h2>
              <button 
                onClick={() => setShowQR(false)}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-neutral-500" />
              </button>
            </div>
            
            <div className="bg-white p-6 border-2 border-indigo-50 dark:border-neutral-800 rounded-3xl inline-block shadow-lg">
              {selectedCourse && (
                <QRCodeSVG 
                  value={JSON.stringify({ lecturerId: user.uid, courseId: selectedCourse.id })}
                  size={240}
                  level="H"
                  includeMargin={true}
                />
              )}
            </div>
            
            <div className="space-y-4">
              <p className="text-neutral-600 dark:text-neutral-400">
                Ask your students to scan this code to mark their attendance for <span className="font-bold text-neutral-900 dark:text-white">{selectedCourse?.title}</span>.
              </p>
              <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
                <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase font-bold mb-1">Today's Session</p>
                <p className="text-lg font-bold text-neutral-900 dark:text-white">{format(new Date(), 'MMMM d, yyyy')}</p>
              </div>
            </div>

            <button 
              onClick={() => setShowQR(false)}
              className="w-full py-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-2xl font-bold hover:opacity-90 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
