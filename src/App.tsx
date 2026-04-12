import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { UserProfile } from './types';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import AssignmentDetail from './pages/AssignmentDetail';
import NotesSimplifierPage from './pages/NotesSimplifier';
import MockExamGenerator from './pages/MockExamGenerator';
import AttendanceScanner from './pages/AttendanceScanner';
import LecturerSubmissions from './pages/LecturerSubmissions';
import LecturerAttendance from './pages/LecturerAttendance';
import Assignments from './pages/Assignments';
import AdminDashboard from './pages/AdminDashboard';
import CourseManagement from './pages/CourseManagement';
import Layout from './components/Layout';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      // Default to system preference if no stored theme
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    console.log("App: Initializing auth listener...");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("App: Auth state changed, user:", firebaseUser?.uid);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as UserProfile;
            console.log("App: User profile found, role:", userData.role);
            // Automatically upgrade default admin email to admin role
            if (firebaseUser.email?.toLowerCase() === 'austineemeka2003cares@gmail.com' && userData.role !== 'admin') {
              try {
                await updateDoc(userDocRef, { role: 'admin' });
                userData.role = 'admin';
                console.log("App: User auto-upgraded to admin role");
              } catch (err) {
                console.error("App: Failed to auto-upgrade admin role:", err);
              }
            }
            setUser(userData);
          } else if (firebaseUser.email?.toLowerCase() === 'austineemeka2003cares@gmail.com') {
            // Create profile for bootstrap admin if it doesn't exist
            const newAdmin: UserProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'System Admin',
              email: firebaseUser.email!,
              role: 'admin',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newAdmin);
            console.log("App: Created new admin profile for bootstrap email");
            setUser(newAdmin);
          } else {
            // User exists in Auth but not in Firestore (and not bootstrap admin)
            console.warn("App: User exists in Auth but no Firestore profile found.");
            setUser(null);
          }
        } catch (error) {
          console.error("App: Error fetching user profile:", error);
          setUser(null);
        }
      } else {
        console.log("App: No user logged in.");
        setUser(null);
      }
      setLoading(false);
      console.log("App: Loading finished.");
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setIsDarkMode(e.matches);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    const themeColor = isDarkMode ? '#0a0a0a' : '#f9fafb';
    let meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', themeColor);

    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-neutral-50 dark:bg-neutral-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home user={user} isDarkMode={isDarkMode} />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" />} />
        
        <Route element={user ? <Layout user={user} isDarkMode={isDarkMode} /> : <Navigate to="/login" />}>
          <Route path="/dashboard" element={<Dashboard user={user} />} />
          <Route path="/assignments" element={<Assignments user={user} />} />
          <Route path="/assignment/:id" element={<AssignmentDetail user={user} />} />
          <Route path="/courses" element={(user?.role === 'lecturer' || user?.role === 'admin') ? <CourseManagement user={user} /> : <Navigate to="/dashboard" />} />
          <Route path="/notes" element={<NotesSimplifierPage />} />
          <Route path="/mock-exams" element={<MockExamGenerator />} />
          <Route path="/attendance" element={user?.role === 'student' ? <AttendanceScanner user={user} /> : <Navigate to="/dashboard" />} />
          <Route path="/submissions" element={user?.role === 'lecturer' ? <LecturerSubmissions user={user} /> : <Navigate to="/dashboard" />} />
          <Route path="/lecturer-attendance" element={user?.role === 'lecturer' ? <LecturerAttendance user={user} /> : <Navigate to="/dashboard" />} />
          <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/dashboard" />} />
        </Route>
      </Routes>
    </Router>
  );
}
