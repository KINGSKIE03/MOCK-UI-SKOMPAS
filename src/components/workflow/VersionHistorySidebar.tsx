import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  History, 
  X, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  ChevronRight, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  Layers, 
  Check, 
  Sparkles, 
  FileSpreadsheet, 
  ShieldCheck,
  ArrowRight,
  ExternalLink
} from "lucide-react";
import { DocumentVersion, VersionDocType, UserRole } from "../../types";
import { 
  getDocumentVersions, 
  saveDocumentVersion, 
  restoreDocumentVersion, 
  deleteDocumentVersion,
  getVersionsSummary 
} from "../../lib/versionStore";
import { cn } from "../../lib/utils";

interface VersionHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeDocType?: VersionDocType | "all";
  defaultDocType?: VersionDocType | "all";
  barangayName?: string;
  currentUser?: { name?: string; role?: UserRole };
  currentDocSnapshot?: any;
  onVersionRestored?: (version: DocumentVersion, restoredDoc: any) => void;
  onOpenTemplate?: (docType: VersionDocType) => void;
}

export function VersionHistorySidebar({
  isOpen,
  onClose,
  activeDocType,
  defaultDocType = "all",
  barangayName = "Kapatagan",
  currentUser,
  currentDocSnapshot,
  onVersionRestored,
  onOpenTemplate
}: VersionHistorySidebarProps) {
  const effectiveDefaultType = activeDocType || defaultDocType;
  const [selectedFilter, setSelectedFilter] = useState<VersionDocType | "all">(effectiveDefaultType);
  const [searchQuery, setSearchQuery] = useState("");
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);
  const [isSnapshotModalOpen, setIsSnapshotModalOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<DocumentVersion | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreSuccessMsg, setRestoreSuccessMsg] = useState<string | null>(null);

  // Snapshot Form State
  const [snapshotDocType, setSnapshotDocType] = useState<VersionDocType>(
    activeDocType === "all" ? "CBYDP" : activeDocType
  );
  const [snapshotNote, setSnapshotNote] = useState("");
  const [snapshotChangeText, setSnapshotChangeText] = useState("");

  const refreshVersions = () => {
    const list = getDocumentVersions(selectedFilter, barangayName);
    setVersions(list);
  };

  useEffect(() => {
    refreshVersions();

    const handleUpdate = () => refreshVersions();
    window.addEventListener("skompas_versions_updated", handleUpdate);
    window.addEventListener("skompas_cbydp_updated", handleUpdate);
    return () => {
      window.removeEventListener("skompas_versions_updated", handleUpdate);
      window.removeEventListener("skompas_cbydp_updated", handleUpdate);
    };
  }, [selectedFilter, barangayName]);

  useEffect(() => {
    if (activeDocType && activeDocType !== "all") {
      setSelectedFilter(activeDocType);
      setSnapshotDocType(activeDocType);
    }
  }, [activeDocType]);

  const filteredVersions = versions.filter(v => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      v.versionTag.toLowerCase().includes(q) ||
      v.summaryNote.toLowerCase().includes(q) ||
      v.authorName.toLowerCase().includes(q) ||
      v.docType.toLowerCase().includes(q) ||
      (v.changes && v.changes.some(c => c.toLowerCase().includes(q)))
    );
  });

  const handleRestore = (version: DocumentVersion) => {
    setIsRestoring(true);
    try {
      const author = currentUser?.name || "Hon. Sangguniang Kabataan";
      const role = (currentUser?.role as string) || "Chairman";
      const result = restoreDocumentVersion(version.id, author, role);

      if (result.success && result.version) {
        setRestoreSuccessMsg(`Successfully restored ${version.docType} (${version.versionTag})!`);
        refreshVersions();
        if (onVersionRestored) {
          onVersionRestored(result.version, result.restoredDoc);
        }
        setVersionToRestore(null);
        setIsInspectModalOpen(false);
        setTimeout(() => setRestoreSuccessMsg(null), 4000);
      } else {
        alert(result.error || "Failed to restore version.");
      }
    } catch (e: any) {
      alert("Error restoring version: " + e.message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handleCreateSnapshot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotNote.trim()) return;

    const changes = snapshotChangeText
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);

    saveDocumentVersion({
      docType: snapshotDocType,
      barangayName,
      authorName: currentUser?.name || "Hon. Sangguniang Kabataan",
      authorRole: currentUser?.role || "Chairman",
      summaryNote: snapshotNote.trim(),
      changes: changes.length > 0 ? changes : ["Manual checkpoint snapshot created by user"],
      snapshot: currentDocSnapshot || {},
      status: "Draft",
      isCurrent: true
    });

    setSnapshotNote("");
    setSnapshotChangeText("");
    setIsSnapshotModalOpen(false);
    refreshVersions();
    setRestoreSuccessMsg(`Snapshot saved as latest ${snapshotDocType} version!`);
    setTimeout(() => setRestoreSuccessMsg(null), 3000);
  };

  const formatCurrency = (val?: number) => {
    if (typeof val !== "number") return "₱0.00";
    return `₱${val.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return iso;
    }
  };

  const getRelativeTime = (iso: string) => {
    try {
      const diffMs = Date.now() - new Date(iso).getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  const getDocTypeBadge = (type: VersionDocType) => {
    switch (type) {
      case "CBYDP":
        return { bg: "bg-purple-50 text-purple-700 border-purple-200", icon: Layers };
      case "ABYIP":
        return { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: FileSpreadsheet };
      case "Annual Budget":
        return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: DollarSign };
      default:
        return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: FileText };
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="version-sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="version-sidebar-panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed top-0 right-0 h-full w-full sm:w-[480px] lg:w-[540px] bg-white border-l border-zinc-200 shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 bg-[#FAF9F5]/70 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#0C1E36] text-[#C89311] flex items-center justify-center shadow-md">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black text-[#0C1E36] tracking-tight">Version History</h2>
                    <span className="px-2 py-0.5 bg-amber-100/70 border border-amber-200/80 rounded-full text-[9px] font-black uppercase tracking-wider text-amber-900">
                      Audit Trail
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">
                    Barangay {barangayName} • Historical Snapshots
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSnapshotModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0C1E36] text-white hover:bg-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
                  title="Create Manual Snapshot"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C89311]" />
                  <span>Snapshot</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-xl text-zinc-400 hover:text-[#0C1E36] hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Success Toast Notification */}
            <AnimatePresence>
              {restoreSuccessMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 text-emerald-800 text-xs font-semibold flex items-center gap-2.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{restoreSuccessMsg}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Document Type Filter Tabs */}
            <div className="px-6 pt-4 pb-2 border-b border-zinc-100 bg-white">
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
                {(["all", "CBYDP", "ABYIP", "Annual Budget", "Editor Document"] as const).map(tab => {
                  const isActive = selectedFilter === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setSelectedFilter(tab)}
                      className={cn(
                        "px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer",
                        isActive
                          ? "bg-[#0C1E36] text-[#C89311] shadow-sm"
                          : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800"
                      )}
                    >
                      {tab === "all" ? "All Documents" : tab}
                    </button>
                  );
                })}
              </div>

              {/* Search input */}
              <div className="relative mt-2">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search versions by author, note, or tag..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs font-medium focus:outline-none focus:border-[#C89311] focus:ring-2 focus:ring-amber-500/10 placeholder:text-zinc-400"
                />
              </div>
            </div>

            {/* Version List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filteredVersions.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <History className="w-12 h-12 text-zinc-300 mx-auto" />
                  <p className="text-sm font-bold text-zinc-700">No versions found</p>
                  <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                    No historical snapshots match your filter. You can take a snapshot anytime using the button above.
                  </p>
                </div>
              ) : (
                filteredVersions.map((version, index) => {
                  const badge = getDocTypeBadge(version.docType);
                  const BadgeIcon = badge.icon;
                  const isCurrent = version.isCurrent;

                  return (
                    <motion.div
                      key={version.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className={cn(
                        "p-5 rounded-2xl border transition-all relative overflow-hidden group",
                        isCurrent
                          ? "bg-[#FCFBF7] border-amber-300/80 shadow-md ring-1 ring-amber-400/20"
                          : "bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm"
                      )}
                    >
                      {/* Current Active Indicator Bar */}
                      {isCurrent && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#C89311] to-amber-500" />
                      )}

                      {/* Top row: Tags and Type */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "px-2.5 py-0.5 rounded-full text-[9.5px] font-black uppercase tracking-wider border flex items-center gap-1",
                              badge.bg
                            )}
                          >
                            <BadgeIcon className="w-3 h-3" />
                            {version.docType}
                          </span>

                          <span className="text-xs font-black text-[#0C1E36] tracking-tight">
                            {version.versionTag}
                          </span>

                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[8.5px] font-black uppercase tracking-wider flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] font-bold text-zinc-400 tabular-nums">
                          {getRelativeTime(version.timestamp)}
                        </span>
                      </div>

                      {/* Summary Note */}
                      <p className="text-xs text-zinc-700 font-medium leading-relaxed mb-3">
                        {version.summaryNote}
                      </p>

                      {/* Changes list preview */}
                      {version.changes && version.changes.length > 0 && (
                        <div className="mb-3 pl-3 border-l-2 border-amber-200/80 space-y-1">
                          {version.changes.slice(0, 2).map((c, idx) => (
                            <p key={idx} className="text-[10.5px] text-zinc-500 font-medium truncate">
                              • {c}
                            </p>
                          ))}
                          {version.changes.length > 2 && (
                            <p className="text-[9.5px] font-bold text-amber-700">
                              +{version.changes.length - 2} more documented revisions
                            </p>
                          )}
                        </div>
                      )}

                      {/* Metadata bar */}
                      <div className="flex items-center justify-between text-[10.5px] text-zinc-500 border-t border-zinc-100 pt-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-zinc-400" />
                          <span className="font-semibold text-zinc-700">{version.authorName}</span>
                          <span className="text-zinc-400">({version.authorRole})</span>
                        </div>

                        {version.totalBudget !== undefined && (
                          <div className="font-black text-[#0C1E36] tabular-nums">
                            {formatCurrency(version.totalBudget)}
                          </div>
                        )}
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-zinc-100/80">
                        <span className="text-[10px] text-zinc-400">
                          {formatDate(version.timestamp)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedVersion(version);
                              setIsInspectModalOpen(true);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-[10px] font-black text-zinc-700 uppercase tracking-wider transition-all cursor-pointer"
                          >
                            <Eye className="w-3 h-3 text-zinc-500" />
                            <span>Inspect</span>
                          </button>

                          {isCurrent ? (
                            <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-emerald-200/60 flex items-center gap-1">
                              <Check className="w-3 h-3" />
                              Current
                            </span>
                          ) : (
                            <button
                              onClick={() => setVersionToRestore(version)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#0C1E36] hover:bg-[#C89311] hover:text-[#0C1E36] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 shadow-sm cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Restore</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-4 border-t border-zinc-100 bg-[#FAF9F5] text-xs text-zinc-500 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-[11px] font-semibold text-zinc-700">
                  {filteredVersions.length} versions recorded
                </span>
              </div>

              {onOpenTemplate && selectedFilter !== "all" && selectedFilter !== "Editor Document" && (
                <button
                  onClick={() => onOpenTemplate(selectedFilter as VersionDocType)}
                  className="flex items-center gap-1 text-[10px] font-black text-[#0C1E36] hover:text-[#C89311] uppercase tracking-wider transition-colors"
                >
                  <span>Open {selectedFilter} Matrix</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Snapshot / Save Manual Version Modal */}
      <AnimatePresence>
        {isSnapshotModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 space-y-5"
            >
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#C89311] flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0C1E36]">Create Version Snapshot</h3>
                    <p className="text-xs text-zinc-500">Record a milestone checkpoint in the official audit trail</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSnapshotModalOpen(false)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSnapshot} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                    Target Document Type
                  </label>
                  <select
                    value={snapshotDocType}
                    onChange={e => setSnapshotDocType(e.target.value as VersionDocType)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C89311]"
                  >
                    <option value="CBYDP">Comprehensive Barangay Youth Development Plan (CBYDP)</option>
                    <option value="ABYIP">Annual Barangay Youth Investment Program (ABYIP)</option>
                    <option value="Annual Budget">Annual SK Budget (CY 2026 Appropriation)</option>
                    <option value="Editor Document">Editor Draft / Compliance Notes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                    Version Summary Note *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Revised health line items after council committee meeting"
                    value={snapshotNote}
                    onChange={e => setSnapshotNote(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#C89311]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1.5">
                    Key Changes (One per line, optional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="• Recalibrated honorarium allocation&#10;• Added sports clinic equipment PPA"
                    value={snapshotChangeText}
                    onChange={e => setSnapshotChangeText(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium focus:outline-none focus:border-[#C89311]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
                  <button
                    type="button"
                    onClick={() => setIsSnapshotModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#0C1E36] hover:bg-[#C89311] hover:text-[#0C1E36] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Save Snapshot
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Version Inspector Modal */}
      <AnimatePresence>
        {isInspectModalOpen && selectedVersion && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-7 shadow-2xl border border-zinc-200 space-y-6 max-h-[85vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-100 text-[#0C1E36] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-[#0C1E36]">
                        {selectedVersion.docType} • {selectedVersion.versionTag}
                      </h3>
                      {selectedVersion.isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[9px] font-black uppercase">
                          Active Version
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">
                      Recorded on {formatDate(selectedVersion.timestamp)} by {selectedVersion.authorName} ({selectedVersion.authorRole})
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsInspectModalOpen(false)}
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto space-y-5 pr-1">
                {/* Highlights Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">
                      Total Appropriation
                    </div>
                    <div className="text-base font-black text-[#0C1E36] tabular-nums">
                      {formatCurrency(selectedVersion.totalBudget)}
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">
                      Documented Scope
                    </div>
                    <div className="text-base font-black text-[#0C1E36]">
                      {selectedVersion.itemsCount || 0} Sections / Items
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl col-span-2 sm:col-span-1">
                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">
                      Approval Status
                    </div>
                    <div className="text-sm font-black text-emerald-700">
                      {selectedVersion.status || "Statutory Draft"}
                    </div>
                  </div>
                </div>

                {/* Summary Note & Changes */}
                <div className="p-4 bg-[#FAF9F5] border border-amber-200/50 rounded-2xl space-y-2">
                  <div className="text-[10px] font-black text-amber-900 uppercase tracking-wider">
                    Official Milestone Summary
                  </div>
                  <p className="text-xs text-zinc-800 font-medium leading-relaxed">
                    {selectedVersion.summaryNote}
                  </p>
                  {selectedVersion.changes && selectedVersion.changes.length > 0 && (
                    <div className="pt-2 border-t border-amber-200/60 space-y-1">
                      <div className="text-[9.5px] font-bold text-amber-800 uppercase tracking-wider">
                        Revisions Included:
                      </div>
                      {selectedVersion.changes.map((c, i) => (
                        <div key={i} className="text-xs text-zinc-700 flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{c}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Content Breakdown Preview */}
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                    Snapshot Structure Preview
                  </div>

                  {selectedVersion.docType === "CBYDP" && selectedVersion.snapshot?.sections && (
                    <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100 text-xs">
                      {selectedVersion.snapshot.sections.map((sec: any, idx: number) => (
                        <div key={sec.id || idx} className="p-3.5 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[#0C1E36]">{sec.centerName}</div>
                            <div className="text-[11px] text-zinc-500 truncate max-w-md">
                              {sec.agendaStatement}
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider px-2 py-0.5 bg-zinc-50 rounded-full border">
                            {sec.items?.length || 0} PPAs
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedVersion.docType === "ABYIP" && selectedVersion.snapshot?.sections && (
                    <div className="border border-zinc-200 rounded-2xl overflow-hidden divide-y divide-zinc-100 text-xs">
                      {selectedVersion.snapshot.sections.map((sec: any, idx: number) => (
                        <div key={sec.id || idx} className="p-3.5 flex items-center justify-between">
                          <div>
                            <div className="font-bold text-[#0C1E36]">
                              {sec.centerName} {sec.programHeader && `• ${sec.programHeader}`}
                            </div>
                            <div className="text-[11px] text-zinc-500">
                              {sec.items?.[0]?.ppaName}
                            </div>
                          </div>
                          <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider px-2 py-0.5 bg-zinc-50 rounded-full border">
                            {sec.items?.length || 0} Items
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedVersion.docType === "Annual Budget" && selectedVersion.snapshot && (
                    <div className="border border-zinc-200 rounded-2xl p-4 text-xs space-y-3 bg-zinc-50/50">
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-200/80">
                        <span className="font-semibold text-zinc-600">Personnel Services (Honoraria):</span>
                        <span className="font-black text-[#0C1E36] tabular-nums">
                          {formatCurrency(
                            selectedVersion.snapshot.gaPersonalServices?.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-200/80">
                        <span className="font-semibold text-zinc-600">Operating Expenses (MOOE):</span>
                        <span className="font-black text-[#0C1E36] tabular-nums">
                          {formatCurrency(
                            selectedVersion.snapshot.gaMOOE?.reduce((sum: number, i: any) => sum + (i.amount || 0), 0)
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-zinc-600">Youth Programs (YDEP Count):</span>
                        <span className="font-black text-[#0C1E36]">
                          {selectedVersion.snapshot.ydepPrograms?.length || 0} Programs
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedVersion.docType === "Editor Document" && selectedVersion.snapshot?.content && (
                    <div className="border border-zinc-200 rounded-2xl p-4 text-xs font-mono bg-zinc-50/80 whitespace-pre-wrap max-h-48 overflow-y-auto leading-relaxed text-zinc-800">
                      {selectedVersion.snapshot.content}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsInspectModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                >
                  Close
                </button>

                {!selectedVersion.isCurrent && (
                  <button
                    type="button"
                    onClick={() => {
                      setVersionToRestore(selectedVersion);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#0C1E36] hover:bg-[#C89311] hover:text-[#0C1E36] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore this Version</span>
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restore Confirmation Dialog */}
      <AnimatePresence>
        {versionToRestore && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1.5">
                <h3 className="text-base font-black text-[#0C1E36]">
                  Restore {versionToRestore.docType} ({versionToRestore.versionTag})?
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  This will replace your current active working document with this historical snapshot. An automated backup of your current document will be saved into version history first.
                </p>
              </div>

              <div className="p-3.5 bg-[#FAF9F5] border border-amber-200/60 rounded-2xl text-xs text-zinc-700 space-y-1">
                <div className="font-bold text-[#0C1E36]">Target Snapshot Details:</div>
                <div className="text-zinc-600 text-[11px] truncate">• {versionToRestore.summaryNote}</div>
                {versionToRestore.totalBudget !== undefined && (
                  <div className="text-zinc-600 text-[11px]">• Budget: {formatCurrency(versionToRestore.totalBudget)}</div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={() => setVersionToRestore(null)}
                  className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={() => handleRestore(versionToRestore)}
                  className="flex-1 py-2.5 rounded-xl bg-[#0C1E36] hover:bg-[#C89311] hover:text-[#0C1E36] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  {isRestoring ? (
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Confirm Restore</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
