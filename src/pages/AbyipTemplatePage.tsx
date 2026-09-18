import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  FileText, 
  Save, 
  Printer, 
  Download, 
  Plus, 
  Trash2, 
  Edit3, 
  Eye, 
  RotateCcw, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calendar, 
  Layers, 
  ArrowLeft,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  Check,
  ChevronDown,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { exportOfficialLandscapePdf } from "../lib/pdfExport";
import { PrintPreviewModal } from "../components/PrintPreviewModal";
import { ScanCheckModal } from "../components/compliance/ScanCheckModal";
import { scanAbyipDocument, ScanCheckResult, ScanFinding } from "../lib/documentScanner";
import { useAuth } from "../components/auth/AuthProvider";
import { 
  AbyipDocument, 
  AbyipCenterSection, 
  AbyipRowItem, 
  AbyipReceiptItem, 
  AbyipExpenditureItem 
} from "../types";
import { 
  loadAbyipDocument, 
  saveAbyipDocument, 
  resetAbyipToDefault, 
  calculateAbyipSectionTotals, 
  calculateAbyipGrandTotals,
  createDefaultAbyipDocument
} from "../lib/abyipStore";
import { MUNICIPAL_BARANGAYS_40 } from "../lib/barangayStore";

/**
 * Estimates the rendered pixel height of an ABYIP row on A4 Landscape.
 * Dynamically accounts for multi-line text wrapping across all columns.
 */
function estimateAbyipRowHeight(item: AbyipRowItem): number {
  const charsCode = item.referenceCode?.length || 0;
  const charsPpa = item.ppaName?.length || 0;
  const charsDesc = item.description?.length || 0;
  const charsResults = item.expectedResults?.length || 0;
  const charsIndicator = item.performanceIndicator?.length || 0;
  const charsPeriod = item.periodImplementation?.length || 0;
  const charsPerson = item.personResponsible?.length || 0;

  // Approx characters per line in landscape A4 table:
  const linesCode = Math.ceil(charsCode / 14);
  const linesPpa = Math.ceil(charsPpa / 24);
  const linesDesc = Math.ceil(charsDesc / 34);
  const linesResults = Math.ceil(charsResults / 18);
  const linesIndicator = Math.ceil(charsIndicator / 18);
  const linesPeriod = Math.ceil(charsPeriod / 16);
  const linesPerson = Math.ceil(charsPerson / 18);

  const maxLines = Math.max(1, linesCode, linesPpa, linesDesc, linesResults, linesIndicator, linesPeriod, linesPerson);
  return Math.max(44, Math.min(180, maxLines * 13 + 16));
}

/**
 * Greedily packs ABYIP items into sheets to completely fill each Landscape A4 page.
 * Avoids premature page divides and guarantees that each page is fully utilized.
 */
function paginateAbyipSection(section: AbyipCenterSection): AbyipRowItem[][] {
  const items = section.items || [];
  if (items.length === 0) return [[]];

  // Program header row (e.g. GENERAL ADMINISTRATIVE PROGRAM) takes ~28px if present on sheet 1
  const hasProgHeader = !!section.programHeader;
  const sheet1Capacity = hasProgHeader ? 480 : 510;
  const continuationCapacity = 550;

  const chunks: AbyipRowItem[][] = [];
  let currentChunk: AbyipRowItem[] = [];
  let currentHeight = 0;
  let isFirstSheet = true;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const rowHeight = estimateAbyipRowHeight(item);
    const capacity = isFirstSheet ? sheet1Capacity : continuationCapacity;

    // Reserve space for subtotal row or continuation notice at bottom
    const reservedBottom = 35;

    if (currentChunk.length > 0 && currentHeight + rowHeight + reservedBottom > capacity) {
      chunks.push(currentChunk);
      currentChunk = [item];
      currentHeight = rowHeight;
      isFirstSheet = false;
    } else {
      currentChunk.push(item);
      currentHeight += rowHeight;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

const defaultEmblem = "/src/assets/images/input_file_0.png";

export function AbyipTemplatePage() {
  const { user, role, activeBarangay } = useAuth();
  const navigate = useNavigate();

  // Active barangay for this ABYIP document
  const currentBarangay = user?.barangayName || activeBarangay || "Kapatagan";
  const [selectedBarangay, setSelectedBarangay] = useState<string>(currentBarangay);

  // Document state
  const [doc, setDoc] = useState<AbyipDocument>(() => 
    loadAbyipDocument(currentBarangay, user?.displayName, undefined)
  );

  // View & Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("all"); // "all", "cover", "budget", or center id
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Modal for editing/adding single PPA row
  const [modalItem, setModalItem] = useState<{
    sectionId: string;
    item: AbyipRowItem;
    isNew: boolean;
  } | null>(null);

  // Scan & Check modal states
  const [isScanModalOpen, setIsScanModalOpen] = useState<boolean>(false);
  const [isScanningCheck, setIsScanningCheck] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<ScanCheckResult | null>(null);

  const handleScanAndCheck = () => {
    setIsScanningCheck(true);
    setIsScanModalOpen(true);
    setTimeout(() => {
      const result = scanAbyipDocument(doc);
      setScanResult(result);
      setIsScanningCheck(false);
    }, 900);
  };

  // File upload input refs for logos
  const leftLogoInputRef = useRef<HTMLInputElement>(null);
  const rightLogoInputRef = useRef<HTMLInputElement>(null);

  // Load document when barangay changes
  useEffect(() => {
    const loaded = loadAbyipDocument(selectedBarangay, user?.displayName, undefined);
    setDoc(loaded);
  }, [selectedBarangay, user?.displayName]);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save document
  const handleSave = () => {
    try {
      saveAbyipDocument(doc);
      showToast(`ABYIP successfully saved for Barangay ${doc.barangayName}!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save ABYIP", "error");
    }
  };

  // Reset to original PDF standard
  const handleReset = () => {
    if (window.confirm("Restore official sample ABYIP format? This will load the standard programs and statutory allocations matching the reference PDF.")) {
      const fresh = resetAbyipToDefault(selectedBarangay, user?.displayName, undefined);
      setDoc(fresh);
      showToast("Restored official standard ABYIP template.", "info");
    }
  };

  // Logo upload handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, position: "left" | "right") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please upload a valid image file (PNG, JPG, SVG)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      if (position === "left") {
        setDoc((prev) => ({ ...prev, leftLogoUrl: result }));
        showToast("Barangay Seal logo updated!", "success");
      } else {
        setDoc((prev) => ({ ...prev, rightLogoUrl: result }));
        showToast("Sangguniang Kabataan logo updated!", "success");
      }
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = (position: "left" | "right") => {
    if (position === "left") {
      setDoc((prev) => ({ ...prev, leftLogoUrl: undefined }));
      showToast("Left logo reset to default", "info");
    } else {
      setDoc((prev) => ({ ...prev, rightLogoUrl: undefined }));
      showToast("Right logo reset to default", "info");
    }
  };

  // Add / Edit PPA Handlers
  const handleOpenAddPpa = (sectionId: string) => {
    const targetSection = doc.sections.find((s) => s.id === sectionId) || doc.sections[0];
    const newItem: AbyipRowItem = {
      id: `ppa-${Date.now()}`,
      referenceCode: "5-02-99-020",
      ppaName: "",
      subItems: [],
      description: "",
      expectedResults: "",
      performanceIndicator: "",
      periodImplementation: "January-December",
      mooe: 0,
      co: 0,
      ps: 0,
      total: 0,
      personResponsible: "SK Officials & KK Members",
    };
    setModalItem({
      sectionId: targetSection.id,
      item: newItem,
      isNew: true,
    });
  };

  const handleOpenEditPpa = (sectionId: string, item: AbyipRowItem) => {
    setModalItem({
      sectionId,
      item: { ...item },
      isNew: false,
    });
  };

  const handleDeletePpa = (sectionId: string, itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this PPA entry?")) return;

    setDoc((prev) => {
      const updatedSections = prev.sections.map((sec) => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.filter((itm) => itm.id !== itemId),
          };
        }
        return sec;
      });
      return {
        ...prev,
        sections: updatedSections,
      };
    });
    showToast("PPA entry deleted.", "info");
  };

  const handleSaveModalItem = () => {
    if (!modalItem) return;
    const { sectionId, item, isNew } = modalItem;

    if (!item.ppaName.trim()) {
      showToast("Please enter a PPA Name / Title", "error");
      return;
    }

    // Recalculate row total
    const computedTotal = (Number(item.mooe) || 0) + (Number(item.co) || 0) + (Number(item.ps) || 0);
    const finalizedItem: AbyipRowItem = {
      ...item,
      total: computedTotal,
    };

    setDoc((prev) => {
      const updatedSections = prev.sections.map((sec) => {
        if (sec.id === sectionId) {
          if (isNew) {
            return {
              ...sec,
              items: [...sec.items, finalizedItem],
            };
          } else {
            return {
              ...sec,
              items: sec.items.map((itm) => (itm.id === finalizedItem.id ? finalizedItem : itm)),
            };
          }
        }
        return sec;
      });
      return {
        ...prev,
        sections: updatedSections,
      };
    });

    setModalItem(null);
    showToast(isNew ? "PPA added successfully!" : "PPA updated successfully!", "success");
  };

  // PDF Export
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    showToast("Generating official landscape A4 PDF, please wait...", "info");

    const wasEditing = isEditing;
    if (wasEditing) {
      setIsEditing(false);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    try {
      // Find all discrete printable pages
      const pageElements = Array.from(
        document.querySelectorAll(".abyip-page-break")
      ) as HTMLElement[];

      if (pageElements.length === 0) {
        throw new Error("No document pages found to export");
      }

      const fileName = `ABYIP-${doc.calendarYear}-Barangay-${doc.barangayName.replace(/\s+/g, "_")}.pdf`;

      await exportOfficialLandscapePdf(pageElements, {
        filename: fileName,
        marginMm: 8,
        scale: 2,
        windowWidth: 1200,
      });

      showToast(`ABYIP PDF exported successfully as "${fileName}"!`, "success");
    } catch (error: any) {
      console.error("PDF Export failed:", error);
      showToast(error.message || "Failed to export PDF", "error");
    } finally {
      setIsExportingPdf(false);
      if (wasEditing) {
        setIsEditing(true);
      }
    }
  };

  const grandTotals = calculateAbyipGrandTotals(doc);

  const formatCurrency = (val: number) => {
    return val.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-zinc-900 pb-20 font-sans print:bg-white print:p-0 print:m-0">
      {/* Print Styles for landscape and zero-merge tables */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .abyip-page-break {
            page-break-after: always !important;
            break-after: page !important;
            break-inside: avoid !important;
            margin-bottom: 0 !important;
            padding-bottom: 0 !important;
          }
          .abyip-table {
            border-collapse: collapse !important;
            table-layout: fixed !important;
            width: 100% !important;
            font-size: 8pt !important;
          }
          .abyip-table th, .abyip-table td {
            border: 1px solid #000000 !important;
            padding: 3px 5px !important;
            color: #000000 !important;
            word-break: break-word !important;
          }
          .abyip-table th {
            background-color: #f7a81b !important;
            color: #000000 !important;
            font-weight: bold !important;
            text-align: center !important;
          }
          .abyip-subhead {
            background-color: #ffffff !important;
            font-weight: 800 !important;
            text-align: left !important;
            border: 1px solid #000000 !important;
          }
        }
      `}</style>

      {/* Hidden file inputs for Logo upload */}
      <input 
        type="file" 
        ref={leftLogoInputRef} 
        onChange={(e) => handleLogoUpload(e, "left")} 
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={rightLogoInputRef} 
        onChange={(e) => handleLogoUpload(e, "right")} 
        accept="image/*" 
        className="hidden" 
      />

      {/* ======================================================== */}
      {/* TOP FLOATING ACTION & CONTROL TOOLBAR (Hidden in Print)  */}
      {/* ======================================================== */}
      <div className="sticky top-0 z-40 bg-[#0C1E36] text-white border-b border-slate-700/80 px-6 py-3.5 shadow-xl print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link 
              to="/dashboard"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
              title="Return to Dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#C89311]">
                  ABYIP Statutory Template
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                  CY {doc.calendarYear}
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-extrabold border border-blue-500/30">
                  Official PDF Layout
                </span>
              </div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-[#C89311]" />
                Barangay {doc.barangayName}, Municipality of Laak
              </h1>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Barangay selector */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <span className="text-[9px] font-black text-slate-400 uppercase mr-1.5">Barangay:</span>
              <select
                value={selectedBarangay}
                onChange={(e) => setSelectedBarangay(e.target.value)}
                className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
              >
                {MUNICIPAL_BARANGAYS_40.map(bgy => (
                  <option key={bgy} value={bgy} className="bg-slate-900 text-white">
                    {bgy}
                  </option>
                ))}
              </select>
            </div>

            {/* Mode Toggle: Edit vs Clean Preview */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                isEditing 
                  ? "bg-[#C89311] text-[#0C1E36] shadow-md hover:bg-amber-300" 
                  : "bg-slate-800 text-zinc-200 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? "Preview Clean PDF" : "Edit Fields & PPAs"}</span>
            </button>

            {/* SCAN & CHECK Button */}
            <button
              id="btn-scan-check-abyip"
              onClick={handleScanAndCheck}
              disabled={isScanningCheck}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-950/20 transition-all active:scale-95 cursor-pointer border border-amber-300 disabled:opacity-50"
              title="Scan entered ABYIP, check for missing/incorrect info, and analyze PPA alignment"
            >
              {isScanningCheck ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 text-slate-950" />
              )}
              <span>SCAN & CHECK</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            {/* Export as PDF Button */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-75 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all active:scale-95 cursor-pointer"
              title="Exports the ABYIP document exactly formatted into a landscape PDF without merging tables"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Exporting PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </>
              )}
            </button>

            {/* Print Preview Button */}
            <button
              onClick={() => {
                if (isEditing) setIsEditing(false);
                setIsPrintPreviewOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#0F294A] hover:bg-[#153663] text-amber-300 border border-amber-400/40 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shadow-sm"
              title="Preview ABYIP document exactly as rendered on A4 landscape paper"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Print Preview</span>
            </button>

            {/* Print Button */}
            <button
              onClick={() => {
                if (isEditing) setIsEditing(false);
                setTimeout(() => window.print(), 100);
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-200 border border-slate-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Prints directly in official landscape orientation"
            >
              <Printer className="w-3.5 h-3.5 text-[#C89311]" />
              <span>Print</span>
            </button>

            {/* Reset Template Button */}
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-zinc-400 hover:text-rose-300 border border-slate-700 text-xs transition-colors cursor-pointer"
              title="Reset to Official PDF Standard Template"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Quick Jump) */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-[#C89311]" /> Jump to:
          </span>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-2.5 py-1 rounded-lg text-[9.5px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
              activeTab === "all"
                ? "bg-[#C89311] text-[#0C1E36] font-black shadow-xs" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
            }`}
          >
            <span>Full Document</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("cover");
              const el = document.getElementById("abyip-cover-page");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className={`px-2.5 py-1 rounded-lg text-[9.5px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
              activeTab === "cover"
                ? "bg-[#C89311] text-[#0C1E36] font-black shadow-xs" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
            }`}
          >
            <span>Cover Page</span>
          </button>

          {doc.sections.map((sec, idx) => {
            const isSelected = activeTab === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveTab(sec.id);
                  const el = document.getElementById(sec.id);
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  isSelected 
                    ? "bg-[#C89311] text-[#0C1E36] font-black shadow-xs" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
              >
                <span>{idx + 1}. {sec.centerName}</span>
                <span className="text-[8px] opacity-70">({sec.items.length})</span>
              </button>
            );
          })}

          <button
            onClick={() => {
              setActiveTab("budget");
              const el = document.getElementById("abyip-annual-budget-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className={`px-2.5 py-1 rounded-lg text-[9.5px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
              activeTab === "budget"
                ? "bg-[#C89311] text-[#0C1E36] font-black shadow-xs" 
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
            }`}
          >
            <span>SK Annual Budget (Part I & II)</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-24 right-8 z-50 px-5 py-3 rounded-2xl shadow-xl border text-xs font-black flex items-center gap-2 print:hidden ${
              toastMessage.type === "success" 
                ? "bg-emerald-600 text-white border-emerald-500 shadow-emerald-950/20" 
                : toastMessage.type === "error"
                  ? "bg-rose-600 text-white border-rose-500 shadow-rose-950/20"
                  : "bg-[#0C1E36] text-white border-slate-700 shadow-slate-950/20"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Document Content Container */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 pt-8 print:p-0 print:m-0 print:max-w-none">
        
        {/* Notice in Edit Mode */}
        {isEditing && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 text-xs text-amber-900 flex items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-2.5">
              <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <strong>Interactive Edit Mode Active:</strong> You can edit reference codes, PPA names, project descriptions, targets, implementation periods, and budgets (MOOE, Capital Outlay CO, Personal Services PS). You can also upload official seals and logos.
              </div>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider"
            >
              Done Editing
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* PAGE 1: COVER PAGE (Page 10 of Reference PDF)            */}
        {/* ======================================================== */}
        <div 
          id="abyip-cover-page"
          className="abyip-page-break bg-white text-zinc-900 border border-zinc-300 shadow-xl rounded-2xl p-8 sm:p-12 mb-8 print:border-none print:shadow-none print:rounded-none print:p-0 min-h-[640px] flex flex-col justify-between"
        >
          {/* Header Logos & Republic Header */}
          <div className="flex items-center justify-between gap-4 pt-4">
            
            {/* Left Circular Emblem: Barangay Seal */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-emerald-600/80 bg-white p-1 flex items-center justify-center shadow-sm overflow-hidden relative group">
                {doc.leftLogoUrl ? (
                  <img src={doc.leftLogoUrl} alt="Barangay Seal" className="w-full h-full object-contain rounded-full" />
                ) : (
                  <div className="w-full h-full rounded-full border-2 border-emerald-700 bg-emerald-50 flex flex-col items-center justify-center text-center p-1 text-zinc-900">
                    <span className="text-[7.5px] font-black uppercase text-emerald-950 leading-tight">BARANGAY</span>
                    <span className="text-[8.5px] font-black uppercase text-emerald-800 leading-tight">{doc.barangayName.toUpperCase()}</span>
                    <div className="text-emerald-700 font-black text-base my-0.5">🌴</div>
                    <span className="text-[6.5px] font-bold uppercase text-zinc-600 leading-none">OFFICIAL SEAL</span>
                  </div>
                )}

                {isEditing && (
                  <div 
                    onClick={() => leftLogoInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity rounded-full p-1"
                    title="Upload Barangay Seal"
                  >
                    <Upload className="w-4 h-4 mb-0.5 text-amber-300" />
                    <span className="text-[7px] font-black uppercase">Change</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex items-center gap-1 print:hidden">
                  <button
                    onClick={() => leftLogoInputRef.current?.click()}
                    className="text-[8px] font-bold text-blue-700 hover:underline flex items-center gap-0.5"
                  >
                    <Upload className="w-2.5 h-2.5" /> Upload Seal
                  </button>
                  {doc.leftLogoUrl && (
                    <button
                      onClick={() => removeLogo("left")}
                      className="text-[8px] font-bold text-rose-600 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Center Republic Header */}
            <div className="flex-1 text-center space-y-0.5">
              {isEditing ? (
                <div className="space-y-1 max-w-md mx-auto">
                  <input 
                    type="text" 
                    value={doc.province} 
                    onChange={(e) => setDoc({ ...doc, province: e.target.value.toUpperCase() })}
                    className="text-xs font-bold text-center w-full border border-zinc-300 rounded px-2 py-0.5" 
                    placeholder="PROVINCE"
                  />
                  <input 
                    type="text" 
                    value={doc.municipality} 
                    onChange={(e) => setDoc({ ...doc, municipality: e.target.value.toUpperCase() })}
                    className="text-xs font-bold text-center w-full border border-zinc-300 rounded px-2 py-0.5" 
                    placeholder="MUNICIPALITY"
                  />
                  <input 
                    type="text" 
                    value={doc.barangayName} 
                    onChange={(e) => setDoc({ ...doc, barangayName: e.target.value })}
                    className="text-sm font-black text-center w-full border border-zinc-300 rounded px-2 py-0.5" 
                    placeholder="BARANGAY NAME"
                  />
                </div>
              ) : (
                <>
                  <p className="text-xs tracking-wider uppercase text-zinc-800 font-bold">Republic of the Philippines</p>
                  <p className="text-xs tracking-wider uppercase text-zinc-800 font-bold">Province of {doc.province}</p>
                  <p className="text-xs tracking-wider uppercase text-zinc-800 font-bold">Municipality of {doc.municipality}</p>
                  <p className="text-sm tracking-wider uppercase text-zinc-900 font-black">Barangay {doc.barangayName}</p>
                  <p className="text-xs tracking-widest uppercase text-[#0C1E36] font-black pt-1">
                    Office of the Sangguniang Kabataan
                  </p>
                </>
              )}
            </div>

            {/* Right Circular Emblem: Sangguniang Kabataan */}
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-500/80 bg-white p-1 flex items-center justify-center shadow-sm overflow-hidden relative group">
                {doc.rightLogoUrl ? (
                  <img src={doc.rightLogoUrl} alt="SK Logo" className="w-full h-full object-contain rounded-full" />
                ) : (
                  <img src={defaultEmblem} alt="SK Logo" className="w-full h-full object-cover scale-[1.25] rounded-full" />
                )}

                {isEditing && (
                  <div 
                    onClick={() => rightLogoInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity rounded-full p-1"
                    title="Upload SK Logo"
                  >
                    <Upload className="w-4 h-4 mb-0.5 text-amber-300" />
                    <span className="text-[7px] font-black uppercase">Change</span>
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="flex items-center gap-1 print:hidden">
                  <button
                    onClick={() => rightLogoInputRef.current?.click()}
                    className="text-[8px] font-bold text-blue-700 hover:underline flex items-center gap-0.5"
                  >
                    <Upload className="w-2.5 h-2.5" /> Upload SK Logo
                  </button>
                  {doc.rightLogoUrl && (
                    <button
                      onClick={() => removeLogo("right")}
                      className="text-[8px] font-bold text-rose-600 hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Grand Cover Page Title (Matching Page 10) */}
          <div className="my-16 text-center space-y-4">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-zinc-950 font-sans leading-tight">
              Annual Barangay
              <br />
              Youth Investment
              <br />
              Program
            </h1>

            <div className="pt-4">
              <p className="text-lg sm:text-xl font-bold uppercase tracking-widest text-zinc-700">
                (ABYIP Calendar Year {doc.calendarYear})
              </p>
              {isEditing && (
                <div className="inline-flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold text-zinc-500">Change Year:</span>
                  <input
                    type="text"
                    value={doc.calendarYear}
                    onChange={(e) => setDoc({ ...doc, calendarYear: e.target.value })}
                    className="w-20 text-center text-sm font-black border border-zinc-300 rounded px-2 py-0.5"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Signatories on Cover Page */}
          <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-200">
            <div className="text-left space-y-1">
              <p className="text-xs font-medium text-zinc-500">Prepared by:</p>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={doc.preparedByName}
                    onChange={(e) => setDoc({ ...doc, preparedByName: e.target.value.toUpperCase() })}
                    className="text-xs font-black w-full border border-zinc-300 rounded px-2 py-0.5"
                    placeholder="SECRETARY NAME"
                  />
                  <input
                    type="text"
                    value={doc.preparedByTitle}
                    onChange={(e) => setDoc({ ...doc, preparedByTitle: e.target.value })}
                    className="text-[10px] font-bold w-full border border-zinc-300 rounded px-2 py-0.5 text-zinc-500"
                    placeholder="TITLE"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-800 pb-0.5 inline-block min-w-[200px]">
                    {doc.preparedByName}
                  </p>
                  <p className="text-[10px] font-extrabold uppercase text-zinc-600 tracking-wider">
                    {doc.preparedByTitle}
                  </p>
                </div>
              )}
            </div>

            <div className="text-right space-y-1">
              <p className="text-xs font-medium text-zinc-500">Approved by:</p>
              {isEditing ? (
                <div className="space-y-1">
                  <input
                    type="text"
                    value={doc.approvedByName}
                    onChange={(e) => setDoc({ ...doc, approvedByName: e.target.value.toUpperCase() })}
                    className="text-xs font-black w-full border border-zinc-300 rounded px-2 py-0.5 text-right"
                    placeholder="CHAIRPERSON NAME"
                  />
                  <input
                    type="text"
                    value={doc.approvedByTitle}
                    onChange={(e) => setDoc({ ...doc, approvedByTitle: e.target.value })}
                    className="text-[10px] font-bold w-full border border-zinc-300 rounded px-2 py-0.5 text-zinc-500 text-right"
                    placeholder="TITLE"
                  />
                </div>
              ) : (
                <div>
                  <p className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-800 pb-0.5 inline-block min-w-[200px]">
                    {doc.approvedByName}
                  </p>
                  <p className="text-[10px] font-extrabold uppercase text-zinc-600 tracking-wider">
                    {doc.approvedByTitle}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN INVESTMENT MATRIX: 8-10 CENTERS (Pages 1-9 of Reference PDF)         */}
        {/* ========================================================================= */}
        {doc.sections.map((section, secIdx) => {
          const secTotals = calculateAbyipSectionTotals(section);
          // Intelligently paginate items to completely fill each Landscape A4 page
          const chunks = paginateAbyipSection(section);

          return chunks.map((chunk, chunkIdx) => {
            const isFirstSubpage = chunkIdx === 0;
            const isLastSubpage = chunkIdx === chunks.length - 1;
            const subpageId = isFirstSubpage ? section.id : `${section.id}-part-${chunkIdx + 1}`;

            return (
              <div
                key={subpageId}
                id={subpageId}
                className="abyip-page-break bg-white text-zinc-900 border border-zinc-300 shadow-xl rounded-2xl p-6 sm:p-8 mb-8 print:border-none print:shadow-none print:rounded-none print:p-0 print:mb-0 flex flex-col justify-between"
              >
                <div>
                  {/* Center Page Title Block (Exact format from PDF Pages 1-9) */}
                  <div className="border border-black bg-white px-4 py-2 mb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-sm font-black tracking-wide text-black uppercase">
                          ANNUAL BARANGAY YOUTH INVESTMENT PLAN {doc.calendarYear}
                        </h2>
                        <h3 className="text-xs font-black tracking-wide text-black uppercase">
                          CENTER OF PARTICIPATION: {section.centerName}
                          {!isFirstSubpage && " (CONTINUATION)"}
                          {chunks.length > 1 && (
                            <span className="ml-2 font-mono text-[11px] text-zinc-600 font-bold">
                              [Sheet {chunkIdx + 1} of {chunks.length}]
                            </span>
                          )}
                        </h3>
                      </div>

                      {isEditing && (
                        <button
                          onClick={() => handleOpenAddPpa(section.id)}
                          className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-black flex items-center gap-1 shadow-sm print:hidden cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add PPA Row</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* The Exact Official Landscape Table */}
                  <div className="overflow-x-auto print:overflow-visible">
                    <table className="abyip-table w-full border-collapse text-[10px] border border-black font-sans">
                      {/* Fixed column widths so table NEVER collapses or merges */}
                      <colgroup>
                        <col style={{ width: "95px" }} />
                        <col style={{ width: "190px" }} />
                        <col style={{ width: "260px" }} />
                        <col style={{ width: "135px" }} />
                        <col style={{ width: "135px" }} />
                        <col style={{ width: "115px" }} />
                        <col style={{ width: "80px" }} />
                        <col style={{ width: "65px" }} />
                        <col style={{ width: "80px" }} />
                        <col style={{ width: "90px" }} />
                        <col style={{ width: "120px" }} />
                        {isEditing && <col style={{ width: "70px" }} className="print:hidden" />}
                      </colgroup>

                      {/* Header Rows (Gold/Yellow background #f7a81b matching PDF) */}
                      <thead>
                        <tr className="bg-[#f7a81b] text-black font-bold uppercase text-center border-b border-black text-[9px] leading-tight">
                          <th rowSpan={2} className="border border-black p-1.5 align-middle">
                            REFERENCE<br />CODE
                          </th>
                          <th rowSpan={2} className="border border-black p-1.5 align-middle">
                            PPA's
                          </th>
                          <th rowSpan={2} className="border border-black p-1.5 align-middle">
                            DESCRIPTION
                          </th>
                          <th rowSpan={2} className="border border-black p-1.5 align-middle">
                            EXPECTED<br />RESULTS
                          </th>
                          <th rowSpan={2} className="border border-black p-1.5 align-middle">
                            PERFORMANCE<br />INDICATOR
                          </th>
                          <th rowSpan={2} className="border border-black p-1.5 align-middle">
                            PERIOD<br />IMPLEMENTATION
                          </th>
                          <th colSpan={4} className="border border-black p-1 text-center font-black">
                            SCHEDULE OF CASH / BUDGET CLASSIFICATION
                          </th>
                          <th rowSpan={2} className="border border-black p-1.5 align-middle">
                            PERSON<br />RESPONSIBLE
                          </th>
                          {isEditing && (
                            <th rowSpan={2} className="border border-black p-1.5 align-middle print:hidden">
                              ACTION
                            </th>
                          )}
                        </tr>
                        <tr className="bg-[#f7a81b] text-black font-bold uppercase text-center border-b border-black text-[9px]">
                          <th className="border border-black p-1">MOOE</th>
                          <th className="border border-black p-1">CO</th>
                          <th className="border border-black p-1">PS</th>
                          <th className="border border-black p-1 font-black">Total</th>
                        </tr>
                      </thead>

                      <tbody>
                        {/* Program Header Sub-row (e.g. GENERAL ADMINISTRATIVE PROGRAM) on first sheet */}
                        {isFirstSubpage && section.programHeader && (
                          <tr className="bg-white text-black font-black uppercase text-left text-[10px] border-b border-black">
                            <td colSpan={isEditing ? 12 : 11} className="border border-black p-1.5 pl-2 tracking-wide font-black">
                              {section.programHeader}
                            </td>
                          </tr>
                        )}

                        {/* Section Item Rows */}
                        {chunk.length === 0 ? (
                          <tr className="border-b border-black">
                            <td colSpan={isEditing ? 12 : 11} className="p-4 text-center text-zinc-400 italic">
                              No PPA entries for this Center of Participation.
                            </td>
                          </tr>
                        ) : (
                          chunk.map((item, itmIdx) => {
                            return (
                              <tr 
                                key={item.id}
                                className="hover:bg-amber-50/40 transition-colors border-b border-black align-top text-black text-[9.5px]"
                              >
                                {/* Reference Code */}
                                <td className="border border-black p-1.5 font-mono text-[9px] font-semibold text-center whitespace-pre-line">
                                  {item.referenceCode || "—"}
                                </td>

                                {/* PPA Name */}
                                <td className="border border-black p-1.5 font-bold uppercase whitespace-pre-line leading-snug">
                                  {item.ppaName}
                                </td>

                                {/* Description */}
                                <td className="border border-black p-1.5 leading-relaxed text-justify">
                                  {item.description}
                                </td>

                                {/* Expected Results */}
                                <td className="border border-black p-1.5 leading-snug text-left">
                                  {item.expectedResults}
                                </td>

                                {/* Performance Indicator */}
                                <td className="border border-black p-1.5 leading-snug text-left">
                                  {item.performanceIndicator}
                                </td>

                                {/* Period Implementation */}
                                <td className="border border-black p-1.5 text-center font-medium">
                                  {item.periodImplementation}
                                </td>

                                {/* MOOE */}
                                <td className="border border-black p-1.5 text-right font-mono font-medium">
                                  {item.mooe > 0 ? formatCurrency(item.mooe) : "—"}
                                </td>

                                {/* CO */}
                                <td className="border border-black p-1.5 text-right font-mono font-medium">
                                  {item.co > 0 ? formatCurrency(item.co) : "—"}
                                </td>

                                {/* PS */}
                                <td className="border border-black p-1.5 text-right font-mono font-medium">
                                  {item.ps > 0 ? formatCurrency(item.ps) : "—"}
                                </td>

                                {/* Total */}
                                <td className="border border-black p-1.5 text-right font-mono font-bold">
                                  {formatCurrency(item.total || (item.mooe + item.co + item.ps))}
                                </td>

                                {/* Person Responsible */}
                                <td className="border border-black p-1.5 text-center leading-tight">
                                  {item.personResponsible}
                                </td>

                                {/* Edit / Delete Actions */}
                                {isEditing && (
                                  <td className="border border-black p-1.5 text-center print:hidden">
                                    <div className="flex items-center justify-center gap-1">
                                      <button
                                        onClick={() => handleOpenEditPpa(section.id, item)}
                                        className="p-1 text-blue-700 hover:bg-blue-100 rounded cursor-pointer"
                                        title="Edit PPA"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => handleDeletePpa(section.id, item.id)}
                                        className="p-1 text-rose-700 hover:bg-rose-100 rounded cursor-pointer"
                                        title="Delete PPA"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            );
                          })
                        )}

                        {/* Section Subtotal Row on last sheet of center */}
                        {isLastSubpage ? (
                          <tr className="bg-zinc-100 font-black text-black border-t border-b border-black text-[9.5px]">
                            <td colSpan={6} className="border border-black p-1.5 text-right uppercase tracking-wider">
                              SUBTOTAL ({section.centerName}):
                            </td>
                            <td className="border border-black p-1.5 text-right font-mono">
                              {formatCurrency(secTotals.mooe)}
                            </td>
                            <td className="border border-black p-1.5 text-right font-mono">
                              {formatCurrency(secTotals.co)}
                            </td>
                            <td className="border border-black p-1.5 text-right font-mono">
                              {formatCurrency(secTotals.ps)}
                            </td>
                            <td className="border border-black p-1.5 text-right font-mono text-black">
                              {formatCurrency(secTotals.total)}
                            </td>
                            <td className="border border-black p-1.5"></td>
                            {isEditing && <td className="border border-black p-1.5 print:hidden"></td>}
                          </tr>
                        ) : (
                          <tr className="bg-zinc-100 font-bold text-zinc-700 border-t border-b border-black text-[9px]">
                            <td colSpan={isEditing ? 12 : 11} className="border border-black p-1.5 text-right uppercase tracking-wider italic">
                              Continued on next sheet [Sheet {chunkIdx + 2} of {chunks.length}] →
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Bottom Signatories on each page */}
                <div className="grid grid-cols-2 gap-8 pt-4 mt-3 border-t border-zinc-300">
                  <div className="text-left space-y-0.5">
                    <p className="text-[9px] font-medium text-zinc-500">Prepared by:</p>
                    <p className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-800 pb-0.5 inline-block min-w-[180px]">
                      {doc.preparedByName}
                    </p>
                    <p className="text-[9px] font-bold uppercase text-zinc-600 tracking-wider">
                      {doc.preparedByTitle}
                    </p>
                  </div>

                  <div className="text-right space-y-0.5">
                    <p className="text-[9px] font-medium text-zinc-500">Approved by:</p>
                    <p className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-800 pb-0.5 inline-block min-w-[180px]">
                      {doc.approvedByName}
                    </p>
                    <p className="text-[9px] font-bold uppercase text-zinc-600 tracking-wider">
                      {doc.approvedByTitle}
                    </p>
                  </div>
                </div>
              </div>
            );
          });
        })}

        {/* ========================================================================= */}
        {/* GRAND TOTAL SUMMARY BLOCK (Bottom of ABYIP Matrix)                        */}
        {/* ========================================================================= */}
        <div className="abyip-page-break bg-white text-zinc-900 border border-zinc-300 shadow-xl rounded-2xl p-6 sm:p-8 mb-8 print:border-none print:shadow-none print:rounded-none print:p-0">
          <div className="border border-black bg-white px-4 py-2 mb-3">
            <h2 className="text-sm font-black tracking-wide text-black uppercase">
              ABYIP CONSOLIDATED GRAND TOTAL RECAPITULATION (CY {doc.calendarYear})
            </h2>
          </div>

          <table className="abyip-table w-full border-collapse text-xs border border-black font-sans">
            <thead>
              <tr className="bg-[#f7a81b] text-black font-black uppercase text-center border-b border-black">
                <th className="border border-black p-2 text-left">Classification</th>
                <th className="border border-black p-2 text-right">Maintenance & Other Operating Expenses (MOOE)</th>
                <th className="border border-black p-2 text-right">Capital Outlay (CO)</th>
                <th className="border border-black p-2 text-right">Personal Services (PS)</th>
                <th className="border border-black p-2 text-right">Total Amount (PHP)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="text-black font-black text-sm bg-amber-50/60">
                <td className="border border-black p-3 uppercase">
                  GRAND TOTAL OF ABYIP ({doc.calendarYear})
                </td>
                <td className="border border-black p-3 text-right font-mono">
                  ₱ {formatCurrency(grandTotals.mooe)}
                </td>
                <td className="border border-black p-3 text-right font-mono">
                  ₱ {formatCurrency(grandTotals.co)}
                </td>
                <td className="border border-black p-3 text-right font-mono">
                  ₱ {formatCurrency(grandTotals.ps)}
                </td>
                <td className="border border-black p-3 text-right font-mono text-[#0C1E36] font-black text-base">
                  ₱ {formatCurrency(grandTotals.total)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Official Endorsements & Approvals */}
          <div className="grid grid-cols-2 gap-12 pt-10 mt-8 border-t border-zinc-300">
            <div className="text-left space-y-1">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Prepared by:</p>
              <div className="pt-6">
                <p className="text-sm font-black uppercase text-zinc-900 border-b-2 border-zinc-900 pb-1 inline-block min-w-[240px]">
                  {doc.preparedByName}
                </p>
                <p className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider pt-0.5">
                  {doc.preparedByTitle}
                </p>
              </div>
            </div>

            <div className="text-right space-y-1">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Approved by:</p>
              <div className="pt-6">
                <p className="text-sm font-black uppercase text-zinc-900 border-b-2 border-zinc-900 pb-1 inline-block min-w-[240px]">
                  {doc.approvedByName}
                </p>
                <p className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider pt-0.5">
                  {doc.approvedByTitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* SK ANNUAL BUDGET: PART I (Receipts Program - Page 11 of Reference PDF)     */}
        {/* ========================================================================= */}
        <div 
          id="abyip-annual-budget-section"
          className="abyip-page-break bg-white text-zinc-900 border border-zinc-300 shadow-xl rounded-2xl p-8 sm:p-12 mb-8 print:border-none print:shadow-none print:rounded-none print:p-0 min-h-[520px] flex flex-col justify-between"
        >
          <div>
            {/* Header of Budget (Page 11) */}
            <div className="text-center space-y-1 mb-8 border-b pb-6 border-zinc-200">
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-700">Province of {doc.province}</p>
              <p className="text-xs font-bold uppercase tracking-wider text-zinc-700">Municipality of {doc.municipality}</p>
              <p className="text-sm font-black uppercase tracking-wider text-zinc-900">Barangay {doc.barangayName}</p>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-zinc-950 pt-2">
                SK Annual Budget CY {doc.calendarYear}
              </h2>
            </div>

            {/* PART I: Receipts Program */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900 border-b-2 border-zinc-800 pb-1">
                PART I: Receipts Program
              </h3>

              <div className="space-y-2 max-w-3xl">
                <div className="flex justify-between items-center py-2 border-b border-zinc-200 text-xs">
                  <span className="font-semibold text-zinc-800">
                    Ten percent (10%) of the General Fund of Barangay - Lumpsum
                  </span>
                  <span className="font-mono font-bold text-zinc-950 text-sm">
                    ₱ 953,464.90
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-zinc-200 text-xs">
                  <span className="font-semibold text-zinc-800">
                    {doc.calendarYear} IRA / NTA Increase
                  </span>
                  <span className="font-mono font-medium text-zinc-500">
                    ₱ 0.00
                  </span>
                </div>

                <div className="flex justify-between items-center py-3 border-t-2 border-b-2 border-zinc-900 font-black text-sm">
                  <span className="uppercase tracking-wider text-zinc-950">
                    TOTAL ESTIMATED FUNDS AVAILABLE FOR APPROPRIATION
                  </span>
                  <span className="font-mono text-base text-[#0C1E36]">
                    ₱ 953,464.90
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-8 mt-6 border-t border-zinc-200">
            <div className="text-left space-y-1">
              <p className="text-[10px] font-bold uppercase text-zinc-400">Certified Correct:</p>
              <p className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-800 pb-0.5 inline-block min-w-[180px]">
                {doc.approvedByName}
              </p>
              <p className="text-[9px] font-bold uppercase text-zinc-600 tracking-wider">
                {doc.approvedByTitle}
              </p>
            </div>

            <div className="text-right space-y-1">
              <p className="text-[10px] font-bold uppercase text-zinc-400">Certified Correct:</p>
              <p className="text-xs font-black uppercase text-zinc-900 border-b border-zinc-800 pb-0.5 inline-block min-w-[180px]">
                {doc.treasurerName || "FLORY ANN A. JAKOSALEM"}
              </p>
              <p className="text-[9px] font-bold uppercase text-zinc-600 tracking-wider">
                {doc.treasurerTitle || "SK TREASURER"}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SK ANNUAL BUDGET: PART II (Expenditures Program - Page 12 of PDF)         */}
        {/* ========================================================================= */}
        <div 
          id="abyip-annual-budget-expenditures"
          className="abyip-page-break bg-white text-zinc-900 border border-zinc-300 shadow-xl rounded-2xl p-6 sm:p-8 mb-8 print:border-none print:shadow-none print:rounded-none print:p-0 min-h-[640px] flex flex-col justify-between"
        >
          {/* Header of Budget Part II */}
          <div className="text-center space-y-1 mb-4 border-b pb-3 border-zinc-200">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
              Republic of the Philippines • Province of {doc.province} • Municipality of {doc.municipality} • Barangay {doc.barangayName}
            </p>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-950">
              SK Annual Budget CY {doc.calendarYear} — PART II: EXPENDITURES PROGRAM
            </h2>
          </div>

          <div className="space-y-4">
            <div className="border border-black bg-white px-3 py-1.5">
              <h3 className="text-xs font-black uppercase tracking-wider text-black">
                PART II: EXPENDITURES PROGRAM — CURRENT OPERATING EXPENDITURE
              </h3>
            </div>

            <table className="abyip-table w-full border-collapse text-[9.5px] border border-black font-sans">
              <thead>
                <tr className="bg-[#f7a81b] text-black font-black uppercase text-center border-b border-black">
                  <th className="border border-black p-2 text-left" style={{ width: "35%" }}>
                    OBJECTIVES OF EXPENDITURES
                  </th>
                  <th className="border border-black p-2 text-center" style={{ width: "15%" }}>
                    ACCOUNT CODES
                  </th>
                  <th className="border border-black p-2 text-right" style={{ width: "18%" }}>
                    BUDGET YEAR EXPENDITURES
                  </th>
                  <th className="border border-black p-2 text-left" style={{ width: "16%" }}>
                    EXPECTED RESULT (DESIRED OBJECTIVE)
                  </th>
                  <th className="border border-black p-2 text-left" style={{ width: "16%" }}>
                    PERFORMANCE INDICATOR (MEANS OF MEASUREMENT)
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* General Admin Program Header */}
                <tr className="bg-zinc-100 font-black text-black border-b border-black">
                  <td colSpan={5} className="border border-black p-1.5 uppercase font-black">
                    GENERAL ADMINISTRATION PROGRAM
                  </td>
                </tr>

                {/* PS Header */}
                <tr className="bg-white font-bold text-black border-b border-black">
                  <td colSpan={5} className="border border-black p-1 pl-4 uppercase font-bold text-zinc-800">
                    PERSONAL SERVICES (PS)
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 pl-6">Honorarium</td>
                  <td className="border border-black p-1.5 text-center font-mono">5-01-02-050</td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold">238,366.00</td>
                  <td className="border border-black p-1.5" rowSpan={2}>
                    9 Members of SK Council provided with honorarium
                  </td>
                  <td className="border border-black p-1.5" rowSpan={2}>
                    SK Councilors, SK Treasurer and SK Secretary
                  </td>
                </tr>
                <tr className="bg-zinc-50 font-bold">
                  <td className="border border-black p-1.5 pl-4 uppercase">TOTAL PS</td>
                  <td className="border border-black p-1.5 text-center"></td>
                  <td className="border border-black p-1.5 text-right font-mono font-black">238,366.00</td>
                </tr>

                {/* MOOE Header */}
                <tr className="bg-white font-bold text-black border-b border-black">
                  <td colSpan={5} className="border border-black p-1 pl-4 uppercase font-bold text-zinc-800">
                    MAINTENANCE AND OTHER OPERATING EXPENSES (MOOE)
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 pl-6">Office supplies & Expenses</td>
                  <td className="border border-black p-1.5 text-center font-mono">5-02-03-010</td>
                  <td className="border border-black p-1.5 text-right font-mono">20,000.00</td>
                  <td className="border border-black p-1.5" rowSpan={8}>
                    Logistical support of the Sangguniang Kabataan
                  </td>
                  <td className="border border-black p-1.5" rowSpan={8}>
                    SK Officials & Members
                  </td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 pl-6">Representation Expenses</td>
                  <td className="border border-black p-1.5 text-center font-mono">5-02-99-020</td>
                  <td className="border border-black p-1.5 text-right font-mono">20,000.00</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 pl-6">Repair & Maintenance (Machinery Equipment)</td>
                  <td className="border border-black p-1.5 text-center font-mono">5-02-09-040</td>
                  <td className="border border-black p-1.5 text-right font-mono">5,000.00</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 pl-6">Membership dues & Contribution organization</td>
                  <td className="border border-black p-1.5 text-center font-mono">5-02-99-050</td>
                  <td className="border border-black p-1.5 text-right font-mono">5,000.00</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 pl-6">Other supplies & Material expenses</td>
                  <td className="border border-black p-1.5 text-center font-mono">5-02-03-990</td>
                  <td className="border border-black p-1.5 text-right font-mono">5,000.00</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 pl-6">Electricity Expenses</td>
                  <td className="border border-black p-1.5 text-center font-mono">5-02-11-020</td>
                  <td className="border border-black p-1.5 text-right font-mono">50,000.00</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 pl-6">Office equipment</td>
                  <td className="border border-black p-1.5 text-center font-mono">5-02-09-040</td>
                  <td className="border border-black p-1.5 text-right font-mono">23,098.90</td>
                </tr>
                <tr>
                  <td className="border border-black p-1.5 pl-6">Fidelity Bond</td>
                  <td className="border border-black p-1.5 text-center font-mono">5-02-11-010</td>
                  <td className="border border-black p-1.5 text-right font-mono">5,000.00</td>
                </tr>
                <tr className="bg-zinc-50 font-bold">
                  <td className="border border-black p-1.5 pl-4 uppercase">TOTAL MOOE</td>
                  <td className="border border-black p-1.5 text-center"></td>
                  <td className="border border-black p-1.5 text-right font-mono font-black">133,098.90</td>
                  <td className="border border-black p-1.5"></td>
                  <td className="border border-black p-1.5"></td>
                </tr>
                <tr className="bg-zinc-100 font-black text-black">
                  <td className="border border-black p-2 uppercase">TOTAL GENERAL ADMINISTRATION PROGRAM</td>
                  <td className="border border-black p-2 text-center"></td>
                  <td className="border border-black p-2 text-right font-mono font-black text-xs">371,464.90</td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>

                {/* SK Youth Development Program Header */}
                <tr className="bg-zinc-100 font-black text-black border-t border-b border-black">
                  <td colSpan={5} className="border border-black p-2 uppercase font-black">
                    SK YOUTH DEVELOPMENT PROGRAM
                  </td>
                </tr>

                {/* Governance Program */}
                <tr>
                  <td className="border border-black p-1.5 pl-4 font-bold">GOVERNANCE PROGRAM</td>
                  <td className="border border-black p-1.5 text-center font-mono"></td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold">265,000.00</td>
                  <td className="border border-black p-1.5 text-xs">To give allowance to SK officials, conduct Linggo ng Kabataan & KK assemblies</td>
                  <td className="border border-black p-1.5 text-xs">SK Officials & Members</td>
                </tr>

                {/* Active Citizenship */}
                <tr>
                  <td className="border border-black p-1.5 pl-4 font-bold">ACTIVE CITIZENSHIP PROGRAM</td>
                  <td className="border border-black p-1.5 text-center font-mono"></td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold">204,000.00</td>
                  <td className="border border-black p-1.5 text-xs">Healthier & more active youth; Gawad Parangal</td>
                  <td className="border border-black p-1.5 text-xs">SK Officials & KK Members</td>
                </tr>

                {/* Environment */}
                <tr>
                  <td className="border border-black p-1.5 pl-4 font-bold">ENVIRONMENT PROGRAM</td>
                  <td className="border border-black p-1.5 text-center font-mono"></td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold">24,000.00</td>
                  <td className="border border-black p-1.5 text-xs">Greener and cleaner community</td>
                  <td className="border border-black p-1.5 text-xs">SK Officials & KK Members</td>
                </tr>

                {/* Agriculture */}
                <tr>
                  <td className="border border-black p-1.5 pl-4 font-bold">AGRICULTURE PROGRAM</td>
                  <td className="border border-black p-1.5 text-center font-mono"></td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold">20,000.00</td>
                  <td className="border border-black p-1.5 text-xs">To decrease unhealthy foods in the barangay</td>
                  <td className="border border-black p-1.5 text-xs">SK Officials & KK Members</td>
                </tr>

                {/* Peace Building & Security */}
                <tr>
                  <td className="border border-black p-1.5 pl-4 font-bold">PEACE BUILDING & SECURITY PROGRAM</td>
                  <td className="border border-black p-1.5 text-center font-mono"></td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold">7,000.00</td>
                  <td className="border border-black p-1.5 text-xs">Youth knowledgeable enough on illegal drugs</td>
                  <td className="border border-black p-1.5 text-xs">SK Officials & KK Members</td>
                </tr>

                {/* Social Inclusion & Equity */}
                <tr>
                  <td className="border border-black p-1.5 pl-4 font-bold">SOCIAL INCLUSION & EQUITY PROGRAM</td>
                  <td className="border border-black p-1.5 text-center font-mono"></td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold">30,000.00</td>
                  <td className="border border-black p-1.5 text-xs">To gain knowledge on gender awareness (LGBTQIA+ Day)</td>
                  <td className="border border-black p-1.5 text-xs">SK Officials & KK Members</td>
                </tr>

                {/* Health */}
                <tr>
                  <td className="border border-black p-1.5 pl-4 font-bold">HEALTH PROGRAM</td>
                  <td className="border border-black p-1.5 text-center font-mono"></td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold">2,000.00</td>
                  <td className="border border-black p-1.5 text-xs">Knowledgeable on basic life support and first aid</td>
                  <td className="border border-black p-1.5 text-xs">SK Officials & KK Members</td>
                </tr>

                {/* Education */}
                <tr>
                  <td className="border border-black p-1.5 pl-4 font-bold">EDUCATION PROGRAM</td>
                  <td className="border border-black p-1.5 text-center font-mono"></td>
                  <td className="border border-black p-1.5 text-right font-mono font-bold">30,000.00</td>
                  <td className="border border-black p-1.5 text-xs">Students received school supplies (Brigada Eskwela)</td>
                  <td className="border border-black p-1.5 text-xs">SK Officials & KK Members</td>
                </tr>

                {/* Summary Totals */}
                <tr className="bg-zinc-100 font-black text-black">
                  <td className="border border-black p-2 uppercase">TOTAL SK YOUTH DEVELOPMENT & EMPOWERMENT PROGRAM</td>
                  <td className="border border-black p-2 text-center">₱</td>
                  <td className="border border-black p-2 text-right font-mono font-black text-xs">582,000.00</td>
                  <td className="border border-black p-2"></td>
                  <td className="border border-black p-2"></td>
                </tr>

                <tr className="bg-amber-100/70 font-black text-black text-xs">
                  <td className="border border-black p-2.5 uppercase tracking-wide">TOTAL APPROPRIATION (PART I & II BALANCED)</td>
                  <td className="border border-black p-2.5 text-center">₱</td>
                  <td className="border border-black p-2.5 text-right font-mono font-black text-sm">953,464.90</td>
                  <td className="border border-black p-2.5"></td>
                  <td className="border border-black p-2.5"></td>
                </tr>

                <tr className="bg-white font-bold text-black text-xs">
                  <td className="border border-black p-2 uppercase">BALANCE END</td>
                  <td className="border border-black p-2 text-center"></td>
                  <td className="border border-black p-2 text-right font-mono font-black">— 0.00</td>
                  <td className="border border-black p-2" colSpan={2}>Balanced Statutory 10% Fund</td>
                </tr>
              </tbody>
            </table>

            {/* Budget Signatories */}
            <div className="grid grid-cols-2 gap-12 pt-8 mt-6 border-t border-zinc-300">
              <div className="text-left space-y-1">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Prepared by:</p>
                <div className="pt-4">
                  <p className="text-sm font-black uppercase text-zinc-900 border-b border-zinc-900 pb-0.5 inline-block min-w-[200px]">
                    {doc.preparedByName}
                  </p>
                  <p className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider">
                    {doc.preparedByTitle}
                  </p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Approved by:</p>
                <div className="pt-4">
                  <p className="text-sm font-black uppercase text-zinc-900 border-b border-zinc-900 pb-0.5 inline-block min-w-[200px]">
                    {doc.approvedByName}
                  </p>
                  <p className="text-xs font-extrabold uppercase text-zinc-700 tracking-wider">
                    {doc.approvedByTitle}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: ADD OR EDIT PPA ITEM                                               */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {modalItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-3xl shadow-2xl border border-zinc-200 w-full max-w-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="bg-[#0C1E36] text-white p-6 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-[#C89311]">
                      ABYIP Investment Entry
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {doc.sections.find((s) => s.id === modalItem.sectionId)?.centerName}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    {modalItem.isNew ? "Add New PPA Row" : "Edit PPA Details"}
                  </h3>
                </div>
                <button
                  onClick={() => setModalItem(null)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Reference Code */}
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-600">
                      Reference Code (Account Code)
                    </label>
                    <input
                      type="text"
                      value={modalItem.item.referenceCode}
                      onChange={(e) =>
                        setModalItem({
                          ...modalItem,
                          item: { ...modalItem.item, referenceCode: e.target.value },
                        })
                      }
                      placeholder="e.g. 5-02-99-020"
                      className="w-full px-3.5 py-2 text-xs font-mono font-bold bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89311]"
                    />
                  </div>

                  {/* Implementation Period */}
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-600">
                      Implementation Period
                    </label>
                    <input
                      type="text"
                      value={modalItem.item.periodImplementation}
                      onChange={(e) =>
                        setModalItem({
                          ...modalItem,
                          item: { ...modalItem.item, periodImplementation: e.target.value },
                        })
                      }
                      placeholder="e.g. January-December or August"
                      className="w-full px-3.5 py-2 text-xs font-bold bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89311]"
                    />
                  </div>
                </div>

                {/* PPA Name / Title */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-600">
                    Program / Project / Activity (PPA's) Name
                  </label>
                  <textarea
                    rows={2}
                    value={modalItem.item.ppaName}
                    onChange={(e) =>
                      setModalItem({
                        ...modalItem,
                        item: { ...modalItem.item, ppaName: e.target.value },
                      })
                    }
                    placeholder="e.g. BOLA-TA-SOY! SPORTS DEV'T PROG. (*PRIZES, *HONORARIUM)"
                    className="w-full px-3.5 py-2 text-xs font-bold bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89311]"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-600">
                    Description & Objectives
                  </label>
                  <textarea
                    rows={2}
                    value={modalItem.item.description}
                    onChange={(e) =>
                      setModalItem({
                        ...modalItem,
                        item: { ...modalItem.item, description: e.target.value },
                      })
                    }
                    placeholder="Detailed project description..."
                    className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89311]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Expected Results */}
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-600">
                      Expected Results
                    </label>
                    <textarea
                      rows={2}
                      value={modalItem.item.expectedResults}
                      onChange={(e) =>
                        setModalItem({
                          ...modalItem,
                          item: { ...modalItem.item, expectedResults: e.target.value },
                        })
                      }
                      placeholder="e.g. Greener and Cleaner community"
                      className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89311]"
                    />
                  </div>

                  {/* Performance Indicator */}
                  <div className="space-y-1">
                    <label className="text-xs font-black uppercase tracking-wider text-zinc-600">
                      Performance Indicator
                    </label>
                    <textarea
                      rows={2}
                      value={modalItem.item.performanceIndicator}
                      onChange={(e) =>
                        setModalItem({
                          ...modalItem,
                          item: { ...modalItem.item, performanceIndicator: e.target.value },
                        })
                      }
                      placeholder="e.g. Number of youth participated"
                      className="w-full px-3.5 py-2 text-xs bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89311]"
                    />
                  </div>
                </div>

                {/* Budget Schedule Group: MOOE, CO, PS */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                      Schedule of Cash / Budget Classification
                    </span>
                    <span className="text-xs font-black text-[#0C1E36]">
                      Row Total: ₱ {formatCurrency((Number(modalItem.item.mooe) || 0) + (Number(modalItem.item.co) || 0) + (Number(modalItem.item.ps) || 0))}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                        MOOE (PHP)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={modalItem.item.mooe}
                        onChange={(e) =>
                          setModalItem({
                            ...modalItem,
                            item: { ...modalItem.item, mooe: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89311]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                        Capital Outlay (CO)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={modalItem.item.co}
                        onChange={(e) =>
                          setModalItem({
                            ...modalItem,
                            item: { ...modalItem.item, co: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89311]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600">
                        Personal Services (PS)
                      </label>
                      <input
                        type="number"
                        step="1000"
                        value={modalItem.item.ps}
                        onChange={(e) =>
                          setModalItem({
                            ...modalItem,
                            item: { ...modalItem.item, ps: parseFloat(e.target.value) || 0 },
                          })
                        }
                        className="w-full px-3 py-1.5 text-xs font-mono font-bold bg-white border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#C89311]"
                      />
                    </div>
                  </div>
                </div>

                {/* Person Responsible */}
                <div className="space-y-1">
                  <label className="text-xs font-black uppercase tracking-wider text-zinc-600">
                    Person Responsible
                  </label>
                  <input
                    type="text"
                    value={modalItem.item.personResponsible}
                    onChange={(e) =>
                      setModalItem({
                        ...modalItem,
                        item: { ...modalItem.item, personResponsible: e.target.value },
                      })
                    }
                    placeholder="e.g. SK Officials and KK Members"
                    className="w-full px-3.5 py-2 text-xs font-semibold bg-zinc-50 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C89311]"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-zinc-50 border-t border-zinc-200 p-4 px-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setModalItem(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-600 hover:text-zinc-900"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModalItem}
                  className="px-5 py-2.5 bg-[#0C1E36] hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{modalItem.isNew ? "Save & Insert PPA" : "Save Changes"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        title={`ABYIP CY ${doc.calendarYear} - Barangay ${doc.barangayName}`}
        subtitle="Annual Barangay Youth Investment Program"
        documentType="ABYIP"
        pageElementsSelector=".abyip-page-break"
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
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
