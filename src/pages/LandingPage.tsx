import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserRole } from "../types";
import { 
  Shield, 
  ArrowRight, 
  Wallet, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  FileCheck, 
  Landmark, 
  Compass, 
  FileText, 
  Award, 
  ChevronRight, 
  Building2,
  GraduationCap,
  HeartPulse,
  Briefcase,
  Scale,
  Globe,
  Leaf,
  Sprout,
  Vote,
  Search,
  Check,
  UserPlus
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MUNICIPAL_BARANGAYS_40 } from "../lib/barangayStore";
const logo = "/src/assets/images/input_file_0.png";

export function LandingPage() {
  const navigate = useNavigate();
  const [selectedCenter, setSelectedCenter] = useState<number>(0);
  const [barangaySearch, setBarangaySearch] = useState("");
  
  const roles: { 
    id: Exclude<UserRole, null>; 
    title: string; 
    roleTag: string;
    description: string; 
    icon: any; 
    color: string; 
    accent: string;
    border: string;
    hoverBorder: string;
    hoverShadow: string;
    gradient: string;
    badgeColor: string;
  }[] = [
    {
      id: "Chairman",
      title: "SK Chairman",
      roleTag: "Executive Leadership",
      description: "Oversee 3-year CBYDP priorities, approve annual budgets, and lead municipal youth initiatives.",
      icon: Shield,
      color: "bg-[#0C1E36]",
      accent: "text-[#0C1E36]",
      border: "border-slate-200/80",
      hoverBorder: "hover:border-[#0C1E36]",
      hoverShadow: "hover:shadow-xl hover:shadow-[#0C1E36]/10",
      gradient: "from-[#0C1E36]/15 via-indigo-500/5 to-transparent",
      badgeColor: "bg-[#0C1E36]/10 text-[#0C1E36]"
    },
    {
      id: "Secretary",
      title: "SK Secretary",
      roleTag: "Statutory Documentation",
      description: "Manage official resolutions, CBYDP & ABYIP templates, and audit documentation readiness.",
      icon: Users,
      color: "bg-[#0284C7]",
      accent: "text-[#0284C7]",
      border: "border-sky-200/80",
      hoverBorder: "hover:border-sky-600",
      hoverShadow: "hover:shadow-xl hover:shadow-sky-500/10",
      gradient: "from-[#0284C7]/15 via-sky-500/5 to-transparent",
      badgeColor: "bg-sky-100 text-sky-800"
    },
    {
      id: "Treasurer",
      title: "SK Treasurer",
      roleTag: "Fiscal Administration",
      description: "Track the 10% Barangay Youth Fund, generate annual budget reports, and balance appropriations.",
      icon: Wallet,
      color: "bg-[#C89311]",
      accent: "text-[#C89311]",
      border: "border-amber-200/80",
      hoverBorder: "hover:border-amber-600",
      hoverShadow: "hover:shadow-xl hover:shadow-amber-500/10",
      gradient: "from-[#C89311]/15 via-amber-500/5 to-transparent",
      badgeColor: "bg-amber-100 text-amber-900"
    },
    {
      id: "Admin",
      title: "LYDO Officer",
      roleTag: "Municipal Oversight",
      description: "Monitor submission compliance across all 40 barangays of Laak, Davao de Oro with executive analytics.",
      icon: Landmark,
      color: "bg-[#5B21B6]",
      accent: "text-[#5B21B6]",
      border: "border-purple-200/80",
      hoverBorder: "hover:border-purple-600",
      hoverShadow: "hover:shadow-xl hover:shadow-purple-500/10",
      gradient: "from-[#5B21B6]/15 via-fuchsia-500/5 to-transparent",
      badgeColor: "bg-purple-100 text-purple-900"
    }
  ];

  const statutoryPillars = [
    { label: "CBYDP 3-Year Plan", desc: "10 NYC Centers of Participation", icon: FileText },
    { label: "Annual ABYIP Mapping", desc: "Direct 1:1 PPA programmatic alignment", icon: Compass },
    { label: "Automatic PDF Export", desc: "Landscape layout with standard tables", icon: FileCheck },
    { label: "R.A. 10742 & 11768", desc: "SK Reform Act statutory compliance", icon: CheckCircle2 },
  ];

  const nycCenters = [
    {
      num: "01",
      name: "Governance",
      tagline: "Leadership & Administrative Capability",
      icon: Shield,
      color: "text-[#0C1E36]",
      bg: "bg-[#0C1E36]/10",
      description: "Logistical and administrative capability building for SK officials, Linggo ng Kabataan observances, official fidelity bonding, and operational supplies.",
      examplePpa: "Capacity development seminars, Linggo ng Kabataan celebrations, and SK session operational equipment."
    },
    {
      num: "02",
      name: "Health",
      tagline: "Mental Wellness & Adolescent Health",
      icon: HeartPulse,
      color: "text-rose-600",
      bg: "bg-rose-50",
      description: "Preventative healthcare, youth mental wellness counseling centers, adolescent reproductive health, and substance abuse awareness programs.",
      examplePpa: "Youth Mental Health Symposia, blood donation drives, and anti-smoking/vaping campaigns."
    },
    {
      num: "03",
      name: "Education",
      tagline: "Equitable Access & Skills Development",
      icon: GraduationCap,
      color: "text-blue-600",
      bg: "bg-blue-50",
      description: "Educational assistance grants, alternative learning system (ALS) support, book drives, and career coaching workshops for out-of-school youth.",
      examplePpa: "Tertiary scholarship incentives, school supply distributions, and college entrance exam review sessions."
    },
    {
      num: "04",
      name: "Economic Empowerment",
      tagline: "Youth Livelihood & Entrepreneurship",
      icon: Briefcase,
      color: "text-amber-600",
      bg: "bg-amber-50",
      description: "Skills training, entrepreneurship seed grants, technical vocational linkages with TESDA, and youth cooperative incubation.",
      examplePpa: "Barista & baking NCII scholarships, digital freelance bootcamps, and youth bazaars."
    },
    {
      num: "05",
      name: "Social Inclusion & Equity",
      tagline: "Inclusive Growth for Marginalized Youth",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      description: "Advocacies and support systems for Differently-Abled (PWD) youth, Indigenous Peoples (IP) youth, young solo parents, and gender equality.",
      examplePpa: "IP Youth Cultural Exchange, PWD assistive devices, and gender sensitivity summits."
    },
    {
      num: "06",
      name: "Peace-Building & Security",
      tagline: "Community Safety & Disaster Resilience",
      icon: Scale,
      color: "text-emerald-700",
      bg: "bg-emerald-50",
      description: "Disaster Risk Reduction Management (DRRM) training, anti-drug community monitoring, youth peacekeeping brigades, and juvenile welfare.",
      examplePpa: "Youth First-Aid & Rescue Response Training, and drug-free sports development festivals."
    },
    {
      num: "07",
      name: "Active Citizenship",
      tagline: "Civic Participation & Volunteerism",
      icon: Vote,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      description: "Katipunan ng Kabataan (KK) general assemblies, voter registration awareness, participatory budgeting, and community volunteer circles.",
      examplePpa: "Mandatory KK Assemblies, Mock SK Legislative Sessions, and voter education caravans."
    },
    {
      num: "08",
      name: "Environment",
      tagline: "Ecological Stewardship & Climate Action",
      icon: Leaf,
      color: "text-teal-700",
      bg: "bg-teal-50",
      description: "Watershed reforestation, solid waste segregation education, coastal and riverbank cleanups, and renewable energy youth projects.",
      examplePpa: "National Greening Program tree-planting, clean river drives, and eco-brick competitions."
    },
    {
      num: "09",
      name: "Global Mobility",
      tagline: "International Competitiveness & Culture",
      icon: Globe,
      color: "text-cyan-700",
      bg: "bg-cyan-50",
      description: "National & international youth congresses, cultural heritage promotion, digital literacy, and English language communication mastery.",
      examplePpa: "Youth Ambassador summits, digital literacy seminars, and inter-barangay debate leagues."
    },
    {
      num: "10",
      name: "Agriculture",
      tagline: "Food Sovereignty & Agri-Youth Enterprise",
      icon: Sprout,
      color: "text-lime-700",
      bg: "bg-lime-50",
      description: "Youth farming cooperatives, modern hydroponics/organic farming workshops, school-in-a-garden revival, and agricultural sustainability.",
      examplePpa: "Young Agri-Preneur training, communal vegetable garden kits, and organic fertilizer production."
    }
  ];

  const filteredBarangays = MUNICIPAL_BARANGAYS_40.filter((b) =>
    b.toLowerCase().includes(barangaySearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col relative overflow-hidden font-sans selection:bg-[#C89311]/20 selection:text-[#0C1E36]">
      
      {/* ========================================================================= */}
      {/* FULL-PAGE ANIMATED LOOPING LOGO BACKGROUND (WATERMARKS & ORBITAL DRIFT)    */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        
        {/* Subtle Architectural Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(#0C1E36 1px, transparent 1px), linear-gradient(to right, #0C1E36 1px, transparent 1px), linear-gradient(to bottom, #0C1E36 1px, transparent 1px)`,
            backgroundSize: `32px 32px, 96px 96px, 96px 96px`,
          }}
        />

        {/* Ambient Gradient Color Blobs */}
        <div className="absolute -top-32 right-[-10%] w-[55vw] h-[55vw] bg-amber-400/8 blur-[140px] rounded-full" />
        <div className="absolute top-[35%] -left-32 w-[50vw] h-[50vw] bg-sky-400/8 blur-[140px] rounded-full" />
        <div className="absolute -bottom-32 right-[15%] w-[45vw] h-[45vw] bg-indigo-500/8 blur-[140px] rounded-full" />

        {/* CENTERPIECE: Massive Looping Rotating Watermark Logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] md:w-[960px] md:h-[960px] flex items-center justify-center opacity-[0.045]">
          
          {/* Animated Outer Concentric Compass Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 160, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-dashed border-[#0C1E36] opacity-70"
          />

          {/* Animated Middle Counter-Rotating Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 110, repeat: Infinity, ease: "linear" }}
            className="absolute inset-16 rounded-full border border-[#C89311] opacity-50"
          />

          {/* Core Breathing & Rotating Center Logo */}
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [0.96, 1.04, 0.96]
            }}
            transition={{
              rotate: { duration: 95, repeat: Infinity, ease: "linear" },
              scale: { duration: 14, repeat: Infinity, ease: "easeInOut" }
            }}
            className="w-[75%] h-[75%] rounded-full overflow-hidden flex items-center justify-center filter grayscale contrast-125"
          >
            <img 
              src={logo} 
              alt="SKOMPAS Background Logo" 
              className="w-full h-full object-cover scale-[1.35]" 
            />
          </motion.div>
        </div>

        {/* FLOATING SATELLITE LOGO 1: Top-Right (Golden Aura, Floating & Pivoting) */}
        <motion.div
          animate={{
            y: [-18, 18, -18],
            x: [0, 14, 0],
            rotate: [0, 15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 right-[6%] w-44 h-44 md:w-60 md:h-60 rounded-full p-3 bg-white/30 backdrop-blur-[2px] ring-1 ring-amber-500/20 shadow-2xl shadow-amber-500/5 opacity-[0.14] hidden sm:flex items-center justify-center overflow-hidden"
        >
          <img src={logo} alt="SKOMPAS Watermark" className="w-full h-full object-cover scale-[1.4]" />
        </motion.div>

        {/* FLOATING SATELLITE LOGO 2: Bottom-Left (Sky Blue Aura, Floating & Orbiting) */}
        <motion.div
          animate={{
            y: [22, -22, 22],
            x: [-12, 10, -12],
            rotate: [0, -18, 0],
            scale: [0.98, 1.06, 0.98]
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-36 left-[4%] w-52 h-52 md:w-72 md:h-72 rounded-full p-4 bg-white/20 backdrop-blur-[2px] ring-1 ring-sky-500/20 shadow-2xl shadow-sky-500/5 opacity-[0.12] hidden md:flex items-center justify-center overflow-hidden"
        >
          <img src={logo} alt="SKOMPAS Watermark" className="w-full h-full object-cover scale-[1.4]" />
        </motion.div>

        {/* FLOATING SATELLITE LOGO 3: Top-Left Subtle Crest */}
        <motion.div
          animate={{
            y: [-14, 16, -14],
            rotate: [0, -12, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-48 left-[8%] w-28 h-28 rounded-full p-2 ring-1 ring-slate-300/30 opacity-[0.08] hidden lg:flex items-center justify-center overflow-hidden"
        >
          <img src={logo} alt="SKOMPAS Watermark" className="w-full h-full object-cover scale-[1.38]" />
        </motion.div>

        {/* FLOATING SATELLITE LOGO 4: Bottom-Right Subtle Drift */}
        <motion.div
          animate={{
            y: [16, -16, 16],
            x: [8, -8, 8],
            rotate: [0, 10, 0]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-20 right-[8%] w-36 h-36 rounded-full p-2 ring-1 ring-purple-500/20 opacity-[0.09] hidden lg:flex items-center justify-center overflow-hidden"
        >
          <img src={logo} alt="SKOMPAS Watermark" className="w-full h-full object-cover scale-[1.4]" />
        </motion.div>

      </div>

      {/* ========================================================================= */}
      {/* TOP NAVIGATION BAR                                                        */}
      {/* ========================================================================= */}
      <nav className="relative z-20 px-6 sm:px-12 h-24 flex justify-between items-center max-w-7xl w-full mx-auto">
        
        {/* Brand with Animated Crest */}
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <div className="relative">
            {/* Glowing Ring on Hover */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-[#C89311] opacity-30 group-hover:opacity-75 blur-sm transition-opacity duration-500" />
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white ring-4 ring-amber-500/20 flex items-center justify-center overflow-hidden shadow-md group-hover:scale-105 transition-transform duration-300">
              <img src={logo} alt="SKOMPAS Logo" className="w-full h-full object-cover scale-[1.42]" />
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-[#0C1E36] tracking-tight">SKOMPAS</span>
              <span className="w-2 h-2 rounded-full bg-[#C89311]" />
            </div>
            <span className="text-[8px] font-black uppercase tracking-[0.25em] text-[#C89311]">
              Official SK Portal
            </span>
          </div>
        </div>

        {/* Middle Navigation & Municipality Tag */}
        <div className="hidden lg:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur-md rounded-full border border-amber-200/60 shadow-xs text-amber-900">
            <Building2 className="w-3.5 h-3.5 text-[#C89311]" />
            <span>Municipality of Laak, Davao de Oro</span>
          </div>
          <span className="text-zinc-300">•</span>
          <span className="text-zinc-600 font-bold">40 Barangays</span>
        </div>

        {/* Direct Action */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const target = document.getElementById("roles-grid");
              if (target) {
                target.scrollIntoView({ behavior: "smooth" });
              } else {
                navigate("/login");
              }
            }}
            className="px-5 py-2.5 rounded-2xl bg-[#0C1E36] hover:bg-[#132d52] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[#0C1E36]/15 hover:shadow-xl transition-all active:scale-95 cursor-pointer"
          >
            <span>Launch Workspace</span>
            <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* MAIN HERO SECTION WITH ANIMATED FLOATING HERO CREST                        */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col items-center z-10 px-6 pt-6 pb-24 max-w-7xl w-full mx-auto">
        
        <div className="max-w-4xl w-full text-center mb-16 relative">
          
          {/* ANIMATED HERO LOGO SHOWCASE (Levitating with Pulsing Golden Rings) */}
          <div className="mb-8 flex justify-center items-center relative">
            
            {/* Outward Pulsing Waves */}
            <motion.div
              animate={{
                scale: [1, 1.35, 1.7],
                opacity: [0.45, 0.2, 0]
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-amber-400/30 pointer-events-none"
            />
            
            <motion.div
              animate={{
                scale: [1, 1.5, 1.9],
                opacity: [0.3, 0.12, 0]
              }}
              transition={{
                duration: 3.2,
                delay: 1.2,
                repeat: Infinity,
                ease: "easeOut"
              }}
              className="absolute w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-amber-500/20 pointer-events-none"
            />

            {/* Core Floating Logo with 3D Shadow */}
            <motion.div
              animate={{
                y: [-6, 6, -6],
                rotate: [-2, 2, -2]
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-white p-2.5 shadow-2xl shadow-amber-900/15 ring-4 ring-amber-400/40 cursor-pointer group"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-slate-50 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
                <img 
                  src={logo} 
                  alt="SKOMPAS Emblem" 
                  className="w-full h-full object-cover scale-[1.42]" 
                />
              </div>

              {/* Orbiting Sparkle Star */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#C89311] text-white rounded-full flex items-center justify-center shadow-md shadow-amber-600/40">
                  <Sparkles className="w-2.5 h-2.5 text-white" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Official Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-5 py-2 bg-white/90 backdrop-blur-md border border-amber-200/80 rounded-full text-[9px] font-black uppercase tracking-[0.25em] mb-6 shadow-sm text-amber-900"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Republic of the Philippines • RA 10742 Compliance</span>
          </motion.div>

          {/* Primary Display Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight text-[#0C1E36] mb-6 leading-[0.95] text-balance"
          >
            Digital <span className="text-[#C89311] underline decoration-amber-400/40 underline-offset-8">Guardians</span> <br /> 
            of Youth Governance.
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base sm:text-xl text-zinc-600 leading-relaxed max-w-2xl mx-auto mb-10 font-medium text-balance"
          >
            Empowering the Sangguniang Kabataan with standardized 3-year CBYDP templates, automated annual ABYIP budgeting, and direct landscape PDF generation.
          </motion.p>

          {/* Statutory Pillars Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto"
          >
            {statutoryPillars.map((item, i) => (
              <div 
                key={i} 
                className="flex flex-col items-center text-center p-3.5 bg-white/80 backdrop-blur-md border border-zinc-200/70 rounded-2xl shadow-xs hover:border-[#C89311] hover:shadow-md transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#C89311] flex items-center justify-center mb-2">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0C1E36] leading-snug">
                  {item.label}
                </span>
                <span className="text-[9px] text-zinc-500 font-medium leading-tight mt-0.5">
                  {item.desc}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* ========================================================================= */}
        {/* ROLE SELECTOR SECTION                                                     */}
        {/* ========================================================================= */}
        <div id="roles-grid" className="max-w-7xl w-full pt-6">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-amber-50 border border-amber-200 text-amber-800 text-[8px] font-black uppercase tracking-widest rounded-full">
                  Designated Portals
                </span>
                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">
                  Role-Based Authentication
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0C1E36] uppercase italic">
                Launch Officer Workspace
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                Select your official capacity to access your barangay's synchronized records.
              </p>
            </div>
            
            <div className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-white/70 px-4 py-2 rounded-xl border border-zinc-200/60 shadow-2xs">
              <Award className="w-3.5 h-3.5 text-[#C89311]" />
              <span>Laak Municipal Youth System</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {roles.map((role, idx) => (
              <motion.button
                key={role.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 + 0.35, duration: 0.5 }}
                onClick={() => navigate(`/login?role=${role.id}`)}
                className={`group relative p-8 bg-white/95 backdrop-blur-md border ${role.border} rounded-[36px] text-left transition-all duration-300 hover:-translate-y-2 overflow-hidden cursor-pointer shadow-sm ${role.hoverBorder} ${role.hoverShadow} flex flex-col justify-between`}
              >
                {/* Decorative Subtle Corner Glow on Hover */}
                <div className={`absolute -right-16 -top-16 w-44 h-44 bg-gradient-to-br rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${role.gradient} pointer-events-none`} />

                <div>
                  {/* Badge & Icon Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3 text-white ${role.color}`}>
                      <role.icon className="w-7 h-7" />
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider ${role.badgeColor}`}>
                      {role.roleTag}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-2xl font-black mb-2 tracking-tight text-[#0C1E36] group-hover:text-amber-600 transition-colors">
                    {role.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-medium mb-8">
                    {role.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-zinc-100 flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#0C1E36] group-hover:text-amber-600 transition-colors">
                    Enter Portal
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center text-zinc-700 group-hover:bg-[#0C1E36] group-hover:text-white group-hover:border-[#0C1E36] transition-all transform group-hover:translate-x-1 shadow-2xs">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          {/* Quick Notice Banner */}
          <div className="mt-8 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                <Compass className="w-4 h-4 text-[#C89311]" />
              </div>
              <p className="text-zinc-600 font-medium">
                Standardized for all <strong className="text-[#0C1E36]">40 Barangays of the Municipality of Laak, Davao de Oro</strong>. Equipped with official CBYDP landscape templates and direct PDF exports.
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="shrink-0 px-4 py-2 rounded-xl bg-[#0C1E36] hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Login / Sign Up</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: 10 NYC CENTERS OF YOUTH PARTICIPATION EXPLORER                   */}
          {/* ========================================================================= */}
          <div className="mt-20 pt-12 border-t border-zinc-200/60">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-sky-50 border border-sky-200 text-sky-800 text-[8px] font-black uppercase tracking-widest rounded-full">
                    Statutory Framework
                  </span>
                  <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">
                    RA 10742 & NYC Guidelines
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0C1E36] uppercase italic">
                  10 NYC Centers of Participation
                </h2>
                <p className="text-xs text-zinc-500 font-medium">
                  The foundational pillars required in every Comprehensive Barangay Youth Development Plan (CBYDP).
                </p>
              </div>

              <div className="text-xs font-bold text-zinc-500 bg-white/70 px-3 py-1.5 rounded-xl border border-zinc-200/60">
                Center {nycCenters[selectedCenter].num} of 10
              </div>
            </div>

            {/* Horizontal Tabs for the 10 Centers */}
            <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
              {nycCenters.map((center, idx) => {
                const isSelected = selectedCenter === idx;
                const IconComponent = center.icon;
                return (
                  <button
                    key={center.num}
                    onClick={() => setSelectedCenter(idx)}
                    className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected 
                        ? "bg-[#0C1E36] text-white shadow-md shadow-slate-900/10 ring-2 ring-[#C89311]" 
                        : "bg-white/80 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/70"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isSelected ? "text-[#C89311]" : "text-zinc-400"}`} />
                    <span>{center.num}</span>
                    <span className="hidden sm:inline">{center.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Center Detail Showcase Card */}
            <AnimatePresence mode="wait">
              {(() => {
                const current = nycCenters[selectedCenter];
                const IconComp = current.icon;
                return (
                  <motion.div
                    key={current.num}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.25 }}
                    className="mt-3 p-6 sm:p-8 rounded-3xl bg-white/90 backdrop-blur-md border border-zinc-200/80 shadow-sm grid md:grid-cols-12 gap-6 items-center"
                  >
                    <div className="md:col-span-8 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl ${current.bg} ${current.color} flex items-center justify-center shrink-0`}>
                          <IconComp className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-[#C89311]">
                            Center {current.num} • Philippine Youth Development Plan
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-[#0C1E36] tracking-tight">
                            {current.name}
                          </h3>
                        </div>
                      </div>

                      <p className="text-sm font-semibold text-zinc-700">
                        {current.tagline}
                      </p>

                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {current.description}
                      </p>

                      <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/60">
                        <div className="text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-1">
                          Official Standard PPA Focus (CBYDP/ABYIP)
                        </div>
                        <p className="text-xs font-medium text-[#0C1E36]">
                          {current.examplePpa}
                        </p>
                      </div>
                    </div>

                    <div className="md:col-span-4 flex flex-col justify-center items-start md:items-end gap-3 p-4 rounded-2xl bg-amber-50/50 border border-amber-200/60">
                      <div className="text-left md:text-right space-y-1">
                        <div className="text-[9px] font-black uppercase tracking-widest text-amber-900">
                          3-Year CBYDP Allocation
                        </div>
                        <p className="text-xs text-zinc-600 font-medium">
                          Auto-generates into the Annual Barangay Youth Investment Program (ABYIP).
                        </p>
                      </div>

                      <button
                        onClick={() => navigate("/login")}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#0C1E36] hover:bg-slate-800 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <span>Draft CBYDP Plan</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })()}
            </AnimatePresence>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: 40 BARANGAYS DIRECTORY (LAAK, DAVAO DE ORO)                       */}
          {/* ========================================================================= */}
          <div className="mt-20 pt-12 border-t border-zinc-200/60">
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 gap-4">
              <div className="text-left space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-[8px] font-black uppercase tracking-widest rounded-full">
                    Municipal Network
                  </span>
                  <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">
                    Davao de Oro
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0C1E36] uppercase italic">
                  40 Barangays of Laak
                </h2>
                <p className="text-xs text-zinc-500 font-medium">
                  Select your barangay to register or log in to your official Sangguniang Kabataan workspace.
                </p>
              </div>

              {/* Instant Barangay Search Bar */}
              <div className="relative w-full md:w-72">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={barangaySearch}
                  onChange={(e) => setBarangaySearch(e.target.value)}
                  placeholder="Search barangay..."
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89311] transition-all"
                />
              </div>
            </div>

            {/* Barangays Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-96 overflow-y-auto pr-1">
              {filteredBarangays.map((bName) => (
                <div
                  key={bName}
                  className="p-3 rounded-2xl bg-white/80 hover:bg-white border border-zinc-200/70 hover:border-amber-400/80 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between group"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-[#C89311] flex items-center justify-center shrink-0 mt-0.5">
                      <Building2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-bold text-[#0C1E36] group-hover:text-amber-800 transition-colors line-clamp-2">
                      {bName}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-1">
                    <button
                      onClick={() => navigate(`/login?role=Chairman`)}
                      className="text-[9px] font-black uppercase tracking-wider text-zinc-500 hover:text-[#0C1E36] transition-colors"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => navigate(`/login?mode=signup&barangay=${encodeURIComponent(bName)}`)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 text-[8px] font-black uppercase tracking-wider transition-colors"
                      title="Register Council"
                    >
                      <UserPlus className="w-2.5 h-2.5" />
                      <span>Register</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBarangays.length === 0 && (
              <div className="p-8 text-center bg-white/60 rounded-2xl border border-dashed border-zinc-300 text-xs text-zinc-500">
                No barangay found matching "{barangaySearch}". Please check the spelling.
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ========================================================================= */}
      {/* FOOTER                                                                    */}
      {/* ========================================================================= */}
      <footer className="relative z-10 px-8 sm:px-12 py-12 border-t border-zinc-200/80 bg-white/60 backdrop-blur-md">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white ring-2 ring-amber-500/20 flex items-center justify-center overflow-hidden shadow-xs">
              <img src={logo} alt="SKOMPAS Logo" className="w-full h-full object-cover scale-[1.4]" />
            </div>
            <div>
              <div className="text-base font-black tracking-tight text-[#0C1E36]">
                SKOMPAS<span className="text-[#C89311]">.</span>
              </div>
              <p className="text-[10px] font-medium text-zinc-500">
                Sangguniang Kabataan Operations & Monitoring Platform for Advisory & Statutory Compliance
              </p>
            </div>
          </div>

          <div className="flex flex-col md:items-end gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
            <p>© 2026 Sangguniang Kabataan • Municipality of Laak, Davao de Oro</p>
            <p className="text-zinc-500">In Accordance with R.A. 10742, R.A. 11768 & DILG-NYC Guidelines</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

