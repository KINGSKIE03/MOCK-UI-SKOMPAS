import { motion } from "motion/react";
import { UserRole } from "../types";
import { 
  Plus, Search, FileText, AlertCircle, CheckCircle2, Clock, ThumbsUp, ThumbsDown, Filter, BarChart3,
  Archive, ShieldCheck, Building2, FolderArchive, ExternalLink, X, Layers, History, CheckCircle, FileCheck2
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";
import { useAuth } from "../components/auth/AuthProvider";
import { MOCK_DOCUMENTS, MockDocument } from "../lib/mockData";
import { PlanningWorkflow } from "../components/workflow/PlanningWorkflow";
import { ComplianceManager } from "../components/compliance/ComplianceManager";
import { 
  getBarangayRecords, 
  getBarangayArchives, 
  getDocumentSubmissions, 
  BarangayRecord, 
  ArchiveDocument,
  DocumentSubmissionItem 
} from "../lib/barangayStore";

export function Dashboard() {
  const { role, user } = useAuth();
  const [documents, setDocuments] = useState<MockDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Barangay Records & Archives State
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveFilterType, setArchiveFilterType] = useState<"all" | "Annual Budget" | "ABYIP" | "CBYDP">("all");
  const [barangayRecords, setBarangayRecords] = useState<BarangayRecord[]>([]);
  const [barangayArchives, setBarangayArchives] = useState<ArchiveDocument[]>([]);
  const [barangaySubmissions, setBarangaySubmissions] = useState<DocumentSubmissionItem[]>([]);

  const activeBarangay = user?.barangayName || "San Jose";

  useEffect(() => {
    const syncBarangayData = () => {
      setBarangayRecords(getBarangayRecords(activeBarangay));
      setBarangayArchives(getBarangayArchives(activeBarangay));
      setBarangaySubmissions(getDocumentSubmissions(activeBarangay));
    };

    syncBarangayData();
    window.addEventListener("skompas_submissions_updated", syncBarangayData);
    window.addEventListener("skompas_archives_updated", syncBarangayData);

    // Simulate API fetch delay and load entries from storage
    const timer = setTimeout(() => {
      let baseDocs = [...MOCK_DOCUMENTS];
      
      // Load live submitted budgets from Treasurer
      const liveString = localStorage.getItem("skompas_submitted_budgets");
      if (liveString) {
        try {
          const parsed = JSON.parse(liveString);
          const formatted = parsed.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt)
          }));
          baseDocs = [...formatted, ...baseDocs];
        } catch (e) {
          console.error("Failed to load live submitted budgets", e);
        }
      }

      let filtered = baseDocs;
      // Data Isolation: SK Council members only access documents pertaining to their own barangay
      if (user?.barangayName) {
        filtered = filtered.filter(d => !d.barangayName || d.barangayName.toLowerCase() === user.barangayName.toLowerCase());
      }

      if (role === 'Secretary') {
        filtered = filtered.filter(d => d.type === 'needs');
      } else if (role === 'Treasurer') {
        filtered = filtered.filter(d => d.type === 'budget');
      }
      setDocuments(filtered);
      setLoading(false);
    }, 800);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("skompas_submissions_updated", syncBarangayData);
      window.removeEventListener("skompas_archives_updated", syncBarangayData);
    };
  }, [role, user?.barangayName, activeBarangay, refreshTrigger]);

  const handleApprove = (docId: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'approved' as const } : d));
    
    // Sync into shared storage
    const liveString = localStorage.getItem("skompas_submitted_budgets");
    if (liveString) {
      try {
        const parsed = JSON.parse(liveString);
        const updated = parsed.map((item: any) => 
          item.id === docId ? { ...item, status: 'approved' } : item
        );
        localStorage.setItem("skompas_submitted_budgets", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleReject = (docId: string) => {
    setDocuments(prev => prev.map(d => d.id === docId ? { ...d, status: 'rejected' as const } : d));
    
    // Sync into shared storage
    const liveString = localStorage.getItem("skompas_submitted_budgets");
    if (liveString) {
      try {
        const parsed = JSON.parse(liveString);
        const updated = parsed.map((item: any) => 
          item.id === docId ? { ...item, status: 'rejected' } : item
        );
        localStorage.setItem("skompas_submitted_budgets", JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || doc.status === activeTab;
    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <div className="w-12 h-12 border-4 border-[#C89311] border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-[#999] animate-pulse">Syncing Official Records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12 pb-20 relative">
      {/* Dynamic ambient color nodes */}
      <div className="absolute right-10 top-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute left-10 bottom-20 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10 border-b border-amber-200/30 pb-6">
        <div>
           <div className="flex flex-wrap items-center gap-3 mb-3">
             <div className="px-3.5 py-1.5 bg-gradient-to-r from-[#0C1E36] to-[#1a385f] text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-md shadow-[#0C1E36]/10">{role} Workspace Portal</div>
             <div className="h-1.5 w-1.5 bg-amber-400 rounded-full animate-ping" />
             <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-amber-50 border border-amber-200/60 px-3 py-1 rounded-full">Sangguniang Kabataan HQ</div>
           </div>
           <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-[#0C1E36]">
             Governance <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0C1E36] via-[#C89311] to-amber-600">Dashboard</span>
           </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsArchiveModalOpen(true)}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#0C1E36] text-white rounded-2xl text-[10px] uppercase tracking-widest font-black hover:bg-[#1a385f] active:scale-[0.98] transition-all shadow-md cursor-pointer"
          >
            <FolderArchive className="w-4 h-4 text-[#C89311]" />
            Document Archive / History
            {barangayArchives.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-[#C89311] text-[#0C1E36] rounded-full text-[9px] font-black">
                {barangayArchives.length}
              </span>
            )}
          </button>
          <button className="flex items-center gap-2.5 px-6 py-3 bg-white border border-zinc-200 rounded-2xl text-[10px] uppercase tracking-widest font-black text-zinc-700 hover:border-[#0C1E36] hover:text-[#0C1E36] active:scale-[0.98] transition-all shadow-sm">
            <BarChart3 className="w-4 h-4 text-[#C89311]" />
            Audit Report
          </button>
        </div>
      </div>

      {/* Barangay Data Isolation & Statutory Seal Banner */}
      <div className="relative z-10 bg-gradient-to-r from-[#FAF9F5] via-white to-[#F6F4EB] border border-[#C89311]/30 rounded-[32px] p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0C1E36] text-[#C89311] flex items-center justify-center shadow-md">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg font-black text-[#0C1E36] tracking-tight">Barangay {activeBarangay}</span>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Data Isolated
                </span>
              </div>
              <p className="text-xs text-zinc-500 font-medium">
                Sangguniang Kabataan Council Portal • Each barangay exclusively accesses its own documents & archives.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 border-t lg:border-t-0 lg:border-l border-zinc-200 lg:pl-6 pt-4 lg:pt-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-[#0C1E36]">{barangayRecords.length}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Official Records</div>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-[#0C1E36]">{barangaySubmissions.filter(s => s.status === 'pending_review').length}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Pending LYDO Review</div>
              </div>
            </div>

            <div className="h-8 w-px bg-zinc-200 hidden sm:block" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <Archive className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-black text-[#0C1E36]">{barangayArchives.length}</div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Archived Cycles</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sequential Planning & Budgeting Workflow */}
      {(role === "Chairman" || role === "Secretary" || role === "Treasurer") && (
        <div className="relative z-10 space-y-12">
          <PlanningWorkflow onRefreshDocs={() => setRefreshTrigger(prev => prev + 1)} />
          <ComplianceManager onRefreshDocs={() => setRefreshTrigger(prev => prev + 1)} />
        </div>
      )}

      {/* Repository Section */}
      <div className="bg-white border border-amber-200/30 rounded-[44px] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 relative z-10">
        <div className="p-8 border-b border-zinc-100 bg-[#FAF9F5]/40 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex gap-8 relative">
            {(['all', 'pending', 'approved', 'rejected'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.25em] pb-3 border-b-2 transition-all relative cursor-pointer",
                  activeTab === tab ? "border-[#C89311] text-[#0C1E36]" : "border-transparent text-zinc-400 hover:text-[#0C1E36]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-[#C89311] transition-colors" />
              <input 
                type="text" 
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-11 pr-5 py-3 bg-zinc-50 border border-zinc-200/80 focus:border-[#C89311] focus:ring-4 focus:ring-amber-500/10 rounded-2xl text-xs font-semibold focus:outline-none w-full md:w-72 transition-all placeholder:text-zinc-400"
              />
            </div>
            <button className="p-3 bg-zinc-50 border border-zinc-200 hover:border-amber-300 rounded-2xl text-zinc-500 hover:text-[#0C1E36] transition-all cursor-pointer">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50/40 border-b border-zinc-100">
                <th className="px-10 py-6 text-[9.5px] font-black text-zinc-400 uppercase tracking-[0.3em]">Document Reference</th>
                <th className="px-10 py-6 text-[9.5px] font-black text-zinc-400 uppercase tracking-[0.3em]">Category</th>
                <th className="px-10 py-6 text-[9.5px] font-black text-zinc-400 uppercase tracking-[0.3em]">Compliance</th>
                <th className="px-10 py-6 text-[9.5px] font-black text-zinc-400 uppercase tracking-[0.3em]">Timestamp</th>
                <th className="px-10 py-6 text-[9.5px] font-black text-zinc-400 uppercase tracking-[0.3em]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-10 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-[#ccc]">
                       <FileText className="w-16 h-16 opacity-10" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No matching records uncovered.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.map((doc, idx) => (
                <motion.tr 
                  key={doc.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="hover:bg-[#FDFCFB] transition-colors group"
                >
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-6">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                        doc.type === "needs" ? "bg-blue-50 text-blue-500" : "bg-amber-50 text-amber-600"
                      )}>
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-black text-[#0C1E36] mb-1 tracking-tight group-hover:text-[#C89311] transition-colors">{doc.title}</div>
                        <div className="text-[10px] font-bold text-[#aaa] uppercase tracking-widest">{doc.authorRole} • {doc.id.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <span className="px-4 py-1.5 bg-[#FDFCFB] border border-[#eee] rounded-full text-[10px] font-black text-[#666] tracking-widest uppercase">
                      {doc.type}
                    </span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-2">
                       {doc.status === "approved" ? (
                         <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                           <CheckCircle2 className="w-4 h-4" />
                           <span className="text-[10px] font-black uppercase tracking-widest">Approved</span>
                         </div>
                       ) : doc.status === "pending" ? (
                        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                        </div>
                       ) : (
                        <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-1.5 rounded-full border border-red-100">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Rejected</span>
                        </div>
                       )}
                    </div>
                  </td>
                  <td className="px-10 py-7 text-[11px] font-bold text-[#999] tabular-nums">
                    {doc.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link 
                        to={`/editor/${doc.id}`} 
                        className="text-[10px] font-black text-[#0C1E36] px-5 py-2.5 bg-white border border-[#eee] rounded-2xl hover:bg-[#0C1E36] hover:text-white transition-all transform active:scale-95"
                      >
                        OPEN PORTAL
                      </Link>
                      {role === 'Chairman' && doc.status === 'pending' && (
                        <div className="flex items-center gap-2 ml-2">
                          <button 
                            onClick={() => handleApprove(doc.id)}
                            className="p-3 text-green-600 hover:bg-green-50 rounded-2xl transition-all hover:scale-110 active:scale-90"
                            title="Approve"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleReject(doc.id)}
                            className="p-3 text-red-600 hover:bg-red-50 rounded-2xl transition-all hover:scale-110 active:scale-90"
                            title="Reject"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Approved Records Preserved in Barangay */}
      {barangayRecords.length > 0 && (
        <div className="bg-white border border-[#eee] rounded-[44px] p-8 shadow-sm space-y-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0C1E36]">Official Statutory Records</h3>
                <p className="text-xs text-zinc-500 font-medium">LYDO Approved Documents Preserved in Barangay {activeBarangay}</p>
              </div>
            </div>
            <span className="px-3.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-[10px] font-black uppercase tracking-wider">
              {barangayRecords.length} Documents Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {barangayRecords.map((record) => (
              <div key={record.id} className="p-6 bg-[#FAF9F5] border border-amber-200/40 rounded-3xl space-y-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                    record.docType === "Annual Budget" ? "bg-amber-100 text-amber-800" :
                    record.docType === "ABYIP" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                  )}>
                    {record.docType}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400">CY {record.yearOrPeriod}</span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-[#0C1E36] line-clamp-2">{record.title}</h4>
                  <div className="text-xs font-black text-[#C89311] mt-1">
                    PHP {record.totalBudget.toLocaleString()}
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-200/60 text-[10px] text-zinc-500 flex items-center justify-between">
                  <span>Approved by {record.approvedBy}</span>
                  <span>{new Date(record.approvedAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Archive / History Modal for Annual Budget, ABYIP, and CBYDP */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-zinc-200 rounded-[36px] max-w-4xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-zinc-100 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0C1E36] text-[#C89311] flex items-center justify-center">
                  <FolderArchive className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0C1E36]">Document Archive & History</h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Barangay {activeBarangay} • Preserved previous cycles of Annual Budget, ABYIP, and CBYDP
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsArchiveModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-500 flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Type Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {(["all", "Annual Budget", "ABYIP", "CBYDP"] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setArchiveFilterType(type)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                    archiveFilterType === type 
                      ? "bg-[#0C1E36] text-white shadow-sm" 
                      : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                  )}
                >
                  {type === "all" ? "All Archived Types" : type}
                </button>
              ))}
            </div>

            {/* Archive Document List */}
            <div className="space-y-4">
              {barangayArchives
                .filter(item => archiveFilterType === "all" || item.docType === archiveFilterType)
                .length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-zinc-200 rounded-3xl space-y-3">
                  <Archive className="w-12 h-12 text-zinc-300 mx-auto" />
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">No archived documents for this category yet.</p>
                  <p className="text-[11px] text-zinc-400 max-w-md mx-auto">
                    When Barangay {activeBarangay} creates and submits a new document/year, the old approved document will automatically be transferred to this archive.
                  </p>
                </div>
              ) : (
                barangayArchives
                  .filter(item => archiveFilterType === "all" || item.docType === archiveFilterType)
                  .map((item) => (
                    <div key={item.id} className="p-5 bg-[#FAF9F5] border border-zinc-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-300 transition-colors">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider",
                            item.docType === "Annual Budget" ? "bg-amber-100 text-amber-800" :
                            item.docType === "ABYIP" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                          )}>
                            {item.docType}
                          </span>
                          <span className="text-[10px] font-bold text-zinc-500">Period: {item.yearOrPeriod}</span>
                          <span className="text-[9px] px-2 py-0.5 bg-zinc-200/70 text-zinc-600 rounded-full">
                            Archived {new Date(item.archivedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-[#0C1E36]">{item.title}</h4>
                        <p className="text-xs text-zinc-500">{item.remarks}</p>
                      </div>

                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <div className="text-xs font-black text-[#0C1E36]">PHP {item.totalBudget.toLocaleString()}</div>
                          <div className="text-[9px] text-zinc-400">Total Statutory Allocation</div>
                        </div>
                        <span className="px-3 py-1.5 bg-white border border-zinc-200 text-zinc-700 rounded-xl text-[10px] font-bold uppercase tracking-wider">
                          Preserved
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 text-[10px] text-zinc-400">
              <span>Automatic Archiving active in compliance with RA 10742</span>
              <button 
                onClick={() => setIsArchiveModalOpen(false)}
                className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-black uppercase tracking-wider text-[10px] transition-colors cursor-pointer"
              >
                Close Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
