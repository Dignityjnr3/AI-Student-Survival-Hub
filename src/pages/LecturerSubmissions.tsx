import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile, Submission, Assignment } from '../types';
import { FileText, User, Calendar, CheckCircle, Clock, MessageSquare, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface LecturerSubmissionsProps {
  user: UserProfile;
}

export default function LecturerSubmissions({ user }: LecturerSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Record<string, Assignment>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');

  if (!user) return null;

  useEffect(() => {
    // 1. Get all assignments created by this lecturer
    const assignmentsQ = query(collection(db, 'assignments'), where('lecturerId', '==', user.uid));
    
    const unsubscribeAssignments = onSnapshot(assignmentsQ, (snapshot) => {
      const assignmentsMap: Record<string, Assignment> = {};
      snapshot.docs.forEach(doc => {
        assignmentsMap[doc.id] = { id: doc.id, ...doc.data() } as Assignment;
      });
      setAssignments(assignmentsMap);
    });

    // 2. Get all submissions for this lecturer's assignments
    const submissionsQ = query(
      collection(db, 'submissions'), 
      where('lecturerId', '==', user.uid),
      where('status', 'in', ['submitted', 'graded'])
    );
    const unsubscribeSubmissions = onSnapshot(submissionsQ, (snapshot) => {
      setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
      setLoading(false);
    });

    return () => {
      unsubscribeAssignments();
      unsubscribeSubmissions();
    };
  }, []);

  const handleGrade = async () => {
    if (!selectedSubmission) return;
    try {
      await updateDoc(doc(db, 'submissions', selectedSubmission.id), {
        grade,
        feedback,
        status: 'graded'
      });
      setSelectedSubmission(null);
      setGrade('');
      setFeedback('');
    } catch (error) {
      console.error("Error grading submission:", error);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading submissions...</div>;

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">Student Submissions</h1>
        <p className="text-neutral-500 mt-1">Review and grade work submitted by your students.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {submissions.length > 0 ? (
            submissions.map((sub) => {
              const assignment = assignments[sub.assignmentId];
              return (
                <div 
                  key={sub.id}
                  onClick={() => setSelectedSubmission(sub)}
                  className={cn(
                    "bg-white border p-6 rounded-2xl cursor-pointer transition-all hover:shadow-md",
                    selectedSubmission?.id === sub.id ? "border-indigo-600 ring-1 ring-indigo-600" : "border-neutral-200"
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-500">
                        {sub.type === 'file' ? <FileText className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-neutral-900">{sub.studentName || 'Unknown Student'}</h3>
                        <p className="text-sm text-neutral-500">{assignment?.title || 'Unknown Assignment'}</p>
                        <div className="flex items-center mt-2 text-xs text-neutral-400 space-x-3">
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(sub.createdAt), 'MMM d, h:mm a')}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                            sub.status === 'graded' ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                          )}>
                            {sub.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {sub.grade && (
                      <div className="text-right">
                        <p className="text-xs text-neutral-400 uppercase font-bold">Grade</p>
                        <p className="text-xl font-black text-indigo-600">{sub.grade}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white border border-dashed border-neutral-300 p-12 rounded-2xl text-center">
              <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500">No submissions to review yet.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selectedSubmission ? (
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm space-y-6 sticky top-8">
              <h2 className="font-bold text-lg text-neutral-900">Review Submission</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-neutral-400 uppercase font-bold mb-1">Content</p>
                  {selectedSubmission.type === 'text' ? (
                    <div className="bg-neutral-50 p-4 rounded-xl text-sm text-neutral-700 whitespace-pre-wrap max-h-64 overflow-y-auto border border-neutral-100">
                      {selectedSubmission.content}
                    </div>
                  ) : (
                    <a 
                      href={selectedSubmission.fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center p-4 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      <FileText className="w-5 h-5 mr-3" />
                      <span className="flex-1 truncate font-medium">{selectedSubmission.fileName}</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="pt-4 border-t border-neutral-100 space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-neutral-900 mb-1">Grade</label>
                    <input 
                      type="text" 
                      placeholder="e.g. A, 95/100"
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-neutral-900 mb-1">Feedback</label>
                    <textarea 
                      className="w-full px-4 py-2 border border-neutral-200 rounded-lg h-24 resize-none"
                      placeholder="Add comments for the student..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleGrade}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    Save Grade & Feedback
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-8 text-center text-neutral-400">
              <p className="text-sm">Select a submission to review details and provide feedback.</p>
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
