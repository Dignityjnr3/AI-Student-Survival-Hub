import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { UserProfile, Course, Assignment } from '../types';
import { Users, BookOpen, FileText, Shield, Trash2, UserCog, Search, Activity, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile)));
    }, (error) => {
      console.error("Error fetching users:", error);
      // Don't throw here to avoid blank page, just log
    });

    const unsubCourses = onSnapshot(collection(db, 'courses'), (snapshot) => {
      setCourses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Course)));
    }, (error) => {
      console.error("Error fetching courses:", error);
    });

    const unsubAssignments = onSnapshot(collection(db, 'assignments'), (snapshot) => {
      setAssignments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assignment)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching assignments:", error);
      setLoading(false); // Still set loading to false so we can show what we have
    });

    return () => {
      unsubUsers();
      unsubCourses();
      unsubAssignments();
    };
  }, []);

  const handleUpdateRole = async (userId: string, newRole: 'student' | 'lecturer' | 'admin') => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get recent activity
  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
  const recentCourses = [...courses].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);
  const recentAssignments = [...assignments].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 dark:text-white space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        <p className="font-bold text-neutral-500">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <header>
        <h1 className="text-4xl font-black text-neutral-900 dark:text-white tracking-tight flex items-center gap-3">
          <Shield className="w-10 h-10 text-indigo-600" />
          Admin Control Center
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-2 text-lg">
          Manage users, courses, and platform-wide settings.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Total Users</p>
          <h3 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">{users.length}</h3>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4">
            <BookOpen className="w-6 h-6" />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Total Courses</p>
          <h3 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">{courses.length}</h3>
        </div>
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400 mb-4">
            <FileText className="w-6 h-6" />
          </div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">Total Assignments</p>
          <h3 className="text-3xl font-black text-neutral-900 dark:text-white mt-1">{assignments.length}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Section */}
        <section className="bg-white dark:bg-neutral-900 p-8 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 shadow-sm">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            Recent Activity
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Newest Users</h3>
              <div className="space-y-3">
                {recentUsers.map(u => (
                  <div key={u.uid} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-neutral-900 dark:text-white">{u.name}</p>
                        <p className="text-[10px] text-neutral-500">{u.role}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Newest Courses</h3>
              <div className="space-y-3">
                {recentCourses.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[150px]">{c.title}</p>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Newest Assignments</h3>
              <div className="space-y-3">
                {recentAssignments.map(a => (
                  <div key={a.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                        <FileText className="w-4 h-4" />
                      </div>
                      <p className="text-sm font-bold text-neutral-900 dark:text-white truncate max-w-[150px]">{a.title}</p>
                    </div>
                    <span className="text-[10px] text-neutral-400">
                      {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions / Platform Health */}
        <section className="bg-neutral-900 dark:bg-neutral-800 p-8 rounded-[2.5rem] text-white shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-6">Platform Overview</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-neutral-800 p-4 rounded-2xl border border-neutral-700">
                <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">Student Ratio</p>
                <p className="text-2xl font-black">
                  {users.length > 0 ? Math.round((users.filter(u => u.role === 'student').length / users.length) * 100) : 0}%
                </p>
              </div>
              <div className="bg-neutral-800 p-4 rounded-2xl border border-neutral-700">
                <p className="text-neutral-400 text-xs font-bold uppercase tracking-wider mb-1">Lecturer Ratio</p>
                <p className="text-2xl font-black">
                  {users.length > 0 ? Math.round((users.filter(u => u.role === 'lecturer').length / users.length) * 100) : 0}%
                </p>
              </div>
            </div>
            <div className="mt-8 p-6 bg-indigo-600 rounded-3xl">
              <h3 className="font-bold mb-2">System Status</h3>
              <div className="flex items-center gap-2 text-indigo-100 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                All systems operational
              </div>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
        </section>
      </div>

      <section className="bg-white dark:bg-neutral-900 rounded-[2.5rem] border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-sm">
        <div className="p-8 border-b border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">User Management</h2>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input 
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-950/50">
                <th className="px-8 py-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">User</th>
                <th className="px-8 py-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Role</th>
                <th className="px-8 py-4 text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {filteredUsers.map((u) => (
                <tr key={u.uid} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <select 
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.uid, e.target.value as any)}
                      className="bg-neutral-100 dark:bg-neutral-800 border-none rounded-lg px-3 py-1 text-sm font-medium text-neutral-700 dark:text-neutral-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="student">Student</option>
                      <option value="lecturer">Lecturer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleDeleteUser(u.uid)}
                        className="p-2 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
