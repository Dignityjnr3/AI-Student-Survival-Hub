import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, Assignment, Submission, StudyPlan } from '../types';
import { generateStudyPlan } from '../services/geminiService';
import { Calendar, Clock, ArrowLeft, CheckCircle, Sparkles, Loader2, Upload, Send, FileText, X } from 'lucide-react';
import { format } from 'date-fns';

interface AssignmentDetailProps {
  user: UserProfile;
}

export default function AssignmentDetail({ user }: AssignmentDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  // Submission form states
  const [submissionType, setSubmissionType] = useState<'text' | 'file'>('text');
  const [pastedContent, setPastedContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchAssignment = async () => {
      try {
        const docRef = doc(db, 'assignments', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setAssignment({ id: docSnap.id, ...docSnap.data() } as Assignment);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `assignments/${id}`);
      }
    };

    const subQ = query(collection(db, 'submissions'), where('assignmentId', '==', id), where('studentId', '==', user.uid));
    const unsubscribe = onSnapshot(subQ, (snapshot) => {
      if (!snapshot.empty) {
        setSubmission({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Submission);
      } else {
        setSubmission(null);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'submissions');
    });

    fetchAssignment();
    return () => unsubscribe();
  }, [id, user.uid]);

  const handleStartTask = async () => {
    if (!assignment || !id) return;
    setAiLoading(true);
    try {
      const plan = await generateStudyPlan(assignment.title, assignment.description, assignment.deadline);
      
      const submissionId = `${user.uid}_${id}`;
      try {
        await setDoc(doc(db, 'submissions', submissionId), {
          id: submissionId,
          assignmentId: id,
          studentId: user.uid,
          studentName: user.name,
          status: 'pending',
          type: 'text', // Default type
          plan,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `submissions/${submissionId}`);
      }
    } catch (error) {
      console.error("Error generating plan:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitWork = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      let fileUrl = '';
      let fileName = '';

      if (submissionType === 'file' && selectedFile) {
        const fileRef = ref(storage, `submissions/${user.uid}/${id}/${selectedFile.name}`);
        await uploadBytes(fileRef, selectedFile);
        fileUrl = await getDownloadURL(fileRef);
        fileName = selectedFile.name;
      }

      const submissionId = `${user.uid}_${id}`;
      await setDoc(doc(db, 'submissions', submissionId), {
        id: submissionId,
        assignmentId: id,
        studentId: user.uid,
        studentName: user.name,
        type: submissionType,
        content: submissionType === 'text' ? pastedContent : '',
        fileUrl,
        fileName,
        status: 'submitted',
        createdAt: new Date().toISOString()
      }, { merge: true });

      setPastedContent('');
      setSelectedFile(null);
    } catch (error) {
      console.error("Error submitting work:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!submission) return;
    try {
      await updateDoc(doc(db, 'submissions', submission.id), {
        status: 'completed',
        completedAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `submissions/${submission.id}`);
    }
  };

  if (loading) return <div className="p-12 text-center">Loading assignment...</div>;
  if (!assignment) return <div className="p-12 text-center">Assignment not found.</div>;

  const isDeadlinePassed = new Date(assignment.deadline) < new Date();

  return (
    <div className="space-y-8 pb-20">
      <button 
        onClick={() => navigate('/')}
        className="flex items-center text-neutral-500 hover:text-neutral-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-6 sm:p-8 border-b border-neutral-100">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">{assignment.title}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center mt-3 text-neutral-500 gap-3 sm:gap-6">
                    <span className="flex items-center text-sm sm:text-base">
                      <Calendar className="w-5 h-5 mr-2 text-indigo-600" />
                      Deadline: {format(new Date(assignment.deadline), 'PPP p')}
                    </span>
                    <span className="flex items-center text-sm sm:text-base">
                      <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                      Status: <span className={cn(
                        "ml-1 font-bold capitalize",
                        submission?.status === 'submitted' ? "text-green-600" : "text-amber-600"
                      )}>{submission?.status || 'Not Started'}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4">Description</h2>
              <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                {assignment.description}
              </p>
            </div>
          </div>

          {/* Submission Form */}
          {!isDeadlinePassed && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-neutral-900">Submit Your Work</h2>
              
              <div className="flex gap-4 p-1 bg-neutral-100 rounded-xl w-fit">
                <button 
                  onClick={() => setSubmissionType('text')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    submissionType === 'text' ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  Text Input
                </button>
                <button 
                  onClick={() => setSubmissionType('file')}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-bold transition-all",
                    submissionType === 'file' ? "bg-white text-indigo-600 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
                  )}
                >
                  File Upload
                </button>
              </div>

              {submissionType === 'text' ? (
                <textarea 
                  className="w-full h-64 p-4 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Paste your assignment content here..."
                  value={pastedContent}
                  onChange={(e) => setPastedContent(e.target.value)}
                />
              ) : (
                <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-12 text-center hover:border-indigo-300 transition-colors relative">
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx"
                  />
                  {selectedFile ? (
                    <div className="space-y-2">
                      <FileText className="w-12 h-12 text-indigo-600 mx-auto" />
                      <p className="font-bold text-neutral-900">{selectedFile.name}</p>
                      <button 
                        onClick={(e) => { e.preventDefault(); setSelectedFile(null); }}
                        className="text-sm text-red-500 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-12 h-12 text-neutral-300 mx-auto" />
                      <p className="font-bold text-neutral-900">Click or drag to upload</p>
                      <p className="text-sm text-neutral-400">PDF or DOCX (Max 10MB)</p>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={handleSubmitWork}
                disabled={submitting || (submissionType === 'text' ? !pastedContent.trim() : !selectedFile)}
                className="w-full flex items-center justify-center px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    {submission?.status === 'submitted' ? 'Resubmit Assignment' : 'Submit Assignment'}
                  </>
                )}
              </button>
            </div>
          )}

          {isDeadlinePassed && !submission && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
              <p className="text-red-600 font-bold">The deadline for this assignment has passed.</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {/* AI Study Plan Section */}
          {!submission ? (
            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8 text-center">
              <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Need a plan?</h2>
              <p className="text-neutral-600 mb-8 text-sm leading-relaxed">
                Let AI break down this assignment into manageable steps for you.
              </p>
              <button
                onClick={handleStartTask}
                disabled={aiLoading}
                className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
              >
                {aiLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                Generate Plan
              </button>
            </div>
          ) : submission.plan && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 mb-6 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-indigo-600" />
                AI Study Plan
              </h2>
              <div className="space-y-4">
                {submission.plan.steps.map((step, index) => (
                  <div key={index} className="flex items-start p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <div className="w-6 h-6 bg-white border border-neutral-200 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-600 mr-3 shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{step.task}</p>
                      <p className="text-[10px] text-neutral-400 mt-0.5">{step.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submission Status Card */}
          {submission?.status === 'submitted' && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center text-green-700 font-bold">
                <CheckCircle className="w-5 h-5 mr-2" />
                Work Submitted
              </div>
              <p className="text-xs text-green-600 leading-relaxed">
                Your work has been successfully submitted. You can resubmit anytime before the deadline.
              </p>
              <div className="pt-4 border-t border-green-200">
                <p className="text-[10px] text-green-500 uppercase font-bold">Submitted on</p>
                <p className="text-sm font-bold text-green-700">{format(new Date(submission.createdAt), 'MMM d, h:mm a')}</p>
              </div>
            </div>
          )}

          {submission?.status === 'graded' && (
            <div className="bg-indigo-600 text-white rounded-2xl p-6 space-y-4 shadow-xl shadow-indigo-100">
              <div className="flex justify-between items-start">
                <h3 className="font-bold">Grade & Feedback</h3>
                <div className="bg-white/20 px-3 py-1 rounded-lg text-xl font-black">{submission.grade}</div>
              </div>
              <div className="bg-white/10 p-4 rounded-xl text-sm leading-relaxed italic">
                "{submission.feedback}"
              </div>
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
