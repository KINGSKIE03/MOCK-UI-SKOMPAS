import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Archive, 
  Search, 
  Filter, 
  Calendar, 
  Building2, 
  FileText, 
  Coins, 
  CheckCircle2, 
  Eye, 
  Printer, 
  Download, 
  ShieldCheck, 
  Layers, 
  Info,
  X,
  Sparkles,
  ArrowUpDown
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { 
  DocumentArchiveItem, 
  UserRole 
} from "../../types";
import { 
  getDocumentArchives, 
  MUNICIPAL_BARANGAYS_40 
} from "../../lib/barangayStore";

interface DocumentArchiveManagerProps {
  initialFilterType?: "All" | "CBYDP" | "ABYIP" | "Annual Budget";
  onClose?: () => void;
  isModal?: boolean;
}

export function DocumentArchiveManager({ 
  initialFilterType = "All", 
  onClose,
  isModal = false 
}: DocumentArchiveManagerProps) {
  const { role, activeBarangay, user } = useAuth();
  const isLydo = role === "Admin";

  const [archives, setArchives] = useState<DocumentArchiveItem[]>([]);
  const [selectedBarangayFilter, setSelectedBarangayFilter] = useState<string>(isLydo ? "All" : activeBarangay || "Poblacion");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>(initialFilterType);
  const [searchQuery, setSearchQuery] = useState("");
  const [inspectItem, setInspectItem] = useState<DocumentArchiveItem | null>(null);

  const loadArchives = () => {
    const data = getDocumentArchives();
    setArchives(data);
  };

  useEffect(() => {
    loadArchives();
    window.addEventListener("skompas_archives_updated", loadArchives);
    return () => window.removeEventListener("skompas_archives_updated", loadArchives);
  }, []);

  // Filter archives based on role and filters
  const filteredArchives = archives.filter(item => {
    // Barangay Isolation: Non-LYDO can only access their own barangay
    if (!isLydo) {
      const userBgy = (activeBarangay || "Poblacion").toLowerCase();
      if (item.barangayName.toLowerCase() !== userBgy) {
        return false;
      }
    } else {
      // LYDO can filter by specific barangay or view all
      if (selectedBarangayFilter !== "All" && item.barangayName.toLowerCase() !== selectedBarangayFilter.toLowerCase()) {
        return false;
      }
    }

    // Filter by type
    if (selectedTypeFilter !== "All" && item.docType !== selectedTypeFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchYear = item.yearOrPeriod.toLowerCase().includes(q);
      const matchBgy = item.barangayName.toLowerCase().includes(q);
      const matchRemarks = item.remarks ? item.remarks.toLowerCase().includes(q) : false;
      if (!matchTitle && !matchYear && !matchBgy && !matchRemarks) {
        return false;
      }
    }

    return true;
  });

  const totalArchivedBudget = filteredArchives.reduce((sum, item) => sum + (item.totalBudget || 0), 0);

  return (
    <div className={`space-y-6 ${isModal ? "p-6" : ""}`}>
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[28px] border border-amber-200/50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-300/40 flex items-center justify-center text-[#C89311]">
            <Archive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#0C1E36] tracking-tight">Document Archive & History</h2>
              <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-100 text-[#C89311] border border-amber-200">
                Official Records
              </span>
            </div>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">
              {isLydo 
                ? "Municipal Central Vault: View and audit historical CBYDP, ABYIP, and Annual Budgets for all 40 barangays."
                : `Archival records for Barangay ${activeBarangay || "Poblacion"}. Previous approved cycles are permanently preserved.`}
            </p>
          </div>
        </div>

        {isModal && onClose && (
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-[#0C1E36] hover:bg-zinc-100 rounded-xl self-start md:self-center"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-zinc-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Preserved Documents</span>
            <FileText className="w-4 h-4 text-[#0C1E36]" />
          </div>
          <div className="text-2xl font-black text-[#0C1E36] mt-2">{filteredArchives.length}</div>
          <span className="text-[9px] font-semibold text-zinc-500">Official statutory archives</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Total Archived Funds</span>
            <Coins className="w-4 h-4 text-[#C89311]" />
          </div>
          <div className="text-2xl font-black text-[#C89311] mt-2">
            ₱{totalArchivedBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] font-semibold text-zinc-500">Historical allocations logged</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-zinc-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400">Jurisdiction Scope</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-[#0C1E36] mt-2">
            {isLydo ? (selectedBarangayFilter === "All" ? "40 Barangays" : `Bgy. ${selectedBarangayFilter}`) : `Bgy. ${activeBarangay || "Poblacion"}`}
          </div>
          <span className="text-[9px] font-semibold text-zinc-500">
            {isLydo ? "Municipal LYDO Oversight" : "Local SK Custody"}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/70 shadow-xs flex flex-col md:flex-row items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search archive by year, title, or keywords..."
            className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold placeholder-zinc-400 focus:outline-none focus:border-[#C89311]"
          />
        </div>

        {/* Doc Type Selector */}
        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          {(["All", "Annual Budget", "ABYIP", "CBYDP"] as const).map(t => (
            <button
              key={t}
              onClick={() => setSelectedTypeFilter(t)}
              className={`px-3.5 py-2 text-[10px] font-black uppercase rounded-xl border transition-all whitespace-nowrap ${
                selectedTypeFilter === t
                  ? "bg-[#0C1E36] text-white border-[#0C1E36] shadow-xs"
                  : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* LYDO Barangay Selector (Only visible for LYDO) */}
        {isLydo && (
          <div className="w-full md:w-48">
            <select
              value={selectedBarangayFilter}
              onChange={(e) => setSelectedBarangayFilter(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-50 border border-amber-300/50 rounded-xl text-xs font-bold text-[#0C1E36] focus:outline-none"
            >
              <option value="All">All 40 Barangays</option>
              {MUNICIPAL_BARANGAYS_40.map(bgy => (
                <option key={bgy} value={bgy}>Barangay {bgy}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Archives List */}
      <div className="space-y-3">
        {filteredArchives.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-dashed border-zinc-300">
            <Archive className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-zinc-600">No Historical Archive Records Found</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Approved documents will automatically appear here when new planning cycles are established.
            </p>
          </div>
        ) : (
          filteredArchives.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-5 rounded-2xl border border-zinc-200/80 hover:border-amber-300/60 shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    item.docType === "Annual Budget" 
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : item.docType === "ABYIP"
                        ? "bg-sky-100 text-sky-900 border border-sky-300"
                        : "bg-indigo-100 text-indigo-900 border border-indigo-300"
                  }`}>
                    {item.docType}
                  </span>

                  <span className="text-[10px] font-black text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {item.yearOrPeriod}
                  </span>

                  {isLydo && (
                    <span className="text-[10px] font-bold text-[#0C1E36] bg-amber-500/10 border border-amber-300/40 px-2 py-0.5 rounded flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-[#C89311]" />
                      Brgy. {item.barangayName}
                    </span>
                  )}

                  <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Archived & Certified
                  </span>
                </div>

                <h4 className="text-sm font-black text-[#0C1E36] group-hover:text-[#C89311] transition-colors">
                  {item.title}
                </h4>

                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-[11px] text-zinc-500 font-medium">
                  {item.totalBudget !== undefined && (
                    <span className="font-bold text-[#0C1E36]">
                      Allocation: ₱{item.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  )}
                  <span>Approved By: {item.approvedBy}</span>
                  <span>Archived: {new Date(item.archivedAt).toLocaleDateString()}</span>
                </div>

                {item.remarks && (
                  <p className="text-[11px] text-zinc-500 italic bg-zinc-50 p-2 rounded-xl border border-zinc-100">
                    "{item.remarks}"
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <button
                  onClick={() => setInspectItem(item)}
                  className="px-4 py-2 bg-[#0C1E36] hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  View Snapshot
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Snapshot Inspect Modal */}
      <AnimatePresence>
        {inspectItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[32px] max-w-2xl w-full p-8 shadow-2xl border border-amber-200/60 max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-[#C89311] text-[9px] font-black uppercase tracking-widest border border-amber-200">
                      {inspectItem.docType} Historical Vault
                    </span>
                    <span className="text-xs font-bold text-zinc-500">
                      Cycle: {inspectItem.yearOrPeriod}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-[#0C1E36]">{inspectItem.title}</h3>
                  <p className="text-xs text-zinc-500 font-medium">
                    Barangay {inspectItem.barangayName} SK Council
                  </p>
                </div>
                <button
                  onClick={() => setInspectItem(null)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 rounded-xl hover:bg-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60">
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Archived Date</span>
                  <span className="text-xs font-bold text-zinc-800">{new Date(inspectItem.archivedAt).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Certifying Authority</span>
                  <span className="text-xs font-bold text-zinc-800">{inspectItem.approvedBy}</span>
                </div>
                {inspectItem.totalBudget !== undefined && (
                  <div>
                    <span className="text-[10px] font-black uppercase text-zinc-400 block">Certified Total</span>
                    <span className="text-sm font-black text-[#C89311]">
                      ₱{inspectItem.totalBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Vault Status</span>
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Audited & Sealed
                  </span>
                </div>
              </div>

              {inspectItem.summaryData && (
                <div className="space-y-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-zinc-600">Archived Record Details</h5>
                  <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-200/40 space-y-2 text-xs">
                    {Object.entries(inspectItem.summaryData).map(([k, v]) => (
                      <div key={k} className="flex justify-between border-b border-amber-200/30 pb-1">
                        <span className="font-bold text-zinc-600 capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>
                        <span className="text-zinc-800 font-semibold">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inspectItem.remarks && (
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase text-zinc-400 block">Audit & Archival Remarks</span>
                  <p className="text-xs text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-200">
                    {inspectItem.remarks}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Official Archive Record
                </button>
                <button
                  onClick={() => setInspectItem(null)}
                  className="px-5 py-2.5 bg-[#0C1E36] text-white text-xs font-bold rounded-xl transition-all hover:bg-slate-800"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
