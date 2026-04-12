import { Link } from 'react-router-dom';
import { 
  GraduationCap, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle, 
  Mail, 
  MapPin, 
  ArrowUp,
  Send
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const teamMembers = [
    { name: "Odo Augustine Chukwuemeka", phone: "+2349069977191", role: "Lead Developer" },
    { name: "Nnadi Gideon Chizaram", phone: "+2348120172104", role: "Technical Lead" },
    { name: "Wisdom Chinazom Elochukwu", phone: "+2348169218855", role: "Project Coordinator" }
  ];

  const supportMembers = [
    { name: "OMEKE CHINONSO HENRY", phone: "+2348053630051", role: "Support Specialist" },
    { name: "Onogu Isaac Ojonugwa", phone: "+2349056423754", role: "Community Manager" }
  ];

  return (
    <footer className="relative bg-neutral-950 text-neutral-300 pt-20 pb-10 overflow-hidden">
      {/* Subtle Glow Effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: About */}
          <div className="space-y-6 lg:col-span-1">
            <div className="flex items-center">
              <GraduationCap className="w-10 h-10 text-indigo-500 mr-3" />
              <span className="text-xl font-black text-white tracking-tight leading-tight">
                AI Student <br /> Survival Hub
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-sm">
              Helping students plan, survive, and succeed academically with smart AI-powered tools. Your ultimate academic companion for the modern university journey.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: MessageCircle, href: "https://wa.me/2349069977191", label: "WhatsApp" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Linkedin, href: "#", label: "LinkedIn" }
              ].map((social, idx) => (
                <a 
                  key={idx}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all duration-300 group"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Contact Team */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8 relative inline-block">
              Contact Team
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-indigo-500 rounded-full" />
            </h4>
            <div className="space-y-6">
              {teamMembers.map((member, idx) => (
                <div key={idx} className="group p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/50 hover:bg-neutral-900 hover:border-indigo-500/30 transition-all duration-300">
                  <p className="text-white font-bold mb-1 group-hover:text-indigo-400 transition-colors">{member.name}</p>
                  <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">{member.role}</p>
                  <a 
                    href={`https://wa.me/${member.phone.replace('+', '')}`}
                    className="inline-flex items-center text-sm text-indigo-500 hover:text-indigo-400 transition-colors font-medium"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {member.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: Support */}
          <div>
            <h4 className="text-white font-bold text-lg mb-8 relative inline-block">
              Support
              <span className="absolute -bottom-2 left-0 w-8 h-1 bg-purple-500 rounded-full" />
            </h4>
            <div className="space-y-6">
              {supportMembers.map((member, idx) => (
                <div key={idx} className="group p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/50 hover:bg-neutral-900 hover:border-purple-500/30 transition-all duration-300">
                  <p className="text-white font-bold mb-1 group-hover:text-purple-400 transition-colors">{member.name}</p>
                  <p className="text-xs text-neutral-500 mb-2 uppercase tracking-wider">{member.role}</p>
                  <a 
                    href={`https://wa.me/${member.phone.replace('+', '')}`}
                    className="inline-flex items-center text-sm text-purple-500 hover:text-purple-400 transition-colors font-medium"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {member.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Column 4: Contact Info & Newsletter */}
          <div className="space-y-8">
            <div>
              <h4 className="text-white font-bold text-lg mb-8 relative inline-block">
                Contact Info
                <span className="absolute -bottom-2 left-0 w-8 h-1 bg-amber-500 rounded-full" />
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start text-neutral-400">
                  <MapPin className="w-5 h-5 text-indigo-500 mr-3 mt-1 shrink-0" />
                  <span className="text-sm leading-relaxed">
                    VTE Faculty Building, University of Nigeria, Nsukka, Enugu State, Nigeria
                  </span>
                </li>
                <li className="flex items-center text-neutral-400">
                  <Mail className="w-5 h-5 text-indigo-500 mr-3 shrink-0" />
                  <a href="mailto:support@aistudentsurvivalhub.com" className="text-sm hover:text-white transition-colors">
                    support@aistudentsurvivalhub.com
                  </a>
                </li>
              </ul>
            </div>

            <div className="pt-4">
              <h5 className="text-white font-bold text-sm mb-4 uppercase tracking-widest">Newsletter</h5>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all pr-12"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links & Back to Top */}
        <div className="py-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold uppercase tracking-widest">
            <Link to="/" className="text-neutral-500 hover:text-white transition-colors">Home</Link>
            <a href="#about" className="text-neutral-500 hover:text-white transition-colors">About</a>
            <a href="#features" className="text-neutral-500 hover:text-white transition-colors">Features</a>
            <a href="#contact" className="text-neutral-500 hover:text-white transition-colors">Contact</a>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="group flex items-center gap-2 text-neutral-500 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
          >
            Back to Top
            <div className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center group-hover:border-white group-hover:-translate-y-1 transition-all">
              <ArrowUp className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-4 text-center">
          <p className="text-neutral-500 text-xs">
            © 2026 AI Student Survival Hub. All rights reserved.
          </p>
          <div className="flex space-x-6 text-xs font-medium text-neutral-600">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
