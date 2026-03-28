import { useState, useEffect, FormEvent } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, Assignment, Course, Submission } from '../types';
import { 
  Plus, Calendar, CheckCircle, Clock, BookOpen, ChevronRight, 
  Brain, Camera, FileText, Users, ArrowRight, User, Shield 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { clsx } from 'clsx';

interface DashboardProps {
  user: UserProfile;
}

export default function Dashboard({ user }: DashboardProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showCreateCourse, setShowCreateCourse] = useState(false);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!user) return null;

  // Form states
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDesc, setNewAssignmentDesc] = useState('');
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');

  useEffect(() => {
    if (user.role === 'student') {
      const q = query(collection(db, 'assignments'), orderBy('deadline', 'asc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'assignments');
      });
      
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
    } else if (user.role === 'lecturer') {
      const q = query(collection(db, 'courses'), where('lecturerId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const coursesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course));
        setCourses(coursesData);
        if (coursesData.length > 0 && !selectedCourseId) {
          setSelectedCourseId(coursesData[0].id);
        }
        setLoading(false);
      }, (error) => {
        handleFirestoreError(error, OperationType.LIST, 'courses');
      });

      return () => unsubscribe();
    } else if (user.role === 'admin') {
      // Admins see all courses and assignments
      const qCourses = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));
      const unsubCourses = onSnapshot(qCourses, (snapshot) => {
        setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'courses'));

      const qAssignments = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
      const unsubAssignments = onSnapshot(qAssignments, (snapshot) => {
        setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
        setLoading(false);
      }, (error) => handleFirestoreError(error, OperationType.LIST, 'assignments'));

      return () => {
        unsubCourses();
        unsubAssignments();
      };
    }
  }, [user.uid, user.role, selectedCourseId]);

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'courses'), {
        lecturerId: user.uid,
        title: newCourseTitle,
        description: newCourseDesc,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'courses');
    }
    setNewCourseTitle('');
    setNewCourseDesc('');
    setShowCreateCourse(false);
  };

  const handleCreateAssignment = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'assignments'), {
        courseId: selectedCourseId,
        title: newAssignmentTitle,
        description: newAssignmentDesc,
        deadline: newAssignmentDeadline,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'assignments');
    }
    setNewAssignmentTitle('');
    setNewAssignmentDesc('');
    setNewAssignmentDeadline('');
    setShowCreateAssignment(false);
  };

  const studentFeatures = [
    {
      title: 'Mock Exam Generator',
      description: 'Generate practice exams from your course materials using AI.',
      icon: <Brain className="w-6 h-6" />,
      link: '/exams',
      lightColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      title: 'Notes Simplifier',
      description: 'Upload complex notes and get simplified summaries.',
      icon: <BookOpen className="w-6 h-6" />,
      link: '/notes',
      lightColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Smart Attendance',
      description: 'Quickly mark your attendance by scanning QR codes.',
      icon: <Camera className="w-6 h-6" />,
      link: '/attendance',
      lightColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Assignment Hub',
      description: 'View and submit your assignments in one place.',
      icon: <FileText className="w-6 h-6" />,
      link: '/assignments',
      lightColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  ];

  const lecturerFeatures = [
    {
      title: 'Course Management',
      description: 'Create and manage your courses and students.',
      icon: <BookOpen className="w-6 h-6" />,
      link: '/courses',
      lightColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      title: 'Attendance Tracking',
      description: 'Generate QR codes and monitor student attendance.',
      icon: <Users className="w-6 h-6" />,
      link: '/lecturer-attendance',
      lightColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      title: 'Assignment Portal',
      description: 'Create assignments and grade submissions.',
      icon: <FileText className="w-6 h-6" />,
      link: '/assignments',
      lightColor: 'bg-orange-50 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400'
    }
  ];

  const adminFeatures = [
    {
      title: 'Admin Control Center',
      description: 'Manage users, roles, and platform settings.',
      icon: <Shield className="w-6 h-6" />,
      link: '/admin',
      lightColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400'
    },
    {
      title: 'Platform Analytics',
      description: 'View overall engagement and usage stats.',
      icon: <Users className="w-6 h-6" />,
      link: '/admin',
      lightColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400'
    }
  ];

  const features = user.role === 'admin' ? adminFeatures : (user.role === 'lecturer' ? lecturerFeatures : studentFeatures);

  if (loading) {
    return <div className="flex justify-center p-12 dark:text-white">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight">
            Welcome back, <span className="text-indigo-600 dark:text-indigo-400">{user.name.split(' ')[0]}</span>!
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-lg">
            Here's what's happening with your academic journey today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {user.role === 'admin' && (
            <Link 
              to="/admin"
              className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-200 dark:shadow-none mr-2"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          )}
          <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 p-2 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div className="pr-4">
              <p className="text-sm font-bold text-neutral-900 dark:text-white">{user.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Courses</p>
          <h3 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">{user.role === 'lecturer' ? courses.length : 'Active'}</h3>
        </div>
        
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4 group-hover:scale-110 transition-transform">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Assignments</p>
          <h3 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">{assignments.length}</h3>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform">
            <CheckCircle className="w-6 h-6" />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Completed</p>
          <h3 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">{submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length}</h3>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-md transition-all group">
          <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
            <Brain className="w-6 h-6" />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">AI Credits</p>
          <h3 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">Unlimited</h3>
        </div>
      </div>

      <section className="space-y-6">
        <div className="flex justify-between items-end">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Quick Actions</h2>
          {user.role === 'lecturer' && (
            <div className="flex gap-2">
              <button 
                onClick={() => setShowCreateCourse(true)}
                className="px-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-xl text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
              >
                + Course
              </button>
              <button 
                onClick={() => setShowCreateAssignment(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
              >
                + Assignment
              </button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link 
              key={index} 
              to={feature.link}
              className="group bg-white dark:bg-neutral-900 p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className={clsx(
                "w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300",
                feature.lightColor,
                feature.textColor
              )}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-6 flex items-center text-sm font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                Get Started <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4">Need help with your studies?</h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-md">
              Our AI assistant can help you summarize notes, generate practice questions, and more.
            </p>
            <Link 
              to="/notes" 
              className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Try AI Notes <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-indigo-700 rounded-full blur-3xl opacity-50 group-hover:scale-110 transition-transform duration-700"></div>
        </div>

        <div className="bg-neutral-900 dark:bg-neutral-800 rounded-[2.5rem] p-10 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {user.role === 'student' ? (
                assignments.slice(0, 2).map((assignment) => (
                  <div key={assignment.id} className="flex items-center gap-4 bg-neutral-800 dark:bg-neutral-700/50 p-4 rounded-2xl border border-neutral-700 dark:border-neutral-600">
                    <div className="w-10 h-10 bg-orange-500/20 text-orange-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{assignment.title}</p>
                      <p className="text-xs text-neutral-400">Due {assignment.deadline ? format(new Date(assignment.deadline), 'MMM d') : 'N/A'}</p>
                    </div>
                  </div>
                ))
              ) : (
                courses.slice(0, 2).map((course) => (
                  <div key={course.id} className="flex items-center gap-4 bg-neutral-800 dark:bg-neutral-700/50 p-4 rounded-2xl border border-neutral-700 dark:border-neutral-600">
                    <div className="w-10 h-10 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">{course.title}</p>
                      <p className="text-xs text-neutral-400">Created {course.createdAt ? format(new Date(course.createdAt), 'MMM d') : 'N/A'}</p>
                    </div>
                  </div>
                ))
              )}
              {((user.role === 'student' && assignments.length === 0) || (user.role !== 'student' && courses.length === 0)) && (
                <p className="text-neutral-500 italic">No recent activity to show.</p>
              )}
            </div>
            <Link 
              to={user.role === 'student' ? '/assignments' : (user.role === 'admin' ? '/admin' : '/courses')} 
              className="inline-flex items-center mt-8 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
            >
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">Create New Course</h2>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Mathematics"
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">Description</label>
                <textarea
                  required
                  placeholder="What will students learn?"
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white h-32 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newCourseDesc}
                  onChange={(e) => setNewCourseDesc(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateCourse(false)}
                  className="flex-1 px-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCreateAssignment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-3xl max-w-md w-full p-8 shadow-2xl border border-neutral-200 dark:border-neutral-800">
            <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-white">Create New Assignment</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">Course</label>
                <select
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                  {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">Assignment Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newAssignmentTitle}
                  onChange={(e) => setNewAssignmentTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">Description</label>
                <textarea
                  required
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white h-24 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newAssignmentDesc}
                  onChange={(e) => setNewAssignmentDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">Deadline</label>
                <input
                  type="datetime-local"
                  required
                  className="w-full px-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                  value={newAssignmentDeadline}
                  onChange={(e) => setNewAssignmentDeadline(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateAssignment(false)}
                  className="flex-1 px-4 py-3 border border-neutral-200 dark:border-neutral-800 rounded-xl font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 dark:shadow-none"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
