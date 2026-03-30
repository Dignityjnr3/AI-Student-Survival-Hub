import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, BookOpen, UserCheck, FileText, ArrowRight, Shield, Zap, GraduationCap } from 'lucide-react';
import Footer from '../components/Footer';

export default function Home({ user, isDarkMode }: { user: any; isDarkMode: boolean }) {
  const navigate = useNavigate();

  const handleFeatureClick = (featureTitle: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    switch (featureTitle) {
      case "Mock Exam Generator":
        navigate('/mock-exams');
        break;
      case "Notes Simplifier":
        navigate('/notes');
        break;
      case "Smart Attendance":
        if (user.role === 'lecturer') {
          navigate('/lecturer-attendance');
        } else {
          navigate('/attendance');
        }
        break;
      case "Assignment Hub":
        navigate('/assignments');
        break;
      default:
        navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <GraduationCap className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mr-2" />
              <span className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight">Student Hub</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About</a>
              {user ? (
                <Link to="/dashboard" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Login</Link>
                  <Link to="/signup" className="px-5 py-2.5 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 dark:bg-indigo-900/20 rounded-full blur-[120px] opacity-50" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 dark:bg-purple-900/20 rounded-full blur-[120px] opacity-50" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-bold mb-6 border border-indigo-100 dark:border-indigo-800">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Powered Academic Excellence
            </span>
            <h1 className="text-5xl lg:text-7xl font-black text-neutral-900 dark:text-white tracking-tight mb-8 leading-[1.1]">
              Survive University with <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                Artificial Intelligence
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-xl text-neutral-600 dark:text-neutral-400 mb-10 leading-relaxed">
              The all-in-one platform for students and lecturers. Generate mock exams, simplify complex notes, and track attendance seamlessly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {user ? (
                <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center group">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center group">
                    Join Now
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-800 rounded-2xl font-bold text-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all flex items-center justify-center">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-20 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-3xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-2xl">
              <img 
                src="https://picsum.photos/seed/student/1200/600" 
                alt="App Preview" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-black/40 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-neutral-50 dark:bg-neutral-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
              Everything you need to succeed
            </h2>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto text-lg">
              Powerful tools designed specifically for the modern academic environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Mock Exam Generator",
                desc: "AI-generated timed tests from your course notes to prepare you for the real deal.",
                icon: BookOpen,
                color: "bg-blue-500"
              },
              {
                title: "Notes Simplifier",
                desc: "Turn complex, long-winded lectures into easy-to-understand summaries in seconds.",
                icon: FileText,
                color: "bg-purple-500"
              },
              {
                title: "Smart Attendance",
                desc: "Quick QR-based attendance tracking for both students and lecturers.",
                icon: UserCheck,
                color: "bg-green-500"
              },
              {
                title: "Assignment Hub",
                desc: "Manage submissions, get AI study plans, and track your grades in one place.",
                icon: Zap,
                color: "bg-amber-500"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                onClick={() => handleFeatureClick(feature.title)}
                className="bg-white dark:bg-neutral-950 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-sm hover:shadow-xl transition-all cursor-pointer group/card"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover/card:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-3 group-hover/card:text-indigo-600 dark:group-hover/card:text-indigo-400 transition-colors">{feature.title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400 leading-relaxed text-sm">
                  {feature.desc}
                </p>
                <div className="mt-6 flex items-center text-indigo-600 dark:text-indigo-400 text-sm font-bold opacity-0 group-hover/card:opacity-100 transition-opacity">
                  Try it now
                  <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white dark:bg-neutral-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Students", value: "10k+" },
              { label: "Exams Generated", value: "50k+" },
              { label: "Lecturers", value: "500+" },
              { label: "Success Rate", value: "98%" }
            ].map((stat, idx) => (
              <div key={idx}>
                <p className="text-4xl lg:text-5xl font-black text-indigo-600 dark:text-indigo-400 mb-2">{stat.value}</p>
                <p className="text-sm font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-600 rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-200 dark:shadow-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -ml-32 -mb-32" />
            
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-8 relative z-10">
              Ready to transform your academic journey?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              {user ? (
                <Link to="/dashboard" className="w-full sm:w-auto px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg">
                  Back to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="w-full sm:w-auto px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-all shadow-lg">
                    Create Free Account
                  </Link>
                  <Link to="/login" className="w-full sm:w-auto px-10 py-4 bg-indigo-700 text-white rounded-2xl font-bold text-lg hover:bg-indigo-800 transition-all">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
