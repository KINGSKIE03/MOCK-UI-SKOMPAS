import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  X, 
  Info, 
  Sparkles, 
  Loader2, 
  FileText, 
  ChevronRight, 
  Building2, 
  Calendar, 
  Copy, 
  Check, 
  Download, 
  ArrowRight, 
  RotateCcw,
  Layers,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from "lucide-react";
import { ScanCheckResult, ScanFinding, PpaAnalysisItem } from "../../lib/documentScanner";

interface ScanCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: ScanCheckResult | null;
  isScanning: boolean;
  onReScan?: () => void;
  onApplyFix?: (finding: ScanFinding) => void;
}

export function ScanCheckModal({
  isOpen,
  onClose,
  result,
  isScanning,
  onReScan,
  onApplyFix
}: ScanCheckModalProps) {
  const [activeTab, setActiveTab] = useState<"all" | "missing" | "ppa" | "statutory" | "compliant" | "ppa_matrix">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedReport, setCopiedReport] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);

  const SCAN_STEPS = [
    "Scanning entered document fields, signatories, and jurisdiction...",
    "Auditing PPA classifications across NYC 9 Centers of Youth Participation...",
    "Validating performance indicators, measurable targets & schedules...",
    "Checking statutory budget ceilings (15% GA Cap vs 85% YDEP) and balancing...",
    "Compiling findings, legal explanations, and actionable suggestions..."
  ];

  // Animated scan steps during scanning phase
  useEffect(() => {
    if (!isScanning) {
      setScanStepIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setScanStepIndex((prev) => (prev < SCAN_STEPS.length - 1 ? prev + 1 : prev));
    }, 320);
    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isOpen) return null;

  const handleCopySuggestion = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyFullReport = () => {
    if (!result) return;
    let reportText = `==========================================================\n`;
    reportText += `SKOMPAS COMPLIANCE SCAN & CHECK AUDIT REPORT\n`;
    reportText += `Document: ${result.docType} (${result.calendarYearOrPeriod})\n`;
    reportText += `Barangay: ${result.barangayName}\n`;
    reportText += `Audit Date: ${new Date(result.timestamp).toLocaleString()}\n`;
    reportText += `Overall Score: ${result.overallScore}/100 (${result.status})\n`;
    reportText += `Summary: ${result.summaryText}\n`;
    reportText += `==========================================================\n\n`;

    reportText += `CRITICAL ISSUES (${result.criticalCount}):\n`;
    result.findings.filter(f => f.severity === "critical").forEach((f, idx) => {
      reportText += `[${idx + 1}] ${f.title}\n`;
      reportText += `    Location: ${f.location}\n`;
      reportText += `    Issue: ${f.issueDescription}\n`;
      reportText += `    Explanation: ${f.explanation}\n`;
      reportText += `    Legal Basis: ${f.legalBasis}\n`;
      reportText += `    Suggestion: ${f.suggestion}\n\n`;
    });

    reportText += `WARNINGS & ALIGNMENT ISSUES (${result.warningCount}):\n`;
    result.findings.filter(f => f.severity === "warning").forEach((f, idx) => {
      reportText += `[${idx + 1}] ${f.title}\n`;
      reportText += `    Location: ${f.location}\n`;
      reportText += `    Issue: ${f.issueDescription}\n`;
      reportText += `    Suggestion: ${f.suggestion}\n\n`;
    });

    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleDownloadReport = () => {
    if (!result) return;
    let reportText = `SKOMPAS COMPLIANCE SCAN & CHECK AUDIT REPORT\n`;
    reportText += `Document: ${result.docType} (${result.calendarYearOrPeriod})\n`;
    reportText += `Barangay: ${result.barangayName}\n`;
    reportText += `Score: ${result.overallScore}/100 - ${result.status}\n\n`;
    result.findings.forEach((f, idx) => {
      reportText += `[${f.severity.toUpperCase()}] ${f.title} (${f.location})\n`;
      reportText += `Issue: ${f.issueDescription}\n`;
      reportText += `Explanation: ${f.explanation}\n`;
      reportText += `Legal Basis: ${f.legalBasis}\n`;
      reportText += `Suggestion: ${f.suggestion}\n\n`;
    });

    const blob = new Blob([reportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Audit_Scan_${result.docType}_${result.barangayName}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFindings = (result?.findings || []).filter(f => {
    if (activeTab === "all") return true;
    if (activeTab === "missing") return f.category === "missing_info" || f.category === "incorrect_info";
    if (activeTab === "ppa") return f.category === "ppa_classification" || f.category === "ppa_alignment";
    if (activeTab === "statutory") return f.category === "statutory_compliance" || f.category === "financial_formula";
    if (activeTab === "compliant") return f.severity === "compliant";
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs font-sans print:hidden animate-in fade-in duration-200">
      <div 
        className="bg-white border border-slate-200 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#0C1E36] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  STATUTORY SCAN & CHECK
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold border border-slate-700">
                  RA 10742 / RA 11768 / COA
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{result?.docType || "Document"} Audit Results</span>
                <span className="text-xs font-bold text-slate-400">· Barangay {result?.barangayName || "Kapatagan"}</span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onReScan && !isScanning && (
              <button
                onClick={onReScan}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
                title="Re-run document scan"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Re-Scan</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Body: Scanning State vs Results View */}
        {isScanning ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-6 flex-1 min-h-[420px]">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-amber-400/20 border-t-amber-400 animate-spin flex items-center justify-center" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-amber-500 animate-pulse" />
              </div>
            </div>

            <div className="max-w-md">
              <h3 className="text-lg font-black text-[#0C1E36]">Scanning Entered Document...</h3>
              <p className="text-xs text-slate-500 mt-1">
                Inspecting data completeness, PPA sector classification, and statutory allocation rules.
              </p>
            </div>

            <div className="w-full max-w-lg bg-slate-100 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 shadow-inner">
              {SCAN_STEPS.map((step, idx) => {
                const isCurrent = idx === scanStepIndex;
                const isDone = idx < scanStepIndex;
                return (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 text-xs transition-all ${
                      isCurrent 
                        ? "text-[#0C1E36] font-bold scale-[1.01]" 
                        : isDone 
                          ? "text-emerald-700 opacity-80" 
                          : "text-slate-400 opacity-50"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : isCurrent ? (
                      <Loader2 className="w-4 h-4 text-amber-500 animate-spin shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                    )}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : result ? (
          <div className="flex-1 overflow-y-auto flex flex-col">
            
            {/* Scorecard & Summary Banner */}
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                
                {/* Score Dial */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border font-black ${
                    result.overallScore >= 85 
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300" 
                      : result.overallScore >= 65 
                        ? "bg-amber-50 text-amber-700 border-amber-300" 
                        : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}>
                    <span className="text-2xl leading-none">{result.overallScore}</span>
                    <span className="text-[9px] uppercase tracking-wider font-extrabold opacity-70">/ 100</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                      Audit Score
                    </span>
                    <span className={`text-xs font-black px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                      result.status === "Ready for Approval" 
                        ? "bg-emerald-100 text-emerald-800" 
                        : result.status === "Needs Revision" 
                          ? "bg-amber-100 text-amber-800" 
                          : "bg-rose-100 text-rose-800"
                    }`}>
                      {result.status}
                    </span>
                  </div>
                </div>

                {/* Metric 1: Critical */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                    Critical Audit Blocker(s)
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-2xl font-black ${result.criticalCount > 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                      {result.criticalCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {result.criticalCount > 0 ? "Require immediate fix" : "Zero blocking violations"}
                    </span>
                  </div>
                </div>

                {/* Metric 2: Warnings / Recommendations */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                    Advisories & Alignment
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-2xl font-black ${result.warningCount > 0 ? 'text-amber-600' : 'text-slate-700'}`}>
                      {result.warningCount}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {result.warningCount > 0 ? "Recommendations flagged" : "Clean sectoral mapping"}
                    </span>
                  </div>
                </div>

                {/* Metric 3: NYC 9 Centers Coverage */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 block">
                    NYC 9 Centers Covered
                  </span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-black text-[#0C1E36]">
                      {result.centersCoverage.covered.length}
                      <span className="text-xs text-slate-400 font-bold"> / 9</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      {result.centersCoverage.missing.length === 0 ? "Holistic youth reach" : `${result.centersCoverage.missing.length} unrepresented`}
                    </span>
                  </div>
                </div>

              </div>

              {/* Summary sentence */}
              <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#C89311] shrink-0" />
                  <span className="font-semibold">{result.summaryText}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleCopyFullReport}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy full findings text"
                  >
                    {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedReport ? "Copied!" : "Copy Report"}</span>
                  </button>
                  <button
                    onClick={handleDownloadReport}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    title="Download report file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Financial Summary Strip if Available */}
            {result.financialSummary && (
              <div className="px-6 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs flex flex-wrap items-center gap-4 text-slate-800">
                <span className="font-black uppercase tracking-wider text-[10px] text-amber-900 flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-700" /> Statutory Fiscal Parameters:
                </span>
                {result.financialSummary.statutoryNotes.map((note, idx) => (
                  <span key={idx} className="bg-white px-2.5 py-0.5 rounded-md border border-amber-200 text-[11px] font-bold text-slate-700 shadow-2xs">
                    {note}
                  </span>
                ))}
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="px-6 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none bg-white">
              <button
                onClick={() => setActiveTab("all")}
                className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "all"
                    ? "border-[#0C1E36] text-[#0C1E36]"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <span>All Findings</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px]">
                  {result.findings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("missing")}
                className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "missing"
                    ? "border-rose-600 text-rose-700 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <span>Missing / Blank Data</span>
                <span className="px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold">
                  {result.findings.filter(f => f.category === "missing_info" || f.category === "incorrect_info").length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("ppa")}
                className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "ppa"
                    ? "border-amber-500 text-amber-800 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <span>PPA Classification & Alignment</span>
                <span className="px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold">
                  {result.findings.filter(f => f.category === "ppa_classification" || f.category === "ppa_alignment").length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("statutory")}
                className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "statutory"
                    ? "border-blue-700 text-blue-800 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <span>Statutory & Budget Rules</span>
                <span className="px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold">
                  {result.findings.filter(f => f.category === "statutory_compliance" || f.category === "financial_formula").length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("compliant")}
                className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "compliant"
                    ? "border-emerald-600 text-emerald-700 font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <span>Compliant Items</span>
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                  {result.findings.filter(f => f.severity === "compliant").length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("ppa_matrix")}
                className={`py-3 px-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                  activeTab === "ppa_matrix"
                    ? "border-[#C89311] text-[#0C1E36] font-bold"
                    : "border-transparent text-slate-400 hover:text-slate-700"
                }`}
              >
                <span>PPA Sector Matrix</span>
                <span className="px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px]">
                  {result.ppaAnalyses.length}
                </span>
              </button>
            </div>

            {/* Findings List or PPA Sector Matrix */}
            <div className="p-6 space-y-4 bg-[#FDFCFB] flex-1 overflow-y-auto">
              {activeTab === "ppa_matrix" ? (
                /* PPA Classification Matrix Table */
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#0C1E36]">
                        PPA Classification & 9 Centers Mapping
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Analyzes whether each entered program belongs under its assigned NYC youth participation center.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-slate-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {result.ppaAnalyses.length} Programs Analyzed
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-600 uppercase text-[9.5px] font-black border-b border-slate-200">
                          <th className="p-3">Program / Activity</th>
                          <th className="p-3">Assigned Center</th>
                          <th className="p-3">Recommended Center</th>
                          <th className="p-3 text-right">Budget (₱)</th>
                          <th className="p-3">Status / Alignment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {result.ppaAnalyses.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400">
                              No individual PPAs extracted for analysis.
                            </td>
                          </tr>
                        ) : (
                          result.ppaAnalyses.map((ppa) => (
                            <tr key={ppa.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3 font-bold text-slate-800">
                                {ppa.name}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-extrabold text-[10px]">
                                  {ppa.allocatedCenter}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-extrabold text-[10px] border border-amber-200">
                                  {ppa.recommendedCenter}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-slate-800">
                                ₱{ppa.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>
                              <td className="p-3">
                                {ppa.isAligned ? (
                                  <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Aligned
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-amber-700 font-bold text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                                    Mismatch Warning
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : filteredFindings.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                  <h4 className="text-sm font-black text-slate-800">No Issues Found in this Category</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    All scanned fields and checks for this category satisfy Philippine youth governance requirements.
                  </p>
                </div>
              ) : (
                /* Finding Cards */
                filteredFindings.map((finding) => {
                  const isCritical = finding.severity === "critical";
                  const isWarning = finding.severity === "warning";
                  const isCompliant = finding.severity === "compliant";

                  return (
                    <div
                      key={finding.id}
                      className={`bg-white rounded-2xl p-5 border shadow-xs transition-all ${
                        isCritical
                          ? "border-rose-300 bg-rose-50/10"
                          : isWarning
                            ? "border-amber-300 bg-amber-50/10"
                            : isCompliant
                              ? "border-emerald-300 bg-emerald-50/10"
                              : "border-slate-200"
                      }`}
                    >
                      {/* Card Header: Severity, Location, Title */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isCritical 
                              ? "bg-rose-100 text-rose-700" 
                              : isWarning 
                                ? "bg-amber-100 text-amber-700" 
                                : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {isCritical ? (
                              <AlertCircle className="w-4 h-4" />
                            ) : isWarning ? (
                              <AlertTriangle className="w-4 h-4" />
                            ) : (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                                isCritical 
                                  ? "bg-rose-100 text-rose-800 border border-rose-300" 
                                  : isWarning 
                                    ? "bg-amber-100 text-amber-800 border border-amber-300" 
                                    : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              }`}>
                                {isCritical ? "Critical Blocker" : isWarning ? "Audit Advisory" : "Compliant"}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                {finding.location}
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-[#0C1E36] mt-1">
                              {finding.title}
                            </h4>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleCopySuggestion(finding.suggestion, finding.id)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs transition-colors cursor-pointer"
                            title="Copy Suggestion"
                          >
                            {copiedId === finding.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Issue Description */}
                      <p className="text-xs text-slate-700 mt-2 font-medium">
                        {finding.issueDescription}
                      </p>

                      {/* Explanation & Legal Basis Box */}
                      <div className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                            Why this matters:
                          </span>
                          <p className="text-slate-600 leading-relaxed mt-0.5">
                            {finding.explanation}
                          </p>
                        </div>

                        {finding.legalBasis && (
                          <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                            <span className="text-[9px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              Legal Citation
                            </span>
                            <span>{finding.legalBasis}</span>
                          </div>
                        )}
                      </div>

                      {/* Suggestion / Action Recommendation */}
                      {!isCompliant && (
                        <div className="mt-3 p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          <div className="flex-1">
                            <span className="font-black text-emerald-900 block uppercase tracking-wider text-[10px]">
                              Recommended Fix:
                            </span>
                            <p className="font-medium text-emerald-900 mt-0.5">
                              {finding.suggestion}
                            </p>
                          </div>
                          {onApplyFix && (
                            <button
                              onClick={() => onApplyFix(finding)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-black uppercase tracking-wider transition-colors shrink-0 shadow-xs cursor-pointer"
                            >
                              {finding.suggestedActionText || "Apply"}
                            </button>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })
              )}
            </div>

          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            Click "Scan & Check" to analyze the document.
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-white border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span>Audited against NYC 9 Centers, DBM/DILG JMC No. 1, and COA Circular No. 2020-004.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              Close
            </button>
            {onReScan && !isScanning && (
              <button
                onClick={onReScan}
                className="px-5 py-2 rounded-xl bg-[#0C1E36] hover:bg-[#C89311] text-white text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                <span>Re-Scan Document</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
