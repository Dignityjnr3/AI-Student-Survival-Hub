import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { UserRole } from '../types';
import { Eye, EyeOff } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  const [title, setTitle] = useState('Mr');
  const [courseTitle, setCourseTitle] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validations
    if (role === 'lecturer') {
      const courseCodeRegex = /^[A-Z0-9]+$/;
      if (!courseCodeRegex.test(courseCode)) {
        setError('Course code must be Alphanumeric and Capital letters only.');
        setLoading(false);
        return;
      }
    }

    if (role === 'student') {
      const regNumberRegex = /^[0-9/]+$/;
      if (!regNumberRegex.test(regNumber)) {
        setError('Registration number must contain only numbers and "/" character.');
        setLoading(false);
        return;
      }
    }

    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      const userData: any = {
        uid: user.uid,
        name,
        email,
        role: email === 'austineemeka2003cares@gmail.com' ? 'admin' : role,
        createdAt: new Date().toISOString()
      };

      if (role === 'lecturer') {
        userData.title = title;
        userData.courseTitle = courseTitle;
        userData.courseCode = courseCode;
      } else if (role === 'student') {
        userData.regNumber = regNumber;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      // Automatically add the initial course for lecturers
      if (role === 'lecturer') {
        await addDoc(collection(db, 'courses'), {
          lecturerId: user.uid,
          title: courseTitle,
          courseCode: courseCode.toUpperCase(),
          description: `Initial course created during signup for ${courseTitle}`,
          createdAt: new Date().toISOString()
        });
      }

      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-8 my-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Create Account</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">Join the AI Student Hub</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">I am a...</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('student')}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                  role === 'student'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300'
                    : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }`}
              >
                Student
              </button>
              <button
                type="button"
                onClick={() => setRole('lecturer')}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                  role === 'lecturer'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-400 dark:text-indigo-300'
                    : 'bg-white border-neutral-300 text-neutral-600 hover:bg-neutral-50 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-700'
                }`}
              >
                Lecturer
              </button>
            </div>
          </div>

          {role === 'lecturer' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Title</label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                >
                  <option value="Mr">Mr</option>
                  <option value="Mrs">Mrs</option>
                  <option value="Ms">Ms</option>
                  <option value="Dr">Dr</option>
                  <option value="Prof">Prof</option>
                  <option value="Engr">Engr</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Course Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="Introduction to Computer Science"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Course Code</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  placeholder="CSC101"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                />
              </div>
            </div>
          )}

          {role === 'student' && (
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Registration Number</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                placeholder="2024/123456"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="you@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none pr-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
