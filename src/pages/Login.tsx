import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [identifier, setIdentifier] = useState(''); // Email or Reg Number
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let loginEmail = identifier;

      // Check if identifier is an email. If not, assume it's a reg number.
      const isEmail = identifier.includes('@');
      if (!isEmail) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('regNumber', '==', identifier));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          throw new Error('No user found with this registration number.');
        }
        
        loginEmail = querySnapshot.docs[0].data().email;
      }

      await signInWithEmailAndPassword(auth, loginEmail, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4 transition-colors duration-300">
      <div className="max-w-md w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-800 p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white tracking-tight">Welcome Back</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mt-2">Log in to your AI Student Hub</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900/30">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Email or Registration Number</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
              placeholder="you@university.edu or 2024/123456"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
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
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
