import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, Assignment, Submission } from '../types';
import { FileText, Clock, CheckCircle, ChevronRight, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { motion } from 'motion/react';

interface AssignmentsProps {
  user: UserProfile;
}

export default function Assignments({ user }: AssignmentsProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  if (!user) return null;

  useEffect(() => {
    const q = user.role === 'student' 
      ? query(collection(db, 'assignments'), orderBy('deadline', 'asc'))
      : query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'assignments');
    });

    if (user.role === 'student') {
      const subQ = query(collection(db, 'submissions'), where('studentId', '==', user.uid));
      const subUnsubscribe = onSnapshot(subQ, (snapshot) => {
        setSubmissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Submission)));
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'submissions');
      });
      return () => {
        unsubscribe();
        subUnsubscribe();
      };
    }

    return () => unsubscribe();
  }, [user.uid, user.role]);

  const getStatus = (assignmentId: string) => {
    const submission = submissions.find(s => s.assignmentId === assignmentId);
    if (submission) return 'submitted';
    
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment && new Date(assignment.deadline) < new Date()) return 'overdue';
    
    return 'pending';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">Assignment Hub</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2">
          {user.role === 'student' 
            ? 'Manage your academic tasks and track your submissions.' 
            : (user.role === 'admin' ? 'Monitor all platform assignments and submissions.' : 'Track the assignments you have created for your students.')}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {assignments.length === 0 ? (
          <div className="bg-white dark:bg-neutral-900 p-12 rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 text-center">
            <div className="w-16 h-16 bg-neutral-50 dark:bg-neutral-800 rounded-2xl flex items-center justify-center text-neutral-400 mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-900 dark:text-white">No assignments found</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">Check back later for new tasks.</p>
          </div>
        ) : (
          assignments.map((assignment, index) => {
            const status = getStatus(assignment.id);
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={assignment.id}
              >
                <Link
                  to={`/assignment/${assignment.id}`}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      status === 'submitted' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400' :
                      status === 'overdue' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' :
                      'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {assignment.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due {assignment.deadline ? format(new Date(assignment.deadline), 'MMM d, h:mm a') : 'N/A'}
                        </span>
                        {user.role === 'student' && (
                          <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${
                            status === 'submitted' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                            status === 'overdue' ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' :
                            'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300'
                          }`}>
                            {status === 'submitted' ? <CheckCircle className="w-3 h-3" /> : 
                             status === 'overdue' ? <AlertCircle className="w-3 h-3" /> : 
                             <Clock className="w-3 h-3" />}
                            <span className="capitalize">{status}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    View Details <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
