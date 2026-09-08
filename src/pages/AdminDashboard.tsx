import React, { useState, useEffect } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { getMasterLYDPGoals, saveMasterLYDPGoals, LYDPGoal } from "../lib/goalsStore";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  BookOpen, 
  Send, 
  Sparkles, 
  Landmark, 
  Scale, 
  FileCheck,
  ChevronDown,
  Info,
  Calendar,
  Layers,
  Save,
  CheckCircle2,
  ListFilter,
  UserCheck,
  UserX,
  FileText,
  Archive,
  Bell,
  Check,
  X,
  MessageSquare,
  ShieldCheck,
  Coins
} from "lucide-react";
import { 
  getBarangayAccounts, 
  approveBarangayAccount, 
  rejectBarangayAccount, 
  getDocumentSubmissions, 
  reviewDocumentSubmission, 
  getAppNotifications, 
  addAppNotification, 
  MUNICIPAL_BARANGAYS_40 
} from "../lib/barangayStore";
import { BarangayAccount, DocumentSubmissionItem, AppNotification } from "../types";
import { DocumentArchiveManager } from "../components/archive/DocumentArchiveManager";

// List of all 40 barangays under the municipality of the prototype
const BARANGAYS_40 = [
  { name: "Poblacion", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 95 },
  { name: "San Jose", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 92 },
  { name: "Santa Maria", status: "Pending Review", abyip: "Pending", cbydp: "Approved", minutes: "Completed", score: 84 },
  { name: "San Vicente", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 90 },
  { name: "San Pedro", status: "Incomplete", abyip: "Missing", cbydp: "Approved", minutes: "Completed", score: 65 },
  { name: "Santo Domingo", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 98 },
  { name: "Concepcion", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 91 },
  { name: "San Juan", status: "Overdue", abyip: "Missing", cbydp: "Missing", minutes: "Missing", score: 0 },
  { name: "Santa Ana", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 94 },
  { name: "San Andres", status: "Pending Review", abyip: "Approved", cbydp: "Pending", minutes: "Completed", score: 81 },
  { name: "San Mateo", status: "Incomplete", abyip: "Pending", cbydp: "Missing", minutes: "Completed", score: 58 },
  { name: "San Isidro", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 96 },
  { name: "Magsaysay", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 93 },
  { name: "Quezon", status: "Pending Review", abyip: "Pending", cbydp: "Pending", minutes: "Completed", score: 78 },
  { name: "Rizal", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 89 },
  { name: "Baler", status: "Incomplete", abyip: "Approved", cbydp: "Missing", minutes: "Completed", score: 70 },
  { name: "Maligno", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 92 },
  { name: "San Francisco", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 95 },
  { name: "San Roque", status: "Pending Review", abyip: "Approved", cbydp: "Pending", minutes: "Completed", score: 82 },
  { name: "Santa Catalina", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 97 },
  { name: "Santa Rosa", status: "Overdue", abyip: "Missing", cbydp: "Missing", minutes: "Missing", score: 0 },
  { name: "Santiago", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 90 },
  { name: "San Agustin", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 91 },
  { name: "Santo Tomas", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 94 },
  { name: "Lucban", status: "Incomplete", abyip: "Missing", cbydp: "Approved", minutes: "Completed", score: 62 },
  { name: "San Miguel", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 96 },
  { name: "Del Pilar", status: "Pending Review", abyip: "Pending", cbydp: "Approved", minutes: "Completed", score: 80 },
  { name: "Caloocan", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 92 },
  { name: "San Antonio", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 88 },
  { name: "Malabon", status: "Incomplete", abyip: "Missing", cbydp: "Approved", minutes: "Completed", score: 64 },
  { name: "San Lorenzo", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 95 },
  { name: "Balantay", status: "Overdue", abyip: "Missing", cbydp: "Missing", minutes: "Missing", score: 0 },
  { name: "San Rafael", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 93 },
  { name: "San Gabriel", status: "Pending Review", abyip: "Approved", cbydp: "Pending", minutes: "Completed", score: 83 },
  { name: "Santa Clara", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 91 },
  { name: "San Felipe", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 95 },
  { name: "San Nicolas", status: "Incomplete", abyip: "Pending", cbydp: "Missing", minutes: "Completed", score: 55 },
  { name: "Pandan", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 97 },
  { name: "Cabanas", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 96 },
  { name: "San Simon", status: "Compliant", abyip: "Approved", cbydp: "Approved", minutes: "Completed", score: 92 },
];

const COMPLIANCE_CRITERIA_DEFAULT = [
  { id: "crit-1", name: "Republic Act No. 10742 Standard Compliance", section: "General", rule: "All resolutions must explicitly align with the 10% SK statutory fund cap rules.", isMandatory: true, weight: 30 },
  { id: "crit-2", name: "Approved ABYIP Realignment", section: "Financial", rule: "Prohibit any generic financial lump-sum allocations without specific program items.", isMandatory: true, weight: 25 },
  { id: "crit-3", name: "DILG Youth Participation Checklist", section: "Involvement", rule: "Verification that the Barangay Secretary lists the complete youth attendance logs.", isMandatory: false, weight: 15 },
  { id: "crit-4", name: "Audit Trail Requirements (COA)", section: "Governance", rule: "Mandatory digital approval log from the SK Chairman mapped with certified signatures.", isMandatory: true, weight: 30 },
];

export function AdminDashboard() {
  const { user, role, logout } = useAuth();
  
  // Tab control
  const [activeTab, setActiveTab] = useState<"board" | "registrations" | "doc_reviews" | "archives" | "notifications" | "goals" | "rules">("board");
  
  // Monitoring Board States
  const [searchBarangay, setSearchBarangay] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Registration states
  const [accounts, setAccounts] = useState<BarangayAccount[]>([]);
  const [accountFilter, setAccountFilter] = useState<"All" | "pending" | "approved" | "rejected">("All");
  const [rejectingAccountId, setRejectingAccountId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // Document Submissions states
  const [submissions, setSubmissions] = useState<DocumentSubmissionItem[]>([]);
  const [subDocFilter, setSubDocFilter] = useState<"All" | "pending_review" | "approved" | "rejected">("All");
  const [rejectingSubmissionId, setRejectingSubmissionId] = useState<string | null>(null);
  const [submissionFeedback, setSubmissionFeedback] = useState("");

  // Notifications states
  const [notifList, setNotifList] = useState<AppNotification[]>([]);
  const [notifTarget, setNotifTarget] = useState("All");
  const [notifPriority, setNotifPriority] = useState<"normal" | "urgent" | "announcement">("announcement");
  const [notifTitle, setNotifTitle] = useState("");
  const [notifMessage, setNotifMessage] = useState("");
  const [notifSuccessToast, setNotifSuccessToast] = useState<string | null>(null);

  // LYDP Goals CRUD States
  const [lydpGoals, setLydpGoals] = useState<LYDPGoal[]>([]);
  const [editingGoal, setEditingGoal] = useState<LYDPGoal | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  
  // New/Edit Goal form fields
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState<"Health" | "Education" | "Livelihood" | "Environment" | "Governance" | "Safety">("Education");
  const [formDesc, setFormDesc] = useState("");
  const [formYear, setFormYear] = useState(2026);

  // Criteria States
  const [rulesList, setRulesList] = useState(COMPLIANCE_CRITERIA_DEFAULT);
  const [isEditingRule, setIsEditingRule] = useState<string | null>(null);
  const [ruleEditValue, setRuleEditValue] = useState("");

  const refreshData = () => {
    setAccounts(getBarangayAccounts());
    setSubmissions(getDocumentSubmissions());
    setNotifList(getAppNotifications("All"));
    setLydpGoals(getMasterLYDPGoals());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener("skompas_accounts_updated", refreshData);
    window.addEventListener("skompas_submissions_updated", refreshData);
    window.addEventListener("skompas_notifications_updated", refreshData);
    return () => {
      window.removeEventListener("skompas_accounts_updated", refreshData);
      window.removeEventListener("skompas_submissions_updated", refreshData);
      window.removeEventListener("skompas_notifications_updated", refreshData);
    };
  }, []);

  // Account actions
  const handleApproveAccount = (id: string) => {
    approveBarangayAccount(id, user?.displayName || "LYDO Officer");
    refreshData();
  };

  const handleConfirmRejectAccount = () => {
    if (!rejectingAccountId) return;
    rejectBarangayAccount(rejectingAccountId, rejectionReason || "Incomplete municipal credential accreditation.", user?.displayName || "LYDO Officer");
    setRejectingAccountId(null);
    setRejectionReason("");
    refreshData();
  };

  // Document review actions
  const handleApproveSubmission = (id: string) => {
    reviewDocumentSubmission({
      submissionId: id,
      status: "approved",
      reviewedBy: user?.displayName || "LYDO Officer",
      remarks: "Official compliance verified. Successfully saved in barangay records and archived."
    });
    refreshData();
  };

  const handleConfirmRejectSubmission = () => {
    if (!rejectingSubmissionId) return;
    reviewDocumentSubmission({
      submissionId: rejectingSubmissionId,
      status: "rejected",
      reviewedBy: user?.displayName || "LYDO Officer",
      remarks: submissionFeedback || "Revisions required for statutory alignment."
    });
    setRejectingSubmissionId(null);
    setSubmissionFeedback("");
    refreshData();
  };

  // Send notification
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    addAppNotification({
      targetType: notifTarget === "All" ? "broadcast" : "private",
      targetBarangay: notifTarget,
      title: notifTitle.trim(),
      message: notifMessage.trim(),
      sender: user?.displayName ? `${user.displayName} (LYDO)` : "Municipal LYDO Officer",
      priority: notifPriority
    });

    setNotifSuccessToast(`Directive sent to ${notifTarget === "All" ? "all 40 Barangays" : `Barangay ${notifTarget}`}!`);
    setNotifTitle("");
    setNotifMessage("");
    setTimeout(() => setNotifSuccessToast(null), 3000);
    refreshData();
  };

  const handleSaveGoals = (updatedGoals: LYDPGoal[]) => {
    setLydpGoals(updatedGoals);
    saveMasterLYDPGoals(updatedGoals);
  };

  const handleStartAddGoal = () => {
    setIsAddingGoal(true);
    setEditingGoal(null);
    setFormTitle("");
    setFormCategory("Education");
    setFormDesc("");
    setFormYear(2026);
  };

  const handleStartEditGoal = (goal: LYDPGoal) => {
    setEditingGoal(goal);
    setIsAddingGoal(false);
    setFormTitle(goal.title);
    setFormCategory(goal.category);
    setFormDesc(goal.description);
    setFormYear(goal.targetYear);
  };

  const handleSaveGoalForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) return;

    if (editingGoal) {
      const updated = lydpGoals.map(g => g.id === editingGoal.id ? {
        ...g,
        title: formTitle,
        category: formCategory,
        description: formDesc,
        targetYear: Number(formYear)
      } : g);
      handleSaveGoals(updated);
      setEditingGoal(null);
    } else {
      const newGoal: LYDPGoal = {
        id: `goal-${Date.now()}`,
        title: formTitle,
        category: formCategory,
        description: formDesc,
        targetYear: Number(formYear)
      };
      handleSaveGoals([...lydpGoals, newGoal]);
      setIsAddingGoal(false);
    }
    setFormTitle("");
    setFormDesc("");
  };

  const handleDeleteGoal = (goalId: string) => {
    if (confirm("Are you sure you want to remove this municipal LYDP goal?")) {
      const filtered = lydpGoals.filter(g => g.id !== goalId);
      handleSaveGoals(filtered);
    }
  };

  // Filtered Barangays
  const filteredBarangays = BARANGAYS_40.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchBarangay.toLowerCase());
    const matchesStatus = statusFilter === "All" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Accounts
  const filteredAccounts = accounts.filter(acc => {
    if (accountFilter === "All") return true;
    return acc.status === accountFilter;
  });

  // Filtered Submissions
  const filteredSubmissions = submissions.filter(sub => {
    if (subDocFilter === "All") return true;
    return sub.status === subDocFilter;
  });

  // Aggregate stats
  const totalBarangays = BARANGAYS_40.length;
  const compliantCount = BARANGAYS_40.filter(b => b.status === "Compliant").length;
  const pendingCount = BARANGAYS_40.filter(b => b.status === "Pending Review").length;
  const incompleteCount = BARANGAYS_40.filter(b => b.status === "Incomplete" || b.status === "Overdue").length;

  const pendingAccountsCount = accounts.filter(a => a.status === "pending").length;
  const pendingSubmissionsCount = submissions.filter(s => s.status === "pending_review").length;

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col font-sans pb-16">
      {/* Admin Header Cover Card */}
      <div className="bg-[#0C1E36] text-white py-10 px-6 sm:px-8 md:px-12 relative overflow-hidden shadow-xl shadow-black/10">
        <div className="absolute inset-0 bg-[radial-gradient(#264a7f_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-[#C89311] text-white text-[9px] font-black rounded-lg uppercase tracking-[0.2em] shadow-md shadow-amber-600/30">
                LYDO Executive
              </span>
              <div className="h-px w-8 bg-zinc-600" />
              <div className="text-[10px] font-bold text-amber-200/80 uppercase tracking-widest flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5" />
                Local Youth Development Office • 40 Barangays Jurisdiction
              </div>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-none uppercase italic">
              LYDO Officer Oversight Portal
            </h1>
            <p className="text-zinc-400 text-xs mt-2 uppercase font-black tracking-widest">
              Authorized Officer: <span className="text-white">{user?.displayName || "Municipal LYDO Officer"}</span>
            </p>
          </div>
          
          {/* Main Navigation Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab("board")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "board" 
                  ? "bg-white text-[#0C1E36] font-extrabold shadow-md" 
                  : "bg-slate-800 text-zinc-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              Monitoring Board (40)
            </button>

            <button
              onClick={() => setActiveTab("registrations")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activeTab === "registrations" 
                  ? "bg-white text-[#0C1E36] font-extrabold shadow-md" 
                  : "bg-slate-800 text-zinc-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-[#C89311]" />
              Registrations
              {pendingAccountsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[8px] font-black rounded-full bg-rose-500 text-white animate-pulse">
                  {pendingAccountsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("doc_reviews")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activeTab === "doc_reviews" 
                  ? "bg-white text-[#0C1E36] font-extrabold shadow-md" 
                  : "bg-slate-800 text-zinc-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              Document Approvals
              {pendingSubmissionsCount > 0 && (
                <span className="px-1.5 py-0.2 text-[8px] font-black rounded-full bg-amber-400 text-[#0C1E36]">
                  {pendingSubmissionsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("archives")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activeTab === "archives" 
                  ? "bg-white text-[#0C1E36] font-extrabold shadow-md" 
                  : "bg-slate-800 text-zinc-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              <Archive className="w-3.5 h-3.5 text-amber-300" />
              Archives
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-1.5 ${
                activeTab === "notifications" 
                  ? "bg-white text-[#0C1E36] font-extrabold shadow-md" 
                  : "bg-slate-800 text-zinc-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              <Send className="w-3.5 h-3.5 text-[#C89311]" />
              Notifications
            </button>

            <button
              onClick={() => setActiveTab("goals")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "goals" 
                  ? "bg-white text-[#0C1E36] font-extrabold shadow-md" 
                  : "bg-slate-800 text-zinc-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              LYDP Goals ({lydpGoals.length})
            </button>

            <button
              onClick={() => setActiveTab("rules")}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === "rules" 
                  ? "bg-white text-[#0C1E36] font-extrabold shadow-md" 
                  : "bg-slate-800 text-zinc-300 hover:text-white hover:bg-slate-700"
              }`}
            >
              Legal Rules
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl w-full mx-auto px-6 mt-10">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white border border-zinc-200/80 p-8 rounded-[36px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group">
            <span className="text-[9px] font-black tracking-widest text-zinc-400 uppercase block mb-1">Barangay Units</span>
            <div className="text-4xl font-black text-[#0C1E36] tracking-tight mb-2">{totalBarangays} / 40</div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Maximum Statutory Cap</span>
          </div>

          <div className="bg-white border border-emerald-100 p-8 rounded-[36px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border-l-4 border-l-emerald-500">
            <span className="text-[9px] font-black tracking-widest text-emerald-600 uppercase block mb-1">Compliant Teams</span>
            <div className="text-4xl font-black text-emerald-600 tracking-tight mb-2">{compliantCount}</div>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
              {Math.round((compliantCount / totalBarangays) * 100)}% Passing Rate
            </span>
          </div>

          <div className="bg-white border border-amber-100 p-8 rounded-[36px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border-l-4 border-l-amber-500">
            <span className="text-[9px] font-black tracking-widest text-[#C89311] uppercase block mb-1">Registration Queue</span>
            <div className="text-4xl font-black text-[#C89311] tracking-tight mb-2">{pendingAccountsCount}</div>
            <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider block">Accounts Awaiting Review</span>
          </div>

          <div className="bg-white border border-rose-100 p-8 rounded-[36px] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group border-l-4 border-l-rose-500">
            <span className="text-[9px] font-black tracking-widest text-rose-600 uppercase block mb-1">Document Reviews</span>
            <div className="text-4xl font-black text-rose-500 tracking-tight mb-2">{pendingSubmissionsCount}</div>
            <span className="text-[10px] text-rose-700 font-bold uppercase tracking-wider block">Statutory Submissions</span>
          </div>
        </div>

        {/* Tab 1: Executive Monitoring Board (The 40 barangays) */}
        {activeTab === "board" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#eee] p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-black text-[#0C1E36] uppercase italic tracking-tight">
                    Barangay Assembly Submission Tracker
                  </h3>
                  <p className="text-xs text-[#888] font-medium">
                    Simultaneous real-time dashboard tracking local SK legislative compilations for all 40 municipal barangays.
                  </p>
                </div>
                
                {/* Search & Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:flex-initial">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="Search barangay..."
                      value={searchBarangay}
                      onChange={(e) => setSearchBarangay(e.target.value)}
                      className="pl-11 pr-4 py-3 bg-[#FDFCFB] border border-zinc-200 focus:outline-none focus:border-[#0C1E36] rounded-2xl text-xs font-bold w-full md:w-60"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#FDFCFB] border px-3.5 py-3 rounded-2xl">
                    <ListFilter className="w-4 h-4 text-zinc-400" />
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-xs font-extrabold text-[#0C1E36] focus:outline-none uppercase tracking-wider"
                    >
                      <option value="All">All statuses</option>
                      <option value="Compliant">Compliant</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Incomplete">Incomplete</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grid of Barangays */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
                {filteredBarangays.map((b, idx) => {
                  const isComp = b.status === "Compliant";
                  const isPend = b.status === "Pending Review";
                  const isInc = b.status === "Incomplete";

                  return (
                    <div 
                      key={idx} 
                      className="border border-[#eee] rounded-2xl bg-white p-5 hover:border-zinc-300 hover:shadow-md transition-all space-y-4 relative overflow-hidden group"
                    >
                      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                        isComp ? "bg-emerald-500" : isPend ? "bg-amber-400" : isInc ? "bg-amber-600" : "bg-red-500"
                      }`} />

                      <div className="flex items-start justify-between pl-2">
                        <div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Barangay</span>
                          <span className="text-base font-black text-[#0C1E36] block tracking-tight group-hover:text-[#C89311] transition-colors">
                            {b.name}
                          </span>
                        </div>
                        <div className={`px-2 py-1 rounded text-[8px] font-black uppercase tracking-widest whitespace-nowrap ${
                          isComp ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                          isPend ? "bg-amber-50 text-amber-600 border border-amber-100" : 
                          isInc ? "bg-orange-50 text-orange-600 border border-orange-100" : 
                          "bg-red-50 text-red-600 border border-red-100"
                        }`}>
                          {b.status}
                        </div>
                      </div>

                      <div className="pl-2 grid grid-cols-3 gap-2 py-3 border-t border-b border-dashed border-[#eee] text-center">
                        <div>
                          <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">CBYDP</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${b.cbydp === "Approved" ? "text-emerald-600" : "text-zinc-400"}`}>
                            {b.cbydp}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">ABYIP</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${b.abyip === "Approved" ? "text-emerald-600" : b.abyip === "Pending" ? "text-amber-500" : "text-red-500"}`}>
                            {b.abyip}
                          </span>
                        </div>
                        <div>
                          <span className="block text-[8px] font-black text-zinc-400 uppercase tracking-widest">Minutes</span>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${b.minutes === "Completed" ? "text-emerald-600" : "text-zinc-400"}`}>
                            {b.minutes}
                          </span>
                        </div>
                      </div>

                      <div className="pl-2 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
                        <span className="text-zinc-400">Compliance score</span>
                        <span className={`font-black text-sm ${isComp ? "text-emerald-500" : "text-[#0C1E36]"}`}>
                          {b.score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredBarangays.length === 0 && (
                <div className="py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs space-y-2">
                  <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center mx-auto mb-2 text-zinc-300">
                    <Search className="w-6 h-6" />
                  </div>
                  No matching barangays found in current filters
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Barangay Registrations & Account Approval */}
        {activeTab === "registrations" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#eee] p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-[#0C1E36] uppercase italic tracking-tight">
                      Barangay Account Accreditation
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-[#C89311] border border-amber-200">
                      LYDO Authority
                    </span>
                  </div>
                  <p className="text-xs text-[#888] font-medium mt-1">
                    Review and authorize newly registered barangay council accounts. Approved accounts receive login authorization instantly.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(["All", "pending", "approved", "rejected"] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setAccountFilter(st)}
                      className={`px-3.5 py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${
                        accountFilter === st
                          ? "bg-[#0C1E36] text-white border-[#0C1E36] shadow-xs"
                          : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      {st} {st === "pending" && pendingAccountsCount > 0 && `(${pendingAccountsCount})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accounts list */}
              <div className="space-y-3">
                {filteredAccounts.length === 0 ? (
                  <div className="py-16 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
                    <UserCheck className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    No accounts matching "{accountFilter}" status
                  </div>
                ) : (
                  filteredAccounts.map(account => (
                    <div
                      key={account.id}
                      className="p-6 rounded-2xl border border-zinc-200/80 bg-white hover:border-amber-300/60 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black text-[#0C1E36] bg-amber-500/10 border border-amber-300/40 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#C89311]" />
                            Barangay {account.barangayName}
                          </span>

                          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">
                            {account.role}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            account.status === "approved"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : account.status === "pending"
                                ? "bg-amber-100 text-amber-900 border border-amber-200 animate-pulse"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}>
                            {account.status}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-[#0C1E36] tracking-tight">
                          {account.officialName}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 font-medium">
                          <span>Email: <strong className="text-zinc-700">{account.email}</strong></span>
                          <span>Contact: <strong className="text-zinc-700">{account.contactNumber}</strong></span>
                          <span>Registered: {new Date(account.createdAt).toLocaleDateString()}</span>
                        </div>

                        {account.rejectionReason && (
                          <p className="text-xs text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-100 italic">
                            Rejection Note: "{account.rejectionReason}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {account.status !== "approved" && (
                          <button
                            onClick={() => handleApproveAccount(account.id)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve Account
                          </button>
                        )}

                        {account.status !== "rejected" && (
                          <button
                            onClick={() => {
                              setRejectingAccountId(account.id);
                              setRejectionReason("");
                            }}
                            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-rose-200 flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Document Submissions & LYDO Approvals */}
        {activeTab === "doc_reviews" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#eee] p-8 rounded-3xl shadow-sm space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-[#0C1E36] uppercase italic tracking-tight">
                      Statutory Document Review & Certification
                    </h3>
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Annual Budget • ABYIP • CBYDP
                    </span>
                  </div>
                  <p className="text-xs text-[#888] font-medium mt-1">
                    Approve or reject submitted documents. Approved documents are automatically saved to the official barangay records and permanently archived.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(["All", "pending_review", "approved", "rejected"] as const).map(st => (
                    <button
                      key={st}
                      onClick={() => setSubDocFilter(st)}
                      className={`px-3.5 py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${
                        subDocFilter === st
                          ? "bg-[#0C1E36] text-white border-[#0C1E36] shadow-xs"
                          : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                      }`}
                    >
                      {st.replace('_', ' ')} {st === "pending_review" && pendingSubmissionsCount > 0 && `(${pendingSubmissionsCount})`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Document submissions list */}
              <div className="space-y-4">
                {filteredSubmissions.length === 0 ? (
                  <div className="py-16 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
                    <FileCheck className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                    No submissions currently matching "{subDocFilter}"
                  </div>
                ) : (
                  filteredSubmissions.map(sub => (
                    <div
                      key={sub.id}
                      className="p-6 rounded-2xl border border-zinc-200/80 bg-white hover:border-amber-300/60 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                            sub.docType === "Annual Budget"
                              ? "bg-amber-100 text-[#C89311] border border-amber-200"
                              : sub.docType === "ABYIP"
                                ? "bg-sky-100 text-sky-800 border border-sky-200"
                                : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                          }`}>
                            {sub.docType}
                          </span>

                          <span className="text-[10px] font-bold text-[#0C1E36] bg-amber-500/10 border border-amber-300/40 px-2 py-0.5 rounded flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-[#C89311]" />
                            Barangay {sub.barangayName}
                          </span>

                          <span className="text-[10px] font-black text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-zinc-400" />
                            Cycle: {sub.yearOrPeriod}
                          </span>

                          <span className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            sub.status === "approved"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : sub.status === "pending_review"
                                ? "bg-amber-100 text-amber-900 border border-amber-200 animate-pulse"
                                : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}>
                            {sub.status.replace('_', ' ')}
                          </span>
                        </div>

                        <h4 className="text-base font-black text-[#0C1E36]">
                          {sub.title}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-zinc-500 font-medium">
                          {sub.totalBudget !== undefined && (
                            <span className="font-bold text-[#0C1E36] flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-[#C89311]" />
                              Amount: ₱{sub.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          )}
                          <span>Submitted by: <strong className="text-zinc-700">{sub.submittedBy}</strong></span>
                          <span>Date: {new Date(sub.submittedAt).toLocaleDateString()}</span>
                        </div>

                        {sub.remarks && (
                          <p className="text-xs text-zinc-600 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 italic">
                            Review Notes: "{sub.remarks}"
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {sub.status !== "approved" && (
                          <button
                            onClick={() => handleApproveSubmission(sub.id)}
                            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Approve Document
                          </button>
                        )}

                        {sub.status !== "rejected" && (
                          <button
                            onClick={() => {
                              setRejectingSubmissionId(sub.id);
                              setSubmissionFeedback("");
                            }}
                            className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all border border-rose-200 flex items-center gap-1.5"
                          >
                            <X className="w-3.5 h-3.5" />
                            Reject & Request Revision
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Municipal Archives (Full access to all 40 barangays) */}
        {activeTab === "archives" && (
          <div className="space-y-6">
            <DocumentArchiveManager isModal={false} />
          </div>
        )}

        {/* Tab 5: Dispatch Notifications (Private & General Broadcasts) */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Form */}
              <div className="lg:col-span-5 bg-white border border-[#eee] p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-black text-[#0C1E36] tracking-tight uppercase italic">
                      Dispatch Official Notice
                    </h3>
                    <span className="p-1.5 bg-amber-50 text-[#C89311] text-[8px] font-black uppercase tracking-widest rounded">
                      LYDO Directives
                    </span>
                  </div>
                  <p className="text-xs text-[#888] font-medium mt-1">
                    Send private instructions to a specific barangay or broadcast general notices to all 40 barangays.
                  </p>
                </div>

                <form onSubmit={handleSendNotification} className="space-y-4">
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                      Target Audience
                    </label>
                    <select
                      value={notifTarget}
                      onChange={(e) => setNotifTarget(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-[#0C1E36] focus:outline-none focus:border-[#C89311]"
                    >
                      <option value="All">📢 General Broadcast (All 40 Barangays)</option>
                      {MUNICIPAL_BARANGAYS_40.map(bgy => (
                        <option key={bgy} value={bgy}>🔒 Private Directive: Barangay {bgy}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                      Priority Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["announcement", "urgent", "normal"] as const).map(p => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setNotifPriority(p)}
                          className={`py-2 text-[9px] font-black uppercase rounded-xl border transition-all ${
                            notifPriority === p
                              ? "bg-[#0C1E36] text-white border-[#0C1E36]"
                              : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                      Subject / Title
                    </label>
                    <input
                      type="text"
                      required
                      value={notifTitle}
                      onChange={(e) => setNotifTitle(e.target.value)}
                      placeholder="e.g. Schedule of Annual Budget Deliberation"
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold placeholder-zinc-400 focus:outline-none focus:border-[#C89311]"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                      Directive Content
                    </label>
                    <textarea
                      rows={5}
                      required
                      value={notifMessage}
                      onChange={(e) => setNotifMessage(e.target.value)}
                      placeholder="Provide full details, legal references, deadlines, and requirements..."
                      className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold placeholder-zinc-400 focus:outline-none focus:border-[#C89311]"
                    />
                  </div>

                  {notifSuccessToast && (
                    <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{notifSuccessToast}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-[#C89311] hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Dispatch Notification
                  </button>
                </form>
              </div>

              {/* Logs */}
              <div className="lg:col-span-7 bg-white border border-[#eee] p-8 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wider text-[#0C1E36]">
                    Dispatched Directives Log ({notifList.length})
                  </h4>
                  <span className="text-[10px] text-zinc-400 font-bold uppercase">Audit Trail</span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                  {notifList.length === 0 ? (
                    <div className="py-12 text-center text-zinc-400 text-xs font-bold">
                      No notifications sent yet.
                    </div>
                  ) : (
                    notifList.map(item => (
                      <div key={item.id} className="p-4 rounded-2xl border border-zinc-200 bg-zinc-50/50 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                              item.priority === "urgent" ? "bg-rose-100 text-rose-800" :
                              item.priority === "announcement" ? "bg-amber-100 text-[#C89311]" :
                              "bg-sky-100 text-sky-800"
                            }`}>
                              {item.priority}
                            </span>
                            <span className="text-[9px] font-black uppercase text-zinc-600 bg-white border px-2 py-0.5 rounded">
                              {item.targetType === "broadcast" ? "General: All 40" : `Private: Bgy. ${item.targetBarangay}`}
                            </span>
                          </div>
                          <span className="text-[9px] text-zinc-400 font-bold">
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h5 className="text-xs font-black text-[#0C1E36]">{item.title}</h5>
                        <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Master LYDP Goals Manager */}
        {activeTab === "goals" && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Goals Form Panel */}
              <div className="w-full lg:w-[380px] bg-white border border-[#eee] p-8 rounded-3xl shadow-sm shrink-0 h-fit">
                <span className="text-[9px] font-black text-[#C89311] uppercase tracking-widest block mb-1">
                  LYDP Goals Editor
                </span>
                <h3 className="text-xl font-black text-[#0C1E36] tracking-tight mb-6 uppercase italic">
                  {editingGoal ? "Edit Goal Entry" : "Add Municipal Goal"}
                </h3>
                
                <form onSubmit={handleSaveGoalForm} className="space-y-5">
                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                      Goal / Program Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Free Professional Driving & Tech Seminars"
                      className="w-full px-4 py-3 bg-[#FDFCFB] border border-zinc-200 focus:outline-none focus:border-[#C89311] rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                      Framework Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-4 py-3 bg-[#FDFCFB] border border-zinc-200 focus:outline-none focus:border-[#C89311] rounded-xl text-xs font-bold"
                    >
                      <option value="Education">Education & Skills</option>
                      <option value="Health">Youth Health & Medicine</option>
                      <option value="Livelihood">Livelihoods & Finance</option>
                      <option value="Environment">Eco & Green Patrol</option>
                      <option value="Governance">Governance & Leadership</option>
                      <option value="Safety">Safety & Security</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                      Target Execution Year
                    </label>
                    <input
                      type="number"
                      required
                      value={formYear}
                      onChange={(e) => setFormYear(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-[#FDFCFB] border border-zinc-200 focus:outline-none focus:border-[#C89311] rounded-xl text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-2">
                      Municipal Objective Description
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formDesc}
                      onChange={(e) => setFormDesc(e.target.value)}
                      placeholder="Specify the measurable target and policy direction for all 40 barangays..."
                      className="w-full px-4 py-3 bg-[#FDFCFB] border border-zinc-200 focus:outline-none focus:border-[#C89311] rounded-xl text-xs font-bold"
                    />
                  </div>

                  {editingGoal && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingGoal(null);
                          setFormTitle("");
                          setFormDesc("");
                        }}
                        className="flex-1 py-3 bg-zinc-100 text-zinc-600 font-bold text-xs uppercase rounded-xl hover:bg-zinc-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-[#C89311] text-white font-bold text-xs uppercase rounded-xl hover:bg-amber-600 transition-colors shadow-md"
                      >
                        Apply Edit
                      </button>
                    </div>
                  )}

                  {!editingGoal && (
                    <button
                      type="submit"
                      className="w-full py-3 bg-[#C89311] text-white font-black text-[10px] uppercase tracking-[0.15em] rounded-xl hover:bg-[#0C1E36] transition-colors shadow-md"
                    >
                      Publish Municipal Goal
                    </button>
                  )}
                </form>
              </div>

              {/* Master Goals List Panel */}
              <div className="flex-1 bg-white border border-[#eee] p-8 rounded-3xl shadow-sm space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-[#0C1E36] tracking-tight uppercase italic">
                      Active Municipal LYDP Directory
                    </h3>
                    <span className="p-2 bg-amber-50 text-[#C89311] text-[9px] font-black uppercase tracking-widest rounded">
                      Linked Live System
                    </span>
                  </div>
                  <p className="text-xs text-[#888] font-medium leading-relaxed">
                    Below are the official goals set for the current municipal period. Any additions or edits immediately align the local barangays' annual and 3-year plans.
                  </p>
                </div>

                <div className="space-y-4">
                  {lydpGoals.map((g) => (
                    <div 
                      key={g.id}
                      className="p-6 border border-[#eee] rounded-2xl bg-[#FDFCFB]/50 hover:border-amber-200 hover:bg-amber-50/5 transition-all relative group"
                    >
                      <div className="flex items-start justify-between mb-3 gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[8px] font-black uppercase tracking-widest text-[#C89311] bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                              {g.category}
                            </span>
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                              ID: {g.id.toUpperCase()} • Target {g.targetYear}
                            </span>
                          </div>
                          <h4 className="text-base font-black text-[#0C1E36] tracking-tight mt-1">
                            {g.title}
                          </h4>
                        </div>
                        
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEditGoal(g)}
                            className="p-2 text-zinc-500 hover:text-[#C89311] hover:bg-amber-50 rounded-lg transition-colors"
                            title="Edit Goal"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(g.id)}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete Goal"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-[#555] leading-relaxed font-semibold">
                        {g.description}
                      </p>
                    </div>
                  ))}

                  {lydpGoals.length === 0 && (
                    <div className="py-12 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs space-y-2">
                      <div className="w-12 h-12 rounded-full border border-zinc-200 flex items-center justify-center mx-auto mb-2 text-zinc-300">
                        <Layers className="w-6 h-6" />
                      </div>
                      No live goals added. Create a municipal goal to initialize the guidelines.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 7: Compliance Rules */}
        {activeTab === "rules" && (
          <div className="space-y-6">
            <div className="bg-white border border-[#eee] p-8 rounded-3xl shadow-sm space-y-6">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-xl font-black text-[#0C1E36] tracking-tight uppercase italic">
                    Regulatory Audit Criteria Editor
                  </h3>
                  <span className="p-2 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-[0.15em] rounded">
                    Operational Core Rules
                  </span>
                </div>
                <p className="text-xs text-[#888] font-medium">
                  Define regulatory weights and citations for Republic Act No. 10742 and Commission on Audit (COA) standards.
                </p>
              </div>

              <div className="space-y-4">
                {rulesList.map((rule) => {
                  const isSysEditing = isEditingRule === rule.id;

                  return (
                    <div 
                      key={rule.id}
                      className="p-6 border rounded-2xl bg-[#FDFCFB] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded ${
                            rule.isMandatory ? "bg-red-50 text-red-600 border border-red-100" : "bg-zinc-100 text-zinc-600"
                          }`}>
                            {rule.isMandatory ? "Strict Mandatory" : "Advisory Check"}
                          </span>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                            Section: {rule.section} • Weight: {rule.weight}%
                          </span>
                        </div>
                        
                        <h4 className="text-sm font-black text-[#0C1E36] tracking-tight">
                          {rule.name}
                        </h4>

                        {isSysEditing ? (
                          <div className="flex gap-2 pt-2">
                            <input
                              type="text"
                              value={ruleEditValue}
                              onChange={(e) => setRuleEditValue(e.target.value)}
                              className="flex-1 px-4 py-2 bg-white border border-[#C89311] focus:outline-none rounded-xl text-xs font-bold"
                            />
                            <button
                              onClick={() => {
                                setRulesList(prev => prev.map(r => r.id === rule.id ? { ...r, rule: ruleEditValue } : r));
                                setIsEditingRule(null);
                              }}
                              className="px-4 py-2 bg-[#C89311] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#0C1E36]"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs text-[#555] font-semibold leading-relaxed">
                            {rule.rule}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {!isSysEditing && (
                          <button
                            onClick={() => {
                              setIsEditingRule(rule.id);
                              setRuleEditValue(rule.rule);
                            }}
                            className="px-4 py-2.5 border border-[#eee] rounded-xl text-[9px] font-black uppercase tracking-widest hover:border-[#C89311] transition-colors flex items-center gap-1.5 hover:text-[#C89311]"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            Modify Guideline
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Rejection Modal for Account */}
      <AnimatePresence>
        {rejectingAccountId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2 rounded-xl bg-rose-100">
                  <UserX className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#0C1E36]">Reject Account Registration</h4>
                  <p className="text-[11px] text-zinc-500">Provide an administrative reason for the council</p>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Reason for Rejection</label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Incomplete credentials, please contact the municipal LYDO office with your oath of office."
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectingAccountId(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRejectAccount}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shadow-md"
                >
                  Confirm Rejection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rejection Modal for Document */}
      <AnimatePresence>
        {rejectingSubmissionId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-200 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-600">
                <div className="p-2 rounded-xl bg-rose-100">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-sm text-[#0C1E36]">Request Document Revision</h4>
                  <p className="text-[11px] text-zinc-500">Provide feedback notes to the submitting barangay</p>
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black uppercase text-zinc-400 block mb-1">Audit Notes / Required Revisions</label>
                <textarea
                  rows={3}
                  value={submissionFeedback}
                  onChange={(e) => setSubmissionFeedback(e.target.value)}
                  placeholder="e.g. Please adjust the youth development fund allocation to strictly meet the 10% statutory cap."
                  className="w-full p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setRejectingSubmissionId(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRejectSubmission}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shadow-md"
                >
                  Return for Revision
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
