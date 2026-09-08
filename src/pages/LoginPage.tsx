import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../components/auth/AuthProvider";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Users, Wallet, Landmark, Eye, EyeOff, CheckCircle, ArrowRight, CornerDownLeft, Sparkles, AlertCircle, Building2, UserPlus, LogIn, Phone } from "lucide-react";
import { MUNICIPAL_BARANGAYS_40, registerBarangayAccount, getBarangayAccounts } from "../lib/barangayStore";
const logo = "/src/assets/images/input_file_0.png";

type RoleId = "Chairman" | "Secretary" | "Treasurer" | "Admin";

interface RoleConfig {
  id: RoleId;
  title: string;
  subtitle: string;
  icon: React.ComponentType<any>;
  color: string;
  bg: string;
  border: string;
  text: string;
  accent: string;
  defaultPass: string;
  defaultEmail: string;
}

const ROLES: RoleConfig[] = [
  {
    id: "Chairman",
    title: "SK Chairman",
    subtitle: "Executive Approval Routing & Metrics",
    icon: Shield,
    color: "bg-[#0C1E36]",
    bg: "bg-[#0C1E36]/5",
    border: "border-[#0C1E36]/20",
    text: "text-[#0C1E36]",
    accent: "text-white",
    defaultPass: "chair123",
    defaultEmail: "chairman@sk.gov.ph"
  },
  {
    id: "Secretary",
    title: "SK Secretary",
    subtitle: "Resolution Drafting & Template Compilation",
    icon: Users,
    color: "bg-[#0284C7]",
    bg: "bg-[#0284C7]/5",
    border: "border-[#0284C7]/20",
    text: "text-[#0284C7]",
    accent: "text-white",
    defaultPass: "sec123",
    defaultEmail: "secretary@sk.gov.ph"
  },
  {
    id: "Treasurer",
    title: "SK Treasurer",
    subtitle: "Fiscal Ledgers & Budget Compliance",
    icon: Wallet,
    color: "bg-[#C89311]",
    bg: "bg-[#C89311]/5",
    border: "border-[#C89311]/20",
    text: "text-[#C89311]",
    accent: "text-white",
    defaultPass: "treas123",
    defaultEmail: "treasurer@sk.gov.ph"
  },
  {
    id: "Admin",
    title: "LYDO Officer",
    subtitle: "Municipal Youth Development Office - Barangay Approvals & Oversight",
    icon: Landmark,
    color: "bg-[#5B21B6]",
    bg: "bg-[#5B21B6]/5",
    border: "border-[#5B21B6]/20",
    text: "text-[#5B21B6]",
    accent: "text-white",
    defaultPass: "dilg123",
    defaultEmail: "dilg@dilg.gov.ph"
  }
];

export function LoginPage() {
  const { signIn, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Mode: Sign In vs Sign Up
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Pick initial role from search query or default to Chairman
  const queryParams = new URLSearchParams(location.search);
  const initialRoleParam = queryParams.get("role") as RoleId;
  const validInitialRole = ROLES.some((r) => r.id === initialRoleParam) ? initialRoleParam : "Chairman";

  const [selectedRole, setSelectedRole] = useState<RoleId>(validInitialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Sign up specific fields
  const [signupBarangay, setSignupBarangay] = useState<string>(MUNICIPAL_BARANGAYS_40[0]);
  const [signupRole, setSignupRole] = useState<"Chairman" | "Secretary" | "Treasurer">("Chairman");
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupContact, setSignupContact] = useState("");

  const activeConfig = ROLES.find((r) => r.id === selectedRole) || ROLES[0];

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Handle changing the selected role - updates email/password fields with prototype helper hints
  useEffect(() => {
    setEmail("");
    setPassword("");
    setError(null);
    setSuccess(null);
  }, [selectedRole, authMode]);

  const handleQuickFill = () => {
    setEmail(activeConfig.defaultEmail);
    setPassword(activeConfig.defaultPass);
    setError(null);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSubmitting(true);

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !password) {
      setError("Please fill out both the email address and security passcode.");
      setIsSubmitting(false);
      return;
    }

    try {
      // First check registered accounts in storage
      const accounts = getBarangayAccounts();
      const matchedAccount = accounts.find(a => a.email.toLowerCase() === trimmedEmail);

      if (matchedAccount) {
        if (matchedAccount.status === "pending") {
          setError(`Registration Pending: Your account for Barangay ${matchedAccount.barangayName} is currently awaiting review and approval by the Municipal LYDO Officer.`);
          setIsSubmitting(false);
          return;
        }
        if (matchedAccount.status === "rejected") {
          setError(`Registration Rejected: Your account registration was rejected by LYDO. Reason: ${matchedAccount.rejectionReason || "Verification failed"}.`);
          setIsSubmitting(false);
          return;
        }
        if (matchedAccount.password && matchedAccount.password !== password) {
          setError("Invalid passcode for this official barangay account.");
          setIsSubmitting(false);
          return;
        }

        // Account is approved! Authenticate
        await signIn({
          role: matchedAccount.role,
          email: matchedAccount.email,
          password,
          barangayName: matchedAccount.barangayName,
          displayName: matchedAccount.officerName
        });

        setSuccess(`Welcome, ${matchedAccount.officerName}! Synchronizing Barangay ${matchedAccount.barangayName} workspace...`);
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
        return;
      }

      // If not in registered accounts, check default role mock credentials
      const emailMatches = trimmedEmail === activeConfig.defaultEmail.toLowerCase();
      const passMatches = password === activeConfig.defaultPass;

      if (!emailMatches || !passMatches) {
        setError(`Invalid credentials for ${activeConfig.title}. If you recently registered, please ensure your account was approved by LYDO, or use the "Auto-Fill" button for prototype demo.`);
        setIsSubmitting(false);
        return;
      }

      setSuccess("Verified! Accessing municipal workspace...");
      await signIn(selectedRole);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
      setIsSubmitting(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!signupName.trim() || !signupEmail.trim() || !signupPassword.trim()) {
      setError("Please complete all required fields (Barangay, Full Name, Email, and Passcode).");
      return;
    }

    if (!signupEmail.includes("@")) {
      setError("Please provide a valid official email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = registerBarangayAccount({
        barangayName: signupBarangay,
        officerName: signupName.trim(),
        role: signupRole,
        email: signupEmail.trim(),
        password: signupPassword,
        contactNumber: signupContact.trim()
      });

      if (!result.success) {
        setError(result.message);
        setIsSubmitting(false);
        return;
      }

      // Success
      setSuccess(`Account registered for Barangay ${signupBarangay} as ${signupRole}! It has been queued for official approval by the Municipal LYDO Officer before you can log in.`);
      setIsSubmitting(false);
      
      // Clear fields
      setSignupName("");
      setSignupEmail("");
      setSignupPassword("");
      setSignupContact("");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col md:flex-row relative overflow-hidden font-sans">
      {/* Dynamic Background Glowing Accents */}
      <div className={`absolute top-0 right-0 w-[50vw] h-[50vw] ${activeConfig.bg} blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 transition-colors duration-1000`} />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vw] bg-neutral-100 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4" />

      {/* Brand & Context Side (Hidden on Mobile) */}
      <div className="hidden md:flex flex-1 flex-col justify-between p-16 relative z-10 border-r border-[#eee]/40 bg-zinc-50/50">
        <div>
          <button 
            onClick={() => navigate("/")}
            className="group flex items-center gap-3 text-2xl font-black tracking-tighter"
          >
            <div className="w-14 h-14 rounded-full bg-white ring-4 ring-[#0C1E36]/5 flex items-center justify-center overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
              <img src={logo} alt="SKOMPAS Logo" className="w-full h-full object-cover scale-[1.42]" />
            </div>
            <span className="text-[#0C1E36]">SKOMPAS</span><span className="text-[#C89311]">.</span>
          </button>
        </div>

        <div className="max-w-md">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedRole + authMode}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl ${activeConfig.bg} border ${activeConfig.border} text-xs font-black uppercase tracking-widest ${activeConfig.text}`}>
                <Sparkles className="w-3.5 h-3.5" />
                Municipal 40-Barangay Network
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-[#0C1E36] tracking-tight leading-none">
                {authMode === "signup" ? "Barangay Official" : activeConfig.title} <br />
                <span className={`${activeConfig.text}`}>{authMode === "signup" ? "Registration" : "Workspace Portal"}</span>
              </h1>
              
              <p className="text-[#555] text-sm leading-relaxed font-medium">
                {authMode === "signup" 
                  ? "Register your Barangay SK Council credentials. All registrations undergo mandatory validation and approval by the Municipal Local Youth Development Officer (LYDO) before portal access." 
                  : `${activeConfig.subtitle}. Securely synchronized across the 40 barangays under municipal supervision.`}
              </p>

              <div className="pt-4 border-t border-[#eee] space-y-4">
                <div className="flex items-center gap-3 text-xs font-bold text-[#888]">
                  <CheckCircle className={`w-4 h-4 ${activeConfig.text}`} />
                  Statutory maximum of 40 barangay councils
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-[#888]">
                  <CheckCircle className={`w-4 h-4 ${activeConfig.text}`} />
                  LYDO Officer registration gate & document approvals
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-[#888]">
                  <CheckCircle className={`w-4 h-4 ${activeConfig.text}`} />
                  Historical archiving for CBYDP, ABYIP & Annual Budget
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="text-xs font-bold text-[#aaa] uppercase tracking-widest flex items-center gap-2">
          <span>Official LGU Secure Layer</span>
          <span>•</span>
          <span>40 Barangays Registered</span>
        </div>
      </div>

      {/* Interactive Form Side */}
      <div className="flex-1 flex flex-col justify-center p-8 sm:p-12 md:p-16 relative z-10">
        <div className="max-w-md w-full mx-auto space-y-8">
          
          {/* Logo element for mobile view */}
          <div className="flex md:hidden items-center justify-between">
            <button 
              onClick={() => navigate("/")}
              className="group flex items-center gap-3 text-xl font-black tracking-tighter"
            >
              <div className="w-10 h-10 rounded-full bg-white ring-2 ring-[#0C1E36]/5 flex items-center justify-center overflow-hidden shadow">
                <img src={logo} alt="SKOMPAS Logo" className="w-full h-full object-cover scale-[1.42]" />
              </div>
              <span className="text-[#0C1E36]">SKOMPAS</span><span className="text-[#C89311]">.</span>
            </button>
            <div className="text-[10px] font-black text-[#999] uppercase tracking-widest bg-zinc-50 border px-3 py-1 rounded-xl">LGU SECURE</div>
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-[#0C1E36] tracking-tight">
              {authMode === "signup" ? "Barangay Account Sign Up" : "Access Gate"}
            </h2>
            <p className="text-[#888] text-xs font-bold uppercase tracking-widest">
              {authMode === "signup" ? "Register your barangay officer profile" : "Select your role designation to sign in"}
            </p>
          </div>

          {/* Top Auth Mode Switcher: Sign In vs Sign Up */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F5F5F4] rounded-2xl border border-zinc-200/60">
            <button
              type="button"
              onClick={() => { setAuthMode("signin"); setError(null); setSuccess(null); }}
              className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                authMode === "signin"
                  ? "bg-[#0C1E36] text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("signup"); setError(null); setSuccess(null); }}
              className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                authMode === "signup"
                  ? "bg-[#C89311] text-white shadow-md"
                  : "text-zinc-500 hover:text-zinc-800"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              Sign Up (Barangay)
            </button>
          </div>

          {/* SIGN IN VIEW */}
          {authMode === "signin" && (
            <>
              {/* Role Switching Tabs */}
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F5F5F4] rounded-2xl border border-zinc-200/50">
                {ROLES.map((roleOpt) => {
                  const IconComp = roleOpt.icon;
                  const isSelected = selectedRole === roleOpt.id;
                  return (
                    <button
                      key={roleOpt.id}
                      onClick={() => setSelectedRole(roleOpt.id)}
                      type="button"
                      className={`flex flex-col items-center justify-center py-3 rounded-xl transition-all duration-300 relative ${
                        isSelected 
                          ? `${roleOpt.color} text-white shadow-md shadow-black/10 scale-[1.03] z-10` 
                          : "text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/30"
                      }`}
                      title={roleOpt.title}
                    >
                      <IconComp className={`w-4 h-4 ${isSelected ? "text-white" : "text-zinc-500"}`} />
                      <span className="text-[8px] font-black uppercase tracking-wider mt-1.5 hidden sm:block">
                        {roleOpt.id === "Admin" ? "LYDO" : roleOpt.id}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Login Form Container */}
              <div className="bg-white border border-amber-200/30 rounded-[36px] shadow-[0_24px_60px_-15px_rgba(12,30,54,0.06)] p-8 relative overflow-hidden">
                
                {/* Quick Prototype credential auto-fill notification */}
                <div className={`p-4 rounded-2xl ${activeConfig.bg} border ${activeConfig.border} flex items-start gap-3 mb-6 transition-colors duration-1000`}>
                  <AlertCircle className={`w-4 h-4 ${activeConfig.text} shrink-0 mt-0.5`} />
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider block text-zinc-800">
                      Sandbox Profile: {activeConfig.title}
                    </span>
                    <span className="text-[11px] text-[#555] font-medium leading-normal block">
                      Evaluate with: <span className="font-extrabold text-black bg-white px-1.5 py-0.5 rounded border border-zinc-200">{activeConfig.defaultEmail}</span> & pass <span className="font-extrabold text-black bg-white px-1.5 py-0.5 rounded border border-zinc-200">{activeConfig.defaultPass}</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleQuickFill}
                      className={`text-[9px] font-bold uppercase tracking-wider underline ${activeConfig.text} hover:scale-105 transition-transform block pt-1`}
                    >
                      ⚡ Auto-Fill credentials
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-5">
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                      Official Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={activeConfig.defaultEmail}
                      className="w-full px-5 py-3.5 bg-zinc-50 border border-zinc-200 focus:border-[#C89311] focus:ring-4 focus:ring-amber-500/10 rounded-2xl text-xs font-semibold placeholder-zinc-400 focus:outline-none transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                      Secure Passcode
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-5 pr-11 py-3.5 bg-zinc-50 border border-zinc-200 focus:border-[#C89311] focus:ring-4 focus:ring-amber-500/10 rounded-2xl text-xs font-semibold placeholder-zinc-400 focus:outline-none transition-all duration-200"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-red-50 text-red-600 text-[10px] font-extrabold uppercase tracking-wider rounded-xl border border-red-100 flex items-center gap-2"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{error}</span>
                    </motion.div>
                  )}

                  {success && (
                    <div className="p-3 bg-emerald-50 text-emerald-600 text-[10px] font-extrabold uppercase tracking-wider rounded-xl border border-emerald-100 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span>{success}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-md flex items-center justify-center gap-2.5 ${
                      isSubmitting 
                        ? "bg-zinc-400 cursor-not-allowed" 
                        : `${activeConfig.color} shadow-${activeConfig.color}/20 hover:scale-[1.02] active:scale-[0.98]`
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Decrypt Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* SIGN UP VIEW */}
          {authMode === "signup" && (
            <div className="bg-white border border-amber-200/30 rounded-[36px] shadow-[0_24px_60px_-15px_rgba(12,30,54,0.06)] p-8 relative overflow-hidden">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-start gap-3 mb-6">
                <Shield className="w-4 h-4 text-[#C89311] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider block text-zinc-800">
                    LYDO Statutory Gate Notice
                  </span>
                  <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">
                    Per municipal rules, new barangay registrations require verification and one-click approval by the <strong>Municipal LYDO Officer</strong> before portal login is enabled.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSignUpSubmit} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Select Barangay (Max 40)
                  </label>
                  <div className="relative">
                    <select
                      value={signupBarangay}
                      onChange={(e) => setSignupBarangay(e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-[#C89311] focus:ring-4 focus:ring-amber-500/10 rounded-2xl text-xs font-semibold focus:outline-none transition-all duration-200"
                    >
                      {MUNICIPAL_BARANGAYS_40.map(bgy => (
                        <option key={bgy} value={bgy}>Barangay {bgy}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Officer Designation (Role)
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Chairman", "Secretary", "Treasurer"] as const).map(r => (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setSignupRole(r)}
                        className={`py-2 px-2 text-[9px] font-black uppercase rounded-xl border transition-all ${
                          signupRole === r 
                            ? "bg-[#0C1E36] text-white border-[#0C1E36] shadow-sm" 
                            : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Official Full Name
                  </label>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="e.g. Hon. Maria Clara Santos"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-[#C89311] focus:ring-4 focus:ring-amber-500/10 rounded-2xl text-xs font-semibold placeholder-zinc-400 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                      Official Email
                    </label>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      placeholder="officer@sk.gov.ph"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-[#C89311] focus:ring-4 focus:ring-amber-500/10 rounded-2xl text-xs font-semibold placeholder-zinc-400 focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                      Contact / Phone
                    </label>
                    <input
                      type="text"
                      value={signupContact}
                      onChange={(e) => setSignupContact(e.target.value)}
                      placeholder="0917-000-0000"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-[#C89311] focus:ring-4 focus:ring-amber-500/10 rounded-2xl text-xs font-semibold placeholder-zinc-400 focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1.5">
                    Account Passcode
                  </label>
                  <input
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a secure passcode"
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 focus:border-[#C89311] focus:ring-4 focus:ring-amber-500/10 rounded-2xl text-xs font-semibold placeholder-zinc-400 focus:outline-none transition-all duration-200"
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 text-red-600 text-[10px] font-extrabold uppercase tracking-wider rounded-xl border border-red-100 flex items-center gap-2"
                  >
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {success && (
                  <div className="p-4 bg-emerald-50 text-emerald-800 text-[10px] font-semibold rounded-2xl border border-emerald-200 flex items-start gap-2.5 leading-relaxed">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-black uppercase tracking-wider text-emerald-900 mb-0.5">Registration Submitted!</strong>
                      <span>{success}</span>
                      <button
                        type="button"
                        onClick={() => { setAuthMode("signin"); setSuccess(null); }}
                        className="block mt-2 font-black text-emerald-700 underline uppercase tracking-widest"
                      >
                        Return to Sign In
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 bg-[#C89311] hover:bg-amber-600 shadow-amber-500/20 active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Submit for LYDO Approval</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest pt-2">
            <button 
              onClick={() => navigate("/")}
              className="hover:text-[#0C1E36] transition-colors flex items-center gap-1.5"
            >
              <CornerDownLeft className="w-3.5 h-3.5" />
              Main Landing
            </button>
            <span>Authorized Access Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

