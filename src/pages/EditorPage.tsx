import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Save, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  FileText,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Download,
  Info,
  Clock,
  History,
  ExternalLink,
  Layers,
  RotateCcw,
  Check,
  X,
  FileSpreadsheet,
  FileCheck
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/auth/AuthProvider";
import { cn } from "../lib/utils";
import { ComplianceReport, DocumentVersion, VersionDocType } from "../types";
import { MOCK_DOCUMENTS } from "../lib/mockData";
import { 
  getDocumentVersions, 
  saveDocumentVersion, 
  cbydpToMarkdown, 
  abyipToMarkdown, 
  budgetToMarkdown 
} from "../lib/versionStore";
import { loadCbydpDocument } from "../lib/cbydpStore";
import { loadAbyipDocument } from "../lib/abyipStore";
import { loadBudgetDocument } from "../lib/budgetStore";
import { VersionHistorySidebar } from "../components/workflow/VersionHistorySidebar";
import { ScanCheckModal } from "../components/compliance/ScanCheckModal";
import { 
  scanEditorDocument, 
  scanCbydpDocument, 
  scanAbyipDocument, 
  scanBudgetDocument, 
  ScanCheckResult 
} from "../lib/documentScanner";

export function EditorPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { role, user } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [docType, setDocType] = useState<"needs" | "budget">("needs");
  const [activeCategory, setActiveCategory] = useState<"cbydp" | "abyip" | "budget" | "custom">("custom");
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documentStatus, setDocumentStatus] = useState("pending");
  const [history, setHistory] = useState<string[]>([]);
  
  // Version History States
  const [isVersionSidebarOpen, setIsVersionSidebarOpen] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<"advisor" | "history">("advisor");
  const [versionsCount, setVersionsCount] = useState(0);
  const [latestVersionTag, setLatestVersionTag] = useState("v1.0");
  const [restoredBanner, setRestoredBanner] = useState<{
    version: DocumentVersion;
    docType: VersionDocType;
    message: string;
  } | null>(null);

  // Scan & Check Modal states
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isScanningCheck, setIsScanningCheck] = useState(false);
  const [scanResult, setScanResult] = useState<ScanCheckResult | null>(null);

  const handleScanAndCheck = () => {
    setIsScanningCheck(true);
    setIsScanModalOpen(true);
    setTimeout(() => {
      const bgy = user?.barangayName || "Kapatagan";
      let res: ScanCheckResult;
      if (activeCategory === "cbydp") {
        const cbydpDoc = loadCbydpDocument(bgy, user?.displayName, undefined);
        res = scanCbydpDocument(cbydpDoc);
      } else if (activeCategory === "abyip") {
        const abyipDoc = loadAbyipDocument(bgy, user?.displayName, undefined);
        res = scanAbyipDocument(abyipDoc);
      } else if (activeCategory === "budget") {
        const budgetDoc = loadBudgetDocument(bgy, user?.displayName, undefined);
        res = scanBudgetDocument(budgetDoc);
      } else {
        res = scanEditorDocument(content, title || "Working Document", bgy);
      }
      setScanResult(res);
      setIsScanningCheck(false);
    }, 900);
  };

  // Sync version statistics
  const updateVersionStats = useCallback(() => {
    const barangay = user?.barangayName || "Kapatagan";
    const all = getDocumentVersions("all", barangay);
    setVersionsCount(all.length);
    if (all.length > 0) {
      setLatestVersionTag(all[0].versionTag || "v1.0");
    }
  }, [user?.barangayName]);

  useEffect(() => {
    updateVersionStats();
    const handleVersionsChanged = () => updateVersionStats();
    window.addEventListener("skompas_versions_updated", handleVersionsChanged);
    window.addEventListener("skompas_version_restored", handleVersionsChanged);
    return () => {
      window.removeEventListener("skompas_versions_updated", handleVersionsChanged);
      window.removeEventListener("skompas_version_restored", handleVersionsChanged);
    };
  }, [updateVersionStats]);

  // Load document based on route param
  useEffect(() => {
    const bgy = user?.barangayName || "Kapatagan";

    if (type === "cbydp" || type === "cbydp-template") {
      setActiveCategory("cbydp");
      setDocType("needs");
      const cbydpDoc = loadCbydpDocument(bgy);
      setTitle(`CBYDP CY ${cbydpDoc.calendarYears || '2026-2029'} - Barangay ${cbydpDoc.barangayName}`);
      setContent(cbydpToMarkdown(cbydpDoc));
      setDocumentStatus(cbydpDoc.status || "Draft");
    } else if (type === "abyip" || type === "abyip-template") {
      setActiveCategory("abyip");
      setDocType("budget");
      const abyipDoc = loadAbyipDocument(bgy);
      setTitle(`ABYIP CY ${abyipDoc.calendarYear || '2026'} - Barangay ${abyipDoc.barangayName}`);
      setContent(abyipToMarkdown(abyipDoc));
      setDocumentStatus(abyipDoc.status || "Draft");
    } else if (type === "budget" || type === "budget-template") {
      setActiveCategory("budget");
      setDocType("budget");
      const budgetDoc = loadBudgetDocument(bgy);
      setTitle(`Annual SK Budget CY ${budgetDoc.calendarYear || '2026'} - Barangay ${budgetDoc.barangayName}`);
      setContent(budgetToMarkdown(budgetDoc));
      setDocumentStatus(budgetDoc.status || "Draft");
    } else if (type === "needs") {
      setActiveCategory("custom");
      setDocType("needs");
      setTitle(`Youth Needs Assessment - Barangay ${bgy}`);
      setContent(`# Comprehensive Youth Needs Assessment (CYNA) - Barangay ${bgy}\n\n## 1. Executive Summary\nThis document outlines the priority needs of youth constituents across health, education, economic empowerment, and climate action.\n\n## 2. Key Problem Statements\n- Underemployment among out-of-school youth.\n- Need for expanded digital literacy and vocational training hubs.\n- Mental wellness support and community sports engagement.`);
      setDocumentStatus("pending");
    } else if (type) {
      setActiveCategory("custom");
      // Try to load from live submitted budgets first
      const liveString = localStorage.getItem("skompas_submitted_budgets");
      let found = false;
      
      if (liveString) {
        try {
          const list = JSON.parse(liveString);
          const item = list.find((d: any) => d.id === type);
          if (item) {
            setTitle(item.title);
            setDocType(item.type);
            setDocumentStatus(item.status);
            setContent(item.content);
            if (item.complianceReport) {
              setReport(item.complianceReport);
            } else {
              setReport({
                status: "Compliant",
                score: 96,
                violations: [],
                strengths: [
                  "Annual Barangay Youth Investment program maps safely with local statutory priorities.",
                  "Appropriation headers and funding sources comply fully with public sector SK Reform standards."
                ],
                alignmentCheck: {
                  aligned: true,
                  feedback: "This document maps perfectly with the Local Youth Development Plan criteria."
                }
              });
            }
            found = true;
          }
        } catch (e) {
          console.error("Error parsing submitted budgets", e);
        }
      }
      
      if (!found) {
        // Load from mock data
        const existing = MOCK_DOCUMENTS.find(d => d.id === type);
        if (existing) {
          setTitle(existing.title);
          setDocType(existing.type);
          setDocumentStatus(existing.status);
          setContent(`Draft of ${existing.title}\n\nWhereas, the Sangguniang Kabataan of Barangay recognizes the importance of youth empowerment...\n\nSection 1: General Provisions\nThis document outlines the specific requirements for ${existing.type === 'needs' ? 'community needs assessment' : 'fiscal budget allocation'}.\n\nSection 2: Objectives\n1. To provide transparent reporting.\n2. To align with national standards.`);
        }
      }
    }
  }, [type, user?.barangayName]);

  // Quick switch document handler
  const handleSwitchCategory = (cat: "cbydp" | "abyip" | "budget" | "custom") => {
    setActiveCategory(cat);
    const bgy = user?.barangayName || "Kapatagan";

    if (cat === "cbydp") {
      setDocType("needs");
      const cbydpDoc = loadCbydpDocument(bgy);
      setTitle(`CBYDP CY ${cbydpDoc.calendarYears || '2026-2029'} - Barangay ${cbydpDoc.barangayName}`);
      setContent(cbydpToMarkdown(cbydpDoc));
      setDocumentStatus(cbydpDoc.status || "Draft");
    } else if (cat === "abyip") {
      setDocType("budget");
      const abyipDoc = loadAbyipDocument(bgy);
      setTitle(`ABYIP CY ${abyipDoc.calendarYear || '2026'} - Barangay ${abyipDoc.barangayName}`);
      setContent(abyipToMarkdown(abyipDoc));
      setDocumentStatus(abyipDoc.status || "Draft");
    } else if (cat === "budget") {
      setDocType("budget");
      const budgetDoc = loadBudgetDocument(bgy);
      setTitle(`Annual SK Budget CY ${budgetDoc.calendarYear || '2026'} - Barangay ${budgetDoc.barangayName}`);
      setContent(budgetToMarkdown(budgetDoc));
      setDocumentStatus(budgetDoc.status || "Draft");
    } else {
      setDocType("needs");
      setTitle(`Youth Development Note - Barangay ${bgy}`);
      setContent(`# Youth Development Memorandum\n\n**Date:** ${new Date().toLocaleDateString()}\n**Barangay:** ${bgy}\n\nOutline your specific youth initiatives and budget appropriations here.`);
    }
  };

  // Restore document version into active draft
  const handleVersionRestored = (version: DocumentVersion, restoredDoc: any) => {
    setRestoredBanner({
      version,
      docType: version.docType,
      message: `Version ${version.versionTag} of ${version.docType} successfully restored!`
    });

    if (version.docType === "CBYDP" && restoredDoc) {
      setTitle(`CBYDP CY ${restoredDoc.calendarYears || '2026-2029'} - Barangay ${restoredDoc.barangayName}`);
      setContent(cbydpToMarkdown(restoredDoc));
      setDocType("needs");
      setActiveCategory("cbydp");
      setDocumentStatus(restoredDoc.status || "Draft");
    } else if (version.docType === "ABYIP" && restoredDoc) {
      setTitle(`ABYIP CY ${restoredDoc.calendarYear || '2026'} - Barangay ${restoredDoc.barangayName}`);
      setContent(abyipToMarkdown(restoredDoc));
      setDocType("budget");
      setActiveCategory("abyip");
      setDocumentStatus(restoredDoc.status || "Draft");
    } else if (version.docType === "Annual Budget" && restoredDoc) {
      setTitle(`Annual SK Budget CY ${restoredDoc.calendarYear || '2026'} - Barangay ${restoredDoc.barangayName}`);
      setContent(budgetToMarkdown(restoredDoc));
      setDocType("budget");
      setActiveCategory("budget");
      setDocumentStatus(restoredDoc.status || "Draft");
    } else if (version.snapshot) {
      if (typeof version.snapshot === "string") {
        setContent(version.snapshot);
      } else if (version.snapshot.content) {
        setContent(version.snapshot.content);
        if (version.snapshot.title) setTitle(version.snapshot.title);
        if (version.snapshot.docType) setDocType(version.snapshot.docType);
        if (version.snapshot.status) setDocumentStatus(version.snapshot.status);
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const bgy = user?.barangayName || "Kapatagan";
      const docTypeMapped: VersionDocType = 
        activeCategory === "cbydp" ? "CBYDP" :
        activeCategory === "abyip" ? "ABYIP" :
        activeCategory === "budget" ? "Annual Budget" : "Editor Document";

      const wordCount = content.split(/\s+/).filter(Boolean).length;
      
      saveDocumentVersion({
        docType: docTypeMapped,
        barangayName: bgy,
        authorName: user?.displayName || (role ? `Hon. SK ${role}` : "SK Official"),
        authorRole: role || "Chairman",
        summaryNote: `Saved progress: ${title.slice(0, 45)}...`,
        changes: [`Updated content draft (${wordCount} words)`, `Status: ${documentStatus.toUpperCase()}`],
        snapshot: {
          title,
          content,
          docType,
          status: documentStatus,
          report
        },
        status: documentStatus === "approved" ? "Approved" : "Draft",
        isCurrent: true
      });

      setHistory(prev => [new Date().toLocaleTimeString(), ...prev.slice(0, 4)]);
      updateVersionStats();
    } catch (e) {
      console.error("Save error:", e);
    } finally {
      setTimeout(() => {
        setIsSaving(false);
      }, 500);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
    setSidebarTab("advisor");
    try {
      const res = await fetch("/api/analyze-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentType: docType, content }),
      });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGetSuggestion = async () => {
    setIsGeneratingSuggestion(true);
    setSidebarTab("advisor");
    try {
      const res = await fetch("/api/generate-suggestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          documentType: docType, 
          context: content.slice(-500) || "Start a new template" 
        }),
      });
      const data = await res.json();
      setSuggestion(data.suggestion);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  };

  const handleDownload = (format: 'pdf' | 'txt') => {
    if (format === 'txt') {
      const element = document.createElement("a");
      const file = new Blob([content], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `${title.replace(/\s+/g, '_')}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    } else {
      const doc = new jsPDF();
      
      // Document Title
      doc.setFontSize(22);
      doc.setTextColor(26, 26, 26);
      doc.text(title, 20, 20);
      
      // Metadata
      doc.setFontSize(10);
      doc.setTextColor(153, 153, 153);
      doc.text(`Type: ${docType.toUpperCase()}`, 20, 28);
      doc.text(`Status: ${documentStatus.toUpperCase()}`, 20, 33);
      doc.text(`Generated by SKompas Smart Advisor on ${new Date().toLocaleDateString()}`, 20, 38);
      
      // Separator
      doc.setDrawColor(238, 238, 238);
      doc.line(20, 45, 190, 45);
      
      // Content
      doc.setFontSize(12);
      doc.setTextColor(26, 26, 26);
      const splitText = doc.splitTextToSize(content, 170);
      doc.text(splitText, 20, 55);
      
      doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const isReadOnly = (role as string) === 'Chairman' || (documentStatus !== 'pending' && (role as string) !== 'Chairman');
  const canEditType = (role === 'Secretary' && docType === 'needs') || (role === 'Treasurer' && docType === 'budget') || true;

  // Link target for interactive full matrix
  const getMatrixLink = () => {
    if (activeCategory === "cbydp") return "/cbydp-template";
    if (activeCategory === "abyip") return "/abyip-template";
    if (activeCategory === "budget") return "/budget-template";
    return "/dashboard";
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#FDFCFB] font-sans">
      {/* Editor Main Canvas */}
      <div className="flex-1 flex flex-col border-r border-[#eee]">
        {/* Top Header Bar */}
        <div className="px-8 py-5 border-b border-[#eee] flex items-center justify-between bg-white z-10 shadow-sm">
          <div className="flex items-center gap-5">
            <Link 
              to="/dashboard" 
              className="p-2.5 hover:bg-[#FDFCFB] rounded-2xl transition-colors border border-transparent hover:border-[#eee]"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-[#666]" />
            </Link>
            <div>
              <input 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isReadOnly}
                className="bg-transparent border-none text-2xl font-black tracking-tight focus:outline-none placeholder:text-[#ccc] w-[440px] text-[#0C1E36]"
                placeholder="Document Title..."
              />
              <div className="flex items-center gap-3 mt-1">
                <span className="px-3 py-0.5 bg-[#FDFCFB] border border-[#eee] rounded-full text-[10px] font-black text-[#999] uppercase tracking-widest">
                  {activeCategory.toUpperCase()} · {docType} AUDIT
                </span>
                <div className="w-1 h-1 bg-[#ccc] rounded-full" />
                <span className="text-[10px] font-bold text-[#aaa] uppercase tracking-widest">
                  Barangay {user?.barangayName || "Kapatagan"}
                </span>
                <div className="w-1 h-1 bg-[#ccc] rounded-full" />
                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                  {latestVersionTag}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Version History Button */}
            <button
              id="btn-version-history-toggle"
              onClick={() => setIsVersionSidebarOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#eee] hover:border-[#C89311] text-[#0C1E36] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-sm cursor-pointer"
              title="Open Version History Sidebar"
            >
              <History className="w-4 h-4 text-[#C89311]" />
              <span>Version History</span>
              {versionsCount > 0 && (
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded-full text-[9px] font-black border border-amber-200">
                  {versionsCount}
                </span>
              )}
            </button>

            {/* Jump to Interactive Sheet */}
            {activeCategory !== "custom" && (
              <Link
                to={getMatrixLink()}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer"
                title="Open interactive structured sheet"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#0C1E36]" />
                <span>Open Matrix</span>
              </Link>
            )}

            {documentStatus === 'approved' && (
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownload('pdf')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#C89311] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#C89311]/20 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>
                <button 
                  onClick={() => handleDownload('txt')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#eee] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#0C1E36] transition-all cursor-pointer"
                >
                  TXT
                </button>
              </div>
            )}

            {!isReadOnly && canEditType && (
              <button 
                id="btn-save-progress"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#eee] hover:border-[#0C1E36] rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm cursor-pointer"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-[#C89311]" /> : <Save className="w-4 h-4 text-[#C89311]" />}
                Save Snapshot
              </button>
            )}

            {/* SCAN & CHECK Button */}
            <button 
              id="btn-scan-check-editor"
              onClick={handleScanAndCheck}
              disabled={isScanningCheck}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 shadow-md shadow-amber-950/20 active:scale-95 cursor-pointer border border-amber-300"
              title="Scan entered document, check for missing or incorrect information, and analyze PPA alignment"
            >
              {isScanningCheck ? <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> : <ShieldCheck className="w-4 h-4 text-slate-950" />}
              <span>SCAN & CHECK</span>
            </button>

            <button 
              id="btn-compliance-audit"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2.5 bg-[#0C1E36] text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C89311] transition-all disabled:opacity-50 shadow-lg shadow-black/10 cursor-pointer"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              AI Compliance Audit
            </button>
          </div>
        </div>

        {/* Subheader Document Switcher Strip */}
        <div className="px-8 py-2.5 bg-[#FDFCFB] border-b border-[#eee] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#999] mr-2">
              Working Document:
            </span>
            <button
              onClick={() => handleSwitchCategory("cbydp")}
              className={cn(
                "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                activeCategory === "cbydp" 
                  ? "bg-[#0C1E36] text-white shadow-sm" 
                  : "bg-white border border-[#eee] text-[#666] hover:text-[#0C1E36]"
              )}
            >
              CBYDP Multi-Year
            </button>
            <button
              onClick={() => handleSwitchCategory("abyip")}
              className={cn(
                "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                activeCategory === "abyip" 
                  ? "bg-[#0C1E36] text-white shadow-sm" 
                  : "bg-white border border-[#eee] text-[#666] hover:text-[#0C1E36]"
              )}
            >
              ABYIP Investment
            </button>
            <button
              onClick={() => handleSwitchCategory("budget")}
              className={cn(
                "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                activeCategory === "budget" 
                  ? "bg-[#0C1E36] text-white shadow-sm" 
                  : "bg-white border border-[#eee] text-[#666] hover:text-[#0C1E36]"
              )}
            >
              Annual Budget
            </button>
            <button
              onClick={() => handleSwitchCategory("custom")}
              className={cn(
                "px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer",
                activeCategory === "custom" 
                  ? "bg-[#0C1E36] text-white shadow-sm" 
                  : "bg-white border border-[#eee] text-[#666] hover:text-[#0C1E36]"
              )}
            >
              Custom / Notes
            </button>
          </div>

          {/* Quick info right */}
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-[#999]">
            <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
            <span>Full Audit Trail Active</span>
          </div>
        </div>

        {/* Restoration Notification Banner */}
        <AnimatePresence>
          {restoredBanner && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-50 border-b border-amber-200 px-8 py-3 flex items-center justify-between text-amber-900"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-amber-950">
                    {restoredBanner.message}
                  </div>
                  <div className="text-[10px] text-amber-800">
                    Restored from {restoredBanner.version.authorName} ({restoredBanner.version.authorRole}) · {new Date(restoredBanner.version.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleAnalyze}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Run Compliance Audit
                </button>
                <Link
                  to={getMatrixLink()}
                  className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer"
                >
                  Open in Matrix
                </Link>
                <button
                  onClick={() => setRestoredBanner(null)}
                  className="p-1 text-amber-700 hover:text-amber-950 rounded-lg hover:bg-amber-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Editor Area */}
        <div className="flex-1 overflow-y-auto relative bg-[#FDFCFB]">
          {/* Line Numbers Simulation for technical look */}
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#FDFCFB] border-r border-[#f5f5f5] flex flex-col items-center pt-8 pointer-events-none select-none">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="text-[9px] font-bold text-[#ccc] leading-relaxed mb-[10.5px]">{i + 1}</div>
            ))}
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isReadOnly}
            placeholder="PROMPT: Describe the program needs or budget allocations in detail..."
            className="w-full min-h-full p-8 pl-16 text-sm font-mono leading-relaxed resize-none focus:outline-none bg-transparent text-[#0C1E36] placeholder:text-[#ddd] placeholder:italic"
          />
        </div>

        {/* Bottom Status Bar */}
        <div className="px-8 py-3.5 bg-white border-t border-[#eee] flex items-center justify-between z-10">
          <div className="flex items-center gap-6">
            {!isReadOnly && (
              <button 
                onClick={handleGetSuggestion}
                disabled={isGeneratingSuggestion}
                className="flex items-center gap-2.5 text-[#0052FF] hover:bg-blue-50 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 border border-transparent hover:border-blue-100 cursor-pointer"
              >
                {isGeneratingSuggestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                AI Content Assist
              </button>
            )}
            <div className="h-4 w-px bg-[#eee]" />
            <button
              onClick={() => setIsVersionSidebarOpen(true)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#999] hover:text-[#C89311] transition-colors cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-[#C89311]" />
              <span>Version: {latestVersionTag} · {versionsCount} Snapshots · Open History</span>
            </button>
          </div>
          <div className="flex items-center gap-4 text-[10px] font-black text-[#999] uppercase tracking-widest">
            <div className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              {content.split(/\s+/).filter(Boolean).length} Words
            </div>
            <div className="w-1 h-1 bg-[#ccc] rounded-full" />
            <div className="flex items-center gap-1.5 text-[#0C1E36]">
              <Clock className="w-3.5 h-3.5" />
              STATUS: {documentStatus.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Right Side Panel: Tabbed between AI Advisor & Inline Version History */}
      <div className="w-[450px] bg-white flex flex-col overflow-y-auto border-l border-[#eee]">
        {/* Panel Header & Tabs */}
        <div className="p-6 border-b border-[#eee] sticky top-0 bg-white z-20 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl tracking-tight text-[#0C1E36]">Document Hub</h3>
            <div className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded text-[8px] font-black uppercase tracking-widest">
              Live Engine
            </div>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-[#F4F3F0] p-1 rounded-2xl gap-1">
            <button
              onClick={() => setSidebarTab("advisor")}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5",
                sidebarTab === "advisor"
                  ? "bg-white text-[#0C1E36] shadow-sm"
                  : "text-[#888] hover:text-[#0C1E36]"
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Smart Advisor</span>
            </button>
            <button
              onClick={() => setSidebarTab("history")}
              className={cn(
                "flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5",
                sidebarTab === "history"
                  ? "bg-white text-[#0C1E36] shadow-sm"
                  : "text-[#888] hover:text-[#0C1E36]"
              )}
            >
              <History className="w-3.5 h-3.5 text-[#C89311]" />
              <span>Versions ({versionsCount})</span>
            </button>
          </div>
        </div>

        {/* Tab Content 1: Smart Advisor */}
        {sidebarTab === "advisor" && (
          <div className="p-6 space-y-8">
            <AnimatePresence mode="wait">
              {!report && !suggestion && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-16 text-center space-y-6"
                >
                  <div className="w-18 h-18 bg-[#FDFCFB] border border-[#eee] rounded-[28px] flex items-center justify-center text-[#ccc] shadow-inner">
                    <MessageSquare className="w-9 h-9" />
                  </div>
                  <div>
                    <p className="font-black text-lg text-[#0C1E36] tracking-tight">System Idle</p>
                    <p className="text-[11px] text-[#888] max-w-[260px] mx-auto mt-2 font-semibold leading-relaxed uppercase tracking-wider">
                      Awaiting input signals. Click 'AI Compliance Audit' to trigger the advisory processor.
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 w-full pt-2">
                    <div className="p-3 bg-[#FDFCFB] border border-[#eee] rounded-2xl flex flex-col items-center gap-1.5">
                      <Info className="w-4 h-4 text-blue-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#999]">Legal Context</span>
                    </div>
                    <div className="p-3 bg-[#FDFCFB] border border-[#eee] rounded-2xl flex flex-col items-center gap-1.5">
                      <ArrowRight className="w-4 h-4 text-orange-500" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-[#999]">Auto Recommendations</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {suggestion && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-900">AI Component Suggestion</h4>
                      <p className="text-[9px] font-bold text-blue-600/70 uppercase tracking-widest">Content Optimization</p>
                    </div>
                  </div>
                  <div className="prose prose-sm text-[#444] leading-relaxed font-medium">
                    <ReactMarkdown>{suggestion}</ReactMarkdown>
                  </div>
                  {!isReadOnly && (
                    <button 
                      onClick={() => {
                        setContent(prev => prev + "\n" + suggestion);
                        setSuggestion(null);
                      }}
                      className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                    >
                      Integrate into Draft
                    </button>
                  )}
                </motion.div>
              )}

              {report && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-8"
                >
                  {/* Visual Score Card */}
                  <div className="p-7 bg-[#0C1E36] rounded-[36px] text-white shadow-xl shadow-black/10 overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                    
                    <div className="flex items-end justify-between mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black tracking-tighter">{report.score}</span>
                        <span className="text-xs font-black text-white/40 uppercase tracking-widest">/ 100</span>
                      </div>
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                        {report.status === "Compliant" ? <CheckCircle className="w-6 h-6 text-green-400" /> : <AlertTriangle className="w-6 h-6 text-orange-400" />}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span>Compliance Status</span>
                        <span className={report.score > 80 ? 'text-green-400' : 'text-orange-400'}>{report.status}</span>
                      </div>
                      <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${report.score}%` }}
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            report.score > 80 ? "bg-green-400" : "bg-orange-400"
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Conflict Feed */}
                  {report.violations.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 text-[10px] font-black text-[#0C1E36] uppercase tracking-[0.25em] pl-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        Critical Compliance Violations
                      </h4>
                      {report.violations.map((v, i) => (
                        <div 
                          key={i}
                          className="p-5 bg-[#FDFCFB] border border-red-100 rounded-3xl space-y-3 shadow-sm"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-red-500 bg-red-50 px-2.5 py-0.5 rounded-full uppercase tracking-widest border border-red-100">{v.section}</span>
                          </div>
                          <h5 className="text-xs font-black text-[#0C1E36] leading-tight tracking-tight">{v.violation}</h5>
                          <div className="flex flex-wrap gap-1">
                            {v.legalCitations.map((cit, ci) => (
                              <span key={ci} className="bg-white text-[8px] px-2 py-0.5 rounded-lg text-red-600 font-bold border border-red-100 uppercase tracking-widest">
                                {cit}
                              </span>
                            ))}
                          </div>
                          <div className="pt-3 mt-1 border-t border-red-50 text-[11px] text-[#555] italic leading-relaxed font-medium">
                            <ReactMarkdown>{`**Recommendation:** ${v.suggestion}`}</ReactMarkdown>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 4-Level Alignment Module */}
                  <div className="p-6 bg-[#FDFCFB] border border-[#eee] rounded-3xl space-y-4 border-b-4 border-b-[#C89311]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", report.alignmentCheck.aligned ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-amber-500 animate-pulse")} />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0C1E36]">Structural Alignment</h4>
                      </div>
                      <div className="p-1.5 bg-white rounded-lg border border-[#eee]">
                        <Info className="w-3.5 h-3.5 text-[#ccc]" />
                      </div>
                    </div>
                    <p className="text-[11px] text-[#666] leading-relaxed italic font-medium">{report.alignmentCheck.feedback}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Tab Content 2: Version History In-page Preview */}
        {sidebarTab === "history" && (
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-black text-[#0C1E36] uppercase tracking-wider">
                  Audit Trail Snapshots
                </h4>
                <p className="text-[10px] text-[#888]">
                  Barangay {user?.barangayName || "Kapatagan"}
                </p>
              </div>
              <button
                onClick={() => setIsVersionSidebarOpen(true)}
                className="px-3 py-1.5 bg-[#0C1E36] text-white hover:bg-[#C89311] rounded-xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer"
              >
                Open Full Drawer
              </button>
            </div>

            {/* Quick list of top 5 versions */}
            <div className="space-y-3 pt-2">
              {getDocumentVersions("all", user?.barangayName || "Kapatagan").slice(0, 8).map((ver) => (
                <div 
                  key={ver.id}
                  className="p-4 rounded-2xl border border-[#eee] bg-[#FDFCFB] hover:border-amber-300 hover:bg-white transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#0C1E36] text-white text-[9px] font-black rounded-md">
                        {ver.versionTag}
                      </span>
                      <span className="text-[10px] font-black text-[#0C1E36]">
                        {ver.docType}
                      </span>
                    </div>
                    {ver.isCurrent ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-black rounded-full border border-emerald-200">
                        ACTIVE
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          const res = saveDocumentVersion({
                            docType: ver.docType,
                            barangayName: ver.barangayName,
                            authorName: user?.displayName || "SK Official",
                            authorRole: role || "Chairman",
                            summaryNote: `Restored snapshot ${ver.versionTag}`,
                            snapshot: ver.snapshot,
                            status: ver.status,
                            isCurrent: true
                          });
                          handleVersionRestored(ver, ver.snapshot);
                        }}
                        className="opacity-0 group-hover:opacity-100 px-2 py-0.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded text-[9px] font-black transition-all cursor-pointer"
                      >
                        Restore
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] font-medium text-[#555] line-clamp-2">
                    {ver.summaryNote}
                  </p>
                  <div className="flex items-center justify-between text-[9px] text-[#999] pt-1 border-t border-[#f0f0f0]">
                    <span>{ver.authorName} ({ver.authorRole})</span>
                    <span>{new Date(ver.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slide-out Full Version History Sidebar Drawer */}
      <VersionHistorySidebar
        isOpen={isVersionSidebarOpen}
        onClose={() => setIsVersionSidebarOpen(false)}
        defaultDocType={
          activeCategory === "cbydp" ? "CBYDP" :
          activeCategory === "abyip" ? "ABYIP" :
          activeCategory === "budget" ? "Annual Budget" : "all"
        }
        barangayName={user?.barangayName || "Kapatagan"}
        currentUser={{
          name: user?.displayName || (role ? `Hon. SK ${role}` : "SK Official"),
          role: role || "Chairman"
        }}
        currentDocSnapshot={{
          title,
          content,
          docType,
          status: documentStatus,
          report
        }}
        onVersionRestored={handleVersionRestored}
      />

      {/* Statutory Scan & Check Modal */}
      <ScanCheckModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        result={scanResult}
        isScanning={isScanningCheck}
        onReScan={handleScanAndCheck}
      />
    </div>
  );
}

