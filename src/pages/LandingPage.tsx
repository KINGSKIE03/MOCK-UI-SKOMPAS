import { motion } from "motion/react";
import { UserRole } from "../types";
import { Shield, ArrowRight, Wallet, Users, Sparkles, CheckCircle2, FileCheck, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthProvider";
const logo = "/src/assets/images/input_file_0.png";

export function LandingPage() {
  const navigate = useNavigate();
  
  const roles: { 
    id: Exclude<UserRole, null>; 
    title: string; 
    description: string; 
    icon: any; 
    color: string; 
    accent: string;
    hoverBorder: string;
    hoverShadow: string;
    gradient: string;
  }[] = [
    {
      id: "Chairman",
      title: "SK Chairman",
      description: "Oversee youth programs, approve budget allocations, and lead the community vision.",
      icon: Shield,
      color: "bg-[#0C1E36]",
      accent: "text-[#0C1E36]",
      hoverBorder: "hover:border-[#0C1E36]/40",
      hoverShadow: "hover:shadow-indigo-500/10",
      gradient: "from-[#0C1E36]/10 to-indigo-500/5"
    },
    {
      id: "Secretary",
      title: "SK Secretary",
      description: "Manage official records and use AI to audit document compliance instantly.",
      icon: Users,
      color: "bg-[#0284C7]",
      accent: "text-[#0284C7]",
      hoverBorder: "hover:border-sky-500/40",
      hoverShadow: "hover:shadow-sky-500/10",
      gradient: "from-[#0284C7]/10 to-blue-500/5"
    },
    {
      id: "Treasurer",
      title: "SK Treasurer",
      description: "Handle fiscal plans and track budget utilization with intelligent forecasting.",
      icon: Wallet,
      color: "bg-[#C89311]",
      accent: "text-[#C89311]",
      hoverBorder: "hover:border-amber-500/40",
      hoverShadow: "hover:shadow-amber-500/10",
      gradient: "from-[#C89311]/10 to-yellow-500/5"
    },
    {
      id: "Admin",
      title: "DILG Officer",
      description: "Access executive monitoring boards, audit barangay timelines, and update criteria.",
      icon: Landmark,
      color: "bg-[#5B21B6]",
      accent: "text-[#5B21B6]",
      hoverBorder: "hover:border-purple-500/40",
      hoverShadow: "hover:shadow-purple-500/10",
      gradient: "from-[#5B21B6]/10 to-fuchsia-500/5"
    }
  ];

  const features = [
    { title: "Compliance Audit", desc: "Real-time AI check for SKU requirements.", icon: FileCheck },
    { title: "Smart Budgeting", desc: "Automated fiscal planning and reporting.", icon: Landmark },
    { title: "Explainable AI", desc: "Transparent feedback on every document status.", icon: Sparkles },
    { title: "Legal Integrity", desc: "Aligned with R.A. 10742 and latest guidelines.", icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[60vw] h-[60vw] bg-[#C89311]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-[#0284C7]/5 blur-[120px] rounded-full translate-y-1/4 -translate-x-1/4" />

      {/* Navigation */}
      <nav className="p-8 flex justify-between items-center z-20">
        <div className="text-2xl font-black tracking-tighter flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white ring-4 ring-[#0C1E36]/5 flex items-center justify-center overflow-hidden shadow-lg shadow-black/5 hover:scale-105 transition-transform duration-300">
            <img src={logo} alt="SKOMPAS Logo" className="w-full h-full object-cover scale-[1.42]" />
          </div>
          <span className="text-[#0C1E36]">SKOMPAS</span><span className="text-[#C89311]">.</span>
        </div>
        <div className="hidden lg:flex gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-[#888]">
          <a href="#" className="hover:text-[#0C1E36] transition-colors border-b-2 border-transparent hover:border-[#C89311]">The System</a>
          <a href="#" className="hover:text-[#0C1E36] transition-colors border-b-2 border-transparent hover:border-[#C89311]">Compliance API</a>
          <a href="#" className="hover:text-[#0C1E36] transition-colors border-b-2 border-transparent hover:border-[#C89311]">Research</a>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center z-10 px-6 pt-16 pb-24">
        {/* Header Section */}
        <div className="max-w-4xl w-full text-center mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-[#eee] rounded-full text-[10px] font-extrabold uppercase tracking-[0.25em] mb-10 shadow-sm text-[#C89311]"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered SK Advisory System
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black tracking-tight text-[#0C1E36] mb-10 leading-[0.9] text-balance"
          >
            Digital <span className="text-[#C89311]">Guardians</span> <br /> 
            of Youth Governance.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-[#666] leading-relaxed max-w-2xl mx-auto mb-16 font-medium"
          >
            Empowering the Sangguniang Kabataan with next-generation AI compliance audits, fiscal transparency, and intelligent document generation.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {features.map((f, i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-4 bg-white border border-[#eee] rounded-2xl shadow-sm hover:border-[#0C1E36] transition-colors">
                <f.icon className="w-5 h-5 text-[#C89311]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#0C1E36]">{f.title}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Role Selector Grid */}
        <div className="max-w-7xl w-full">
           <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-4">
             <div className="text-left">
               <h2 className="text-3xl font-black tracking-tight text-[#0C1E36] mb-2 uppercase italic">Launch Workspace</h2>
               <p className="text-[#888] font-medium">Select your designated portal to begin audit sessions.</p>
             </div>
             <div className="h-px bg-[#eee] flex-1 mx-8 hidden md:block" />
             <div className="text-[10px] font-black uppercase tracking-widest text-[#999]">Prototype V1.0.4</div>
           </div>

           <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {roles.map((role, idx) => (
                <motion.button
                  key={role.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 + 0.5 }}
                  onClick={() => navigate(`/login?role=${role.id}`)}
                  className={`group relative p-12 bg-white border border-zinc-200/80 rounded-[48px] text-left transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer shadow-sm ${role.hoverBorder} ${role.hoverShadow}`}
                >
                  {/* Decorative Gradient Background Node */}
                  <div className={`absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${role.gradient}`} />
                  
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-10 shadow-lg transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 text-white ${role.color}`}>
                    <role.icon className="w-8 h-8" />
                  </div>
                  
                  <h3 className="text-3xl font-black mb-4 tracking-tighter text-[#0C1E36] group-hover:text-amber-600 transition-colors">{role.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed mb-12 h-12 line-clamp-2 font-medium">
                    {role.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#0C1E36] border-b-2 border-transparent group-hover:border-amber-500 transition-all">Secure Access</span>
                    <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-200/60 flex items-center justify-center group-hover:bg-[#0C1E36] group-hover:text-white transition-all transform group-hover:translate-x-2">
                        <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </motion.button>
              ))}
           </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-12 py-16 border-t border-[#eee]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
              <div className="text-lg font-black tracking-tighter mb-4">SKOMPAS<span className="text-[#C89311]">.</span></div>
              <p className="text-xs font-semibold text-[#888] max-w-sm leading-loose">
                Designed for the next generation of public servants. Built with precision, integrity, and transparency.
              </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#999]">
             <p>© 2026 Sangguniang Kabataan Advisory System</p>
             <p>Capstone Project • Manila, Philippines</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
