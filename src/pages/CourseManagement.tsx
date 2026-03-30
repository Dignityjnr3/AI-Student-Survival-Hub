import { useState, useEffect, FormEvent } from 'react';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, Course } from '../types';
import { 
  Plus, BookOpen, Trash2, Edit2, X, Check, Search, 
  AlertCircle, Loader2, ChevronRight, Book
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { safeFormat } from '../lib/dateUtils';

interface CourseManagementProps {
  user: UserProfile;
}

export default function CourseManagement({ user }: CourseManagementProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form states
  const [title, setTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'courses'), 
      where('lecturerId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'courses');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const resetForm = () => {
    setTitle('');
    setCourseCode('');
    setDescription('');
    setEditingCourse(null);
  };

  const handleCreateCourse = async (e: FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const courseCodeRegex = /^[A-Z0-9\s]+$/;
    if (!courseCodeRegex.test(courseCode.toUpperCase())) {
      alert('Course code must be alphanumeric and contain only capital letters and numbers.');
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'courses'), {
        lecturerId: user.uid,
        title,
        courseCode: courseCode.toUpperCase(),
        description,
        createdAt: new Date().toISOString()
      });
      setShowCreateModal(false);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'courses');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCourse = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingCourse || isSubmitting) return;
    setIsSubmitting(true);

    try {
      await updateDoc(doc(db, 'courses', editingCourse.id), {
        title,
        courseCode: courseCode.toUpperCase(),
        description
      });
      setEditingCourse(null);
      resetForm();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `courses/${editingCourse.id}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course? This will not delete associated assignments but they may become orphaned.')) return;

    try {
      await deleteDoc(doc(db, 'courses', courseId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `courses/${courseId}`);
    }
  };

  const startEditing = (course: Course) => {
    setEditingCourse(course);
    setTitle(course.title);
    setCourseCode(course.courseCode);
    setDescription(course.description);
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.courseCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 dark:text-white space-y-4">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
        <p className="font-bold text-neutral-500">Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
            <BookOpen className="w-10 h-10 text-indigo-600" />
            Course Management
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-lg">
            Create, edit, and manage your academic courses.
          </p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
        >
          <Plus className="w-5 h-5" />
          New Course
        </button>
      </header>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input 
          type="text"
          placeholder="Search by title or course code..."
          className="w-full pl-12 pr-4 py-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[1.5rem] text-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredCourses.length === 0 ? (
        <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] p-16 text-center border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="w-20 h-20 bg-neutral-50 dark:bg-neutral-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-neutral-400">
            <Book className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">No courses found</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2 max-w-md mx-auto">
            {searchTerm ? "Try adjusting your search terms." : "Start by creating your first course to manage assignments and attendance."}
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
            >
              Create First Course
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div 
              key={course.id}
              className="bg-white dark:bg-neutral-900 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 p-8 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BookOpen className="w-7 h-7" />
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => startEditing(course)}
                    className="p-2 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                    title="Edit Course"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteCourse(course.id)}
                    className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    title="Delete Course"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-black rounded uppercase tracking-wider">
                    {course.courseCode}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-medium">
                    Created {safeFormat(course.createdAt, 'MMM d, yyyy')}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed line-clamp-3">
                  {course.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-500">
                      U{i}
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-white dark:border-neutral-900 bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">
                    +
                  </div>
                </div>
                <Link 
                  to="/assignments" 
                  className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 hover:gap-2 transition-all"
                >
                  Manage Assignments <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {(showCreateModal || editingCourse) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black text-neutral-900 dark:text-white tracking-tight">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h2>
              <button 
                onClick={() => { setShowCreateModal(false); resetForm(); }}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">Course Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Advanced Web Development"
                    className="w-full px-5 py-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">Course Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSC 401"
                    className="w-full px-5 py-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold mb-2 text-neutral-700 dark:text-neutral-300">Description</label>
                <textarea
                  required
                  placeholder="Provide a brief overview of the course objectives and content..."
                  className="w-full px-5 py-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white h-32 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); resetForm(); }}
                  className="flex-1 px-6 py-4 border border-neutral-200 dark:border-neutral-800 rounded-2xl font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
