import { ReactNode, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { UserProfile } from '../types';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { LayoutDashboard, BookOpen, FileText, LogOut, User, Menu, X, Shield, Users } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  user: UserProfile;
  isDarkMode: boolean;
}

export default function Layout({ user, isDarkMode }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const studentNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Assignments', path: '/assignments', icon: FileText },
    { name: 'Mock Exams', path: '/mock-exams', icon: BookOpen },
    { name: 'Attendance', path: '/attendance', icon: User },
    { name: 'Notes Simplifier', path: '/notes', icon: FileText },
  ];

  const lecturerNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Course Management', path: '/courses', icon: BookOpen },
    { name: 'Assignments', path: '/assignments', icon: FileText },
    { name: 'Submissions', path: '/submissions', icon: FileText },
    { name: 'Attendance Tracking', path: '/lecturer-attendance', icon: Users },
  ];
  
  const adminNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Admin Panel', path: '/admin', icon: Shield },
    { name: 'Assignments', path: '/assignments', icon: FileText },
    { name: 'Courses', path: '/courses', icon: BookOpen },
  ];
  
  const navItems = user?.role === 'admin' ? adminNavItems : (user?.role === 'lecturer' ? lecturerNavItems : studentNavItems);

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 font-sans overflow-hidden transition-colors duration-300">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between px-4 z-40">
        <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">Student Hub</Link>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col z-50 transition-transform duration-300 transform lg:translate-x-0 lg:static",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 hidden lg:flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">Student Hub</Link>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 mt-16 lg:mt-0">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400"
                  : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center px-4 py-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-xs mr-3">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{user.name}</p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate capitalize">{user.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-20 lg:pt-8">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
