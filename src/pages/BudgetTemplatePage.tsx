import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  Printer, 
  Download, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  AlertTriangle, 
  Sparkles,
  Settings,
  Send,
  Loader2,
  FileText,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  Upload,
  Edit3,
  Eye,
  Check,
  ChevronDown,
  X
} from "lucide-react";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { exportOfficialLandscapePdf } from "../lib/pdfExport";
import { PrintPreviewModal } from "../components/PrintPreviewModal";
import { useAuth } from "../components/auth/AuthProvider";
import { 
  BudgetDocument, 
  BudgetLineItem, 
  BudgetSubcategory, 
  BudgetYdepProgram 
} from "../types";
import { 
  createDefaultBudgetDocument, 
  loadBudgetDocument, 
  saveBudgetDocument, 
  resetBudgetToDefault, 
  calculateBudgetCalculations,
  DEFAULT_BUDGET_YEAR
} from "../lib/budgetStore";
import { 
  MUNICIPAL_BARANGAYS_40, 
  saveDocumentSubmission, 
  autoArchivePreviousDocument, 
  getBarangayRecords 
} from "../lib/barangayStore";

/**
 * Greedily packs Annual Budget YDEP programs into landscape A4 sheets.
 * Completely fills each page before overflowing to a continuation sheet.
 */
function paginateBudgetYdepPrograms(programs: BudgetYdepProgram[]): BudgetYdepProgram[][] {
  if (!programs || programs.length === 0) return [[]];

  const getProgramRowCount = (prog: BudgetYdepProgram): number => {
    let count = 2; // Category Title row + Category Subtotal row
    (prog.subcategories || []).forEach((sub) => {
      if (sub.label) count += 1;
      count += (sub.items || []).length;
    });
    return count;
  };

  const totalAllRows = programs.reduce((sum, p) => sum + getProgramRowCount(p), 0);

  // If all programs together with Grand Totals (3 rows) and Signatures (~95px) fit on 1 single sheet:
  const MAX_ROWS_SINGLE_SHEET_WITH_SIGS = 17;
  if (totalAllRows <= MAX_ROWS_SINGLE_SHEET_WITH_SIGS) {
    return [programs];
  }

  // Middle sheets (no signatures, no grand totals) can hold ~22 rows.
  // Final sheet needs space for Grand Totals (3 rows) and Signatures (~95px), so ~16 rows.
  const MAX_ROWS_MIDDLE_SHEET = 22;
  const MAX_ROWS_FINAL_SHEET = 16;

  const chunks: BudgetYdepProgram[][] = [];
  let currentChunk: BudgetYdepProgram[] = [];
  let currentRows = 0;

  for (let i = 0; i < programs.length; i++) {
    const prog = programs[i];
    const pRows = getProgramRowCount(prog);

    const remainingPrograms = programs.slice(i);
    const remainingRows = remainingPrograms.reduce((sum, p) => sum + getProgramRowCount(p), 0);

    // If all remaining programs (including this one) fit comfortably on the final sheet with signatures:
    if (currentChunk.length > 0 && remainingRows <= MAX_ROWS_FINAL_SHEET) {
      chunks.push(currentChunk);
      currentChunk = [prog];
      currentRows = pRows;
      continue;
    }

    if (currentChunk.length > 0 && currentRows + pRows > MAX_ROWS_MIDDLE_SHEET) {
      chunks.push(currentChunk);
      currentChunk = [prog];
      currentRows = pRows;
    } else {
      currentChunk.push(prog);
      currentRows += pRows;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export function BudgetTemplatePage() {
  const navigate = useNavigate();
  const { role, user, activeBarangay } = useAuth();

  // Selected Barangay
  const initialBarangay = user?.barangayName || activeBarangay || "Kapatagan";
  const [selectedBarangay, setSelectedBarangay] = useState<string>(initialBarangay);

  // Document state
  const [doc, setDoc] = useState<BudgetDocument>(() => 
    loadBudgetDocument(initialBarangay, user?.displayName, undefined)
  );

  // Edit / View mode toggle
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // AI Compliance state
  const [isScanning, setIsScanning] = useState(false);
  const [complianceReport, setComplianceReport] = useState<any | null>(null);
  const [isComplianceOpen, setIsComplianceOpen] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // File upload input refs for logos
  const leftLogoInputRef = useRef<HTMLInputElement>(null);
  const rightLogoInputRef = useRef<HTMLInputElement>(null);

  // Load document when barangay changes
  useEffect(() => {
    const loaded = loadBudgetDocument(selectedBarangay, user?.displayName, undefined);
    setDoc(loaded);
  }, [selectedBarangay, user?.displayName]);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Calculations
  const calc = calculateBudgetCalculations(doc);

  // Save Progress
  const handleSave = () => {
    try {
      saveBudgetDocument(doc);
      showToast(`Annual Budget saved successfully for Barangay ${doc.barangayName}!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save budget", "error");
    }
  };

  // Reset to default
  const handleReset = () => {
    if (window.confirm("Restore official sample Annual Budget format? This will reload the standard allocations matching the reference PDF for Barangay Kapatagan.")) {
      const fresh = resetBudgetToDefault(selectedBarangay, user?.displayName, undefined);
      setDoc(fresh);
      showToast("Restored official standard budget template.", "info");
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
      setDoc(prev => ({
        ...prev,
        [position === "left" ? "leftLogoUrl" : "rightLogoUrl"]: result
      }));
      showToast(`${position === "left" ? "Barangay Seal" : "SK Logo"} updated! Click Save to keep changes.`, "success");
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = (position: "left" | "right") => {
    setDoc(prev => ({
      ...prev,
      [position === "left" ? "leftLogoUrl" : "rightLogoUrl"]: undefined
    }));
    showToast(`${position === "left" ? "Barangay Seal" : "SK Logo"} reset to default emblem.`, "info");
  };

  // Item modifications
  const handlePSChange = (id: string, field: "name" | "amount", value: any) => {
    setDoc(prev => ({
      ...prev,
      gaPersonalServices: prev.gaPersonalServices.map(item => 
        item.id === id ? { ...item, [field]: field === "amount" ? Number(value) || 0 : value } : item
      )
    }));
  };

  const handleAddPSItem = () => {
    const newItem: BudgetLineItem = {
      id: `ps-${Date.now()}`,
      name: "New Personal Service Item",
      amount: 0
    };
    setDoc(prev => ({
      ...prev,
      gaPersonalServices: [...prev.gaPersonalServices, newItem]
    }));
    showToast("Added new Personal Services line item.", "info");
  };

  const handleDeletePSItem = (id: string) => {
    setDoc(prev => ({
      ...prev,
      gaPersonalServices: prev.gaPersonalServices.filter(item => item.id !== id)
    }));
  };

  const handleMOOEChange = (id: string, field: "name" | "amount", value: any) => {
    setDoc(prev => ({
      ...prev,
      gaMOOE: prev.gaMOOE.map(item => 
        item.id === id ? { ...item, [field]: field === "amount" ? Number(value) || 0 : value } : item
      )
    }));
  };

  const handleAddMOOEItem = () => {
    const newItem: BudgetLineItem = {
      id: `mooe-${Date.now()}`,
      name: "New Operating Expense Item",
      amount: 0
    };
    setDoc(prev => ({
      ...prev,
      gaMOOE: [...prev.gaMOOE, newItem]
    }));
    showToast("Added new MOOE line item.", "info");
  };

  const handleDeleteMOOEItem = (id: string) => {
    setDoc(prev => ({
      ...prev,
      gaMOOE: prev.gaMOOE.filter(item => item.id !== id)
    }));
  };

  // YDEP Modifications
  const handleYdepItemChange = (progId: string, subId: string, itemId: string, field: "name" | "amount", value: any) => {
    setDoc(prev => ({
      ...prev,
      ydepPrograms: prev.ydepPrograms.map(p => {
        if (p.id !== progId) return p;
        return {
          ...p,
          subcategories: p.subcategories.map(s => {
            if (s.id !== subId) return s;
            return {
              ...s,
              items: s.items.map(itm => 
                itm.id === itemId ? { ...itm, [field]: field === "amount" ? Number(value) || 0 : value } : itm
              )
            };
          })
        };
      })
    }));
  };

  const handleAddYdepItem = (progId: string, subId: string) => {
    const newItem: BudgetLineItem = {
      id: `ydep-item-${Date.now()}`,
      name: "New Activity / Expense Item",
      amount: 0
    };
    setDoc(prev => ({
      ...prev,
      ydepPrograms: prev.ydepPrograms.map(p => {
        if (p.id !== progId) return p;
        return {
          ...p,
          subcategories: p.subcategories.map(s => {
            if (s.id !== subId) return s;
            return {
              ...s,
              items: [...s.items, newItem]
            };
          })
        };
      })
    }));
  };

  const handleDeleteYdepItem = (progId: string, subId: string, itemId: string) => {
    setDoc(prev => ({
      ...prev,
      ydepPrograms: prev.ydepPrograms.map(p => {
        if (p.id !== progId) return p;
        return {
          ...p,
          subcategories: p.subcategories.map(s => {
            if (s.id !== subId) return s;
            return {
              ...s,
              items: s.items.filter(itm => itm.id !== itemId)
            };
          })
        };
      })
    }));
  };

  const handleAddYdepSubcategory = (progId: string) => {
    const newSub: BudgetSubcategory = {
      id: `sub-${Date.now()}`,
      label: "*NEW PROGRAM ACTIVITY",
      items: [
        { id: `item-${Date.now()}`, name: "Activity Expense", amount: 0 }
      ]
    };
    setDoc(prev => ({
      ...prev,
      ydepPrograms: prev.ydepPrograms.map(p => 
        p.id === progId ? { ...p, subcategories: [...p.subcategories, newSub] } : p
      )
    }));
  };

  // Landscape PDF Export
  const handleExportPdf = async () => {
    if (isExportingPdf) return;
    setIsExportingPdf(true);
    showToast("Generating official landscape PDF, please wait...", "info");

    const wasEditing = isEditing;
    if (wasEditing) {
      setIsEditing(false);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    try {
      const pageElements = document.querySelectorAll<HTMLElement>(".budget-page-break");
      if (!pageElements || pageElements.length === 0) {
        throw new Error("No document pages found to export");
      }

      const fileName = `Annual-Budget-${doc.calendarYear}-Barangay-${doc.barangayName.replace(/\s+/g, "_")}.pdf`;
      await exportOfficialLandscapePdf(Array.from(pageElements), {
        filename: fileName,
        marginMm: 8,
        scale: 2,
        windowWidth: 1150,
      });

      showToast(`Annual Budget PDF exported successfully as "${fileName}"!`, "success");
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

  // Compile full text for AI auditor
  const compileBudgetText = () => {
    let text = `SANGGUNIANG KABATAAN ANNUAL BUDGET AUDIT\n`;
    text += `Province: ${doc.province}\nMunicipality: ${doc.municipality}\nBarangay: ${doc.barangayName}\nCalendar Year: ${doc.calendarYear}\n\n`;
    text += `Beginning Balance: PHP ${calc.beginningBalance.toFixed(2)}\n`;
    text += `Ten Percent Allocation: PHP ${calc.tenPercentFund.toFixed(2)}\n`;
    text += `Total Funds Available: PHP ${calc.totalFundsAvailable.toFixed(2)}\n\n`;
    text += `General Administration (PS): PHP ${calc.totalPS.toFixed(2)}\n`;
    text += `General Administration (MOOE): PHP ${calc.totalMOOE.toFixed(2)}\n`;
    text += `Total General Administration: PHP ${calc.totalGeneralAdministration.toFixed(2)}\n\n`;
    text += `SK YDEP Programs Total: PHP ${calc.totalYDEP.toFixed(2)}\n`;
    text += `Total Expenditures: PHP ${calc.totalExpenditures.toFixed(2)}\n`;
    text += `Net Ending Balance: PHP ${calc.endingBalance.toFixed(2)}\n`;
    return text;
  };

  // Run AI Compliance Audit
  const handleAICanCheck = async () => {
    setIsScanning(true);
    setComplianceReport(null);
    setIsComplianceOpen(true);
    try {
      const compiledContent = compileBudgetText();
      const res = await fetch("/api/analyze-compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentType: "budget",
          content: compiledContent
        })
      });
      if (!res.ok) throw new Error("Auditor endpoint rejected scan.");
      const data = await res.json();
      setComplianceReport(data);
      showToast("AI Compliance Audit completed successfully!", "success");
    } catch (err: any) {
      console.error(err);
      // Fallback statutory validation
      const isBalanced = Math.abs(calc.endingBalance) < 0.01;
      const isWithinFunds = calc.totalExpenditures <= calc.totalFundsAvailable;
      setComplianceReport({
        status: isBalanced ? "Compliant" : isWithinFunds ? "Partially Compliant" : "Non-Compliant",
        score: isBalanced ? 98 : isWithinFunds ? 85 : 60,
        violations: isBalanced ? [] : [
          {
            section: "Statutory Budget Balancing (DBM/COA)",
            violation: calc.endingBalance < 0 
              ? `Deficit of ₱${Math.abs(calc.endingBalance).toLocaleString()} detected. Expenditures exceed funds available.`
              : `Unallocated surplus of ₱${calc.endingBalance.toLocaleString()} remaining.`,
            suggestion: "Rebalance expenditures so that Total Expenditures exactly equals Total Funds Available."
          }
        ],
        strengths: [
          "Appropriate division between General Administration and SK YDEP",
          "Includes required Personal Services and MOOE items",
          "Specific expected results and performance indicators defined"
        ]
      });
      showToast("Rule-based Statutory Audit generated.", "info");
    } finally {
      setIsScanning(false);
    }
  };

  // Submit to LYDO / Chairman
  const handleSubmitToChairman = async () => {
    setIsSubmitting(true);
    try {
      const budgetAmount = calc.totalExpenditures;
      const targetBarangay = doc.barangayName;

      // Auto archive previous
      const prevRecords = getBarangayRecords(targetBarangay).filter(r => r.docType === "Annual Budget" && r.yearOrPeriod !== doc.calendarYear);
      prevRecords.forEach(prev => {
        autoArchivePreviousDocument({
          barangayName: targetBarangay,
          docType: "Annual Budget",
          previousYearOrPeriod: prev.yearOrPeriod,
          title: prev.title,
          totalBudget: prev.totalBudget,
          remarks: `Archived upon submission of Annual Budget for CY ${doc.calendarYear}.`
        });
      });

      // Submit
      saveDocumentSubmission({
        barangayName: targetBarangay,
        docCode: "ANNUAL-BUDGET",
        docType: "Annual Budget",
        title: `Annual Youth Budget CY ${doc.calendarYear} - Barangay ${targetBarangay}`,
        yearOrPeriod: doc.calendarYear,
        submittedBy: `${user?.displayName || doc.preparedByName} (${role || "Treasurer"})`,
        officerRole: (role as any) || "Treasurer",
        totalBudget: budgetAmount,
        contentSnapshot: doc
      });

      // Update local status
      setDoc(prev => ({ ...prev, status: "Pending Review" }));
      saveBudgetDocument({ ...doc, status: "Pending Review" });
      localStorage.setItem("skompas_status_budget", "submitted");

      setIsSubmitModalOpen(false);
      showToast("Annual Budget submitted successfully for formal review!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Submission failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => {
    return `₱${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F5F7] text-zinc-900 pb-20 font-sans print:bg-white print:p-0 print:pb-0">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-white ${
              toastMessage.type === "success" ? "bg-emerald-600" :
              toastMessage.type === "error" ? "bg-rose-600" : "bg-[#0C1E36]"
            }`}
          >
            {toastMessage.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

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

      {/* STICKY TOP CONTROL HEADER */}
      <div className="bg-white border-b border-zinc-200 sticky top-0 z-40 shadow-xs print:hidden">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="p-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                  Statutory Tool
                </span>
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                  RA 10742 / DBM / COA Standard
                </span>
              </div>
              <h1 className="text-base font-black text-[#0C1E36] tracking-tight">
                SK Annual Budget Template (CY {doc.calendarYear})
              </h1>
            </div>
          </div>

          {/* Center: Barangay Selector */}
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5">
            <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Barangay:</span>
            <select
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              className="bg-transparent text-xs font-black text-[#0C1E36] focus:outline-none cursor-pointer"
            >
              {MUNICIPAL_BARANGAYS_40.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* View/Edit Toggle */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                isEditing
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
              }`}
            >
              {isEditing ? (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Official View</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Mode</span>
                </>
              )}
            </button>

            {/* AI Compliance Check */}
            <button
              onClick={handleAICanCheck}
              disabled={isScanning}
              className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:brightness-105 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isScanning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              )}
              <span>AI Audit</span>
            </button>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors cursor-pointer"
              title="Reset to Official Reference Format"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Keep Progress / Save */}
            <button
              onClick={handleSave}
              className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Progress</span>
            </button>

            {/* Print Preview Button */}
            <button
              onClick={() => {
                if (isEditing) setIsEditing(false);
                setIsPrintPreviewOpen(true);
              }}
              className="px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/40 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Preview Annual Budget exactly as rendered on A4 paper"
            >
              <Eye className="w-3.5 h-3.5 text-amber-400" />
              <span>Print Preview</span>
            </button>

            {/* Native Print */}
            <button
              onClick={() => {
                if (isEditing) setIsEditing(false);
                setTimeout(() => window.print(), 100);
              }}
              className="p-2 text-zinc-700 hover:bg-zinc-100 rounded-xl border border-zinc-200 transition-colors cursor-pointer"
              title="Print Document"
            >
              <Printer className="w-4 h-4 text-zinc-700" />
            </button>

            {/* Landscape PDF Export */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[#0C1E36] hover:bg-[#C89311] text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExportingPdf ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Export Landscape PDF</span>
            </button>

            {/* Submit to Chairman */}
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-blue-700 hover:bg-blue-800 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit Draft</span>
            </button>
          </div>

        </div>
      </div>

      {/* EDIT MODE NOTICE BANNER */}
      {isEditing && (
        <div className="bg-amber-500 text-white text-[11px] font-black uppercase tracking-wider py-2 px-4 text-center print:hidden flex items-center justify-center gap-2 shadow-inner">
          <Edit3 className="w-3.5 h-3.5" />
          <span>Edit Mode Active: Click any field, amount, expected outcome, or logo to modify. Click "Save Progress" when done.</span>
        </div>
      )}

      {/* STATUTORY SUMMARY BAR */}
      <div className="max-w-[1150px] mx-auto px-4 mt-6 print:hidden">
        <div className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="border-r border-zinc-100 pr-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Total Funds Available</span>
            <div className="text-base font-black text-[#0C1E36]">{formatCurrency(calc.totalFundsAvailable)}</div>
            <span className="text-[8.5px] text-zinc-500">10% GF: {formatCurrency(calc.tenPercentFund)}</span>
          </div>

          <div className="border-r border-zinc-100 pr-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Gen. Administration</span>
            <div className="text-base font-black text-zinc-800">{formatCurrency(calc.totalGeneralAdministration)}</div>
            <span className="text-[8.5px] text-zinc-500">PS: {formatCurrency(calc.totalPS)} | MOOE: {formatCurrency(calc.totalMOOE)}</span>
          </div>

          <div className="border-r border-zinc-100 pr-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">SK YDEP Programs</span>
            <div className="text-base font-black text-amber-700">{formatCurrency(calc.totalYDEP)}</div>
            <span className="text-[8.5px] text-zinc-500">Youth development & empowerment</span>
          </div>

          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-zinc-400 block">Ending Net Balance</span>
            <div className={`text-base font-black ${
              calc.endingBalance === 0 ? "text-emerald-600" : calc.endingBalance < 0 ? "text-rose-600" : "text-blue-600"
            }`}>
              {calc.endingBalance === 0 ? "₱ - (Balanced)" : formatCurrency(calc.endingBalance)}
            </div>
            <span className="text-[8.5px] text-zinc-500">
              {calc.endingBalance === 0 ? "✅ 100% Balanced" : calc.endingBalance < 0 ? "⚠️ Deficit" : "ℹ️ Surplus remaining"}
            </span>
          </div>
        </div>
      </div>

      {/* DOCUMENT SHEETS CONTAINER */}
      <div className="max-w-[1150px] mx-auto px-4 mt-6 space-y-12 print:space-y-0 print:px-0 print:mt-0">

        {/* ========================================================= */}
        {/* PAGE 1: RECEIPTS & GENERAL ADMINISTRATION PROGRAM         */}
        {/* ========================================================= */}
        <div className="budget-page-break max-w-[1122px] mx-auto bg-white border border-zinc-300 shadow-xl rounded-2xl p-6 sm:px-8 sm:py-5 min-h-[760px] flex flex-col justify-between print:border-none print:shadow-none print:rounded-none print:p-0">
          
          <div>
            {/* HEADER SECTION (Page 1) */}
            <div className="pb-4">
              <div className="flex items-center justify-between gap-4">
                
                {/* Left Circular Emblem: Barangay Seal */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-20 h-20 rounded-full border-2 border-blue-900/80 bg-white p-1 flex items-center justify-center shadow-sm shrink-0 relative group overflow-hidden">
                    {doc.leftLogoUrl ? (
                      <img src={doc.leftLogoUrl} alt="Barangay Seal" className="w-full h-full object-contain rounded-full" />
                    ) : (
                      <div className="w-full h-full rounded-full border border-amber-500 bg-amber-50 flex flex-col items-center justify-center text-center p-1 text-zinc-900">
                        <span className="text-[7px] font-black uppercase text-blue-950 leading-tight">
                          BARANGAY
                        </span>
                        <span className="text-[7.5px] font-black uppercase text-amber-700 leading-tight">
                          {doc.barangayName.toUpperCase()}
                        </span>
                        <div className="text-emerald-700 font-black text-sm my-0.2">🌴</div>
                        <span className="text-[6px] font-bold uppercase text-zinc-600 leading-none">
                          LAAK, DAVAO DE ORO
                        </span>
                      </div>
                    )}

                    {isEditing && (
                      <div 
                        onClick={() => leftLogoInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity rounded-full p-1 print:hidden"
                        title="Upload Barangay Seal"
                      >
                        <Upload className="w-3.5 h-3.5 mb-0.5 text-amber-300" />
                        <span className="text-[6.5px] font-black uppercase">Change</span>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-1 print:hidden">
                      <button
                        onClick={() => leftLogoInputRef.current?.click()}
                        className="text-[7.5px] font-bold text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Upload className="w-2 h-2" /> Upload
                      </button>
                      {doc.leftLogoUrl && (
                        <button
                          onClick={() => removeLogo("left")}
                          className="text-[7.5px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Center Republic Header Texts */}
                <div className="text-center space-y-0.5 flex-1">
                  <p className="text-[10px] font-semibold tracking-wider text-zinc-800 uppercase leading-tight">
                    Republic of the Philippines
                  </p>
                  <p className="text-[10px] font-semibold tracking-wider text-zinc-800 uppercase leading-tight">
                    Province of Davao de Oro
                  </p>
                  <p className="text-[10px] font-semibold tracking-wider text-zinc-800 uppercase leading-tight">
                    Municipality of Laak
                  </p>
                  <p className="text-[11px] font-black tracking-wide text-zinc-950 uppercase pt-0.5 leading-tight">
                    Barangay {doc.barangayName.toUpperCase()}
                  </p>
                  <h2 className="text-xs font-black tracking-wider text-zinc-950 uppercase pt-0.5 leading-tight">
                    OFFICE OF THE SANGGUNIANG KABATAAN
                  </h2>
                  <h3 className="text-[11px] font-black tracking-widest text-zinc-900 uppercase leading-tight">
                    CALENDAR YEAR {doc.calendarYear}
                  </h3>
                </div>

                {/* Right Circular Emblem: Sangguniang Kabataan Logo */}
                <div className="flex flex-col items-center gap-1 shrink-0">
                  <div className="w-20 h-20 rounded-full border-2 border-amber-500/80 bg-white p-1 flex items-center justify-center shadow-sm shrink-0 relative group overflow-hidden">
                    {doc.rightLogoUrl ? (
                      <img src={doc.rightLogoUrl} alt="SK Emblem" className="w-full h-full object-contain rounded-full" />
                    ) : (
                      <div className="w-full h-full rounded-full border border-blue-900 bg-blue-950 flex flex-col items-center justify-center text-white text-center p-1 relative overflow-hidden">
                        <span className="text-[7px] font-black tracking-tighter uppercase text-amber-300 leading-tight">
                          SANGGUNIANG KABATAAN
                        </span>
                        <div className="text-amber-400 font-black text-base leading-none my-0.2">★</div>
                        <span className="text-[6px] font-bold uppercase tracking-wider text-slate-200 leading-none">
                          BARANGAY {doc.barangayName.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {isEditing && (
                      <div 
                        onClick={() => rightLogoInputRef.current?.click()}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity rounded-full p-1 print:hidden"
                        title="Upload SK Emblem"
                      >
                        <Upload className="w-3.5 h-3.5 mb-0.5 text-amber-300" />
                        <span className="text-[6.5px] font-black uppercase">Change</span>
                      </div>
                    )}
                  </div>

                  {isEditing && (
                    <div className="flex items-center gap-1 print:hidden">
                      <button
                        onClick={() => rightLogoInputRef.current?.click()}
                        className="text-[7.5px] font-bold text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
                      >
                        <Upload className="w-2 h-2" /> Upload
                      </button>
                      {doc.rightLogoUrl && (
                        <button
                          onClick={() => removeLogo("right")}
                          className="text-[7.5px] font-bold text-rose-600 hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* PAGE 1 TABLE */}
            <table className="w-full border-collapse border border-black text-[9.5px] leading-tight text-black table-fixed">
              <colgroup>
                <col style={{ width: "44%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "17%" }} />
                <col style={{ width: "17%" }} />
              </colgroup>
              
              <thead>
                <tr className="border-b border-black font-black uppercase text-center bg-white">
                  <th className="p-2 border-r border-black font-black">OBJECT OF EXPENDITURES</th>
                  <th className="p-2 border-r border-black font-black">BUDGET YEAR EXPENDITURES</th>
                  <th className="p-2 border-r border-black font-black">EXPECTED RESULTS</th>
                  <th className="p-2 font-black">PERFORMANCE INDICATOR</th>
                </tr>
              </thead>

              <tbody>
                {/* PART I. BEGINNING CASH BALANCE */}
                <tr className="border-b border-black">
                  <td className="p-1.5 font-black uppercase border-r border-black">
                    PART I. BEGINNING CASH BALANCE
                  </td>
                  <td className="p-1.5 border-r border-black text-center font-bold">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={doc.beginningBalance}
                        onChange={(e) => setDoc({ ...doc, beginningBalance: Number(e.target.value) || 0 })}
                        className="w-28 text-center border-b border-zinc-400 text-[9.5px] font-bold py-0.5"
                      />
                    ) : (
                      doc.beginningBalance > 0 ? formatCurrency(doc.beginningBalance) : ""
                    )}
                  </td>
                  <td className="p-1.5 border-r border-black"></td>
                  <td className="p-1.5"></td>
                </tr>

                {/* PART II. RECEIPT PROGRAM */}
                <tr className="border-b border-black">
                  <td className="p-1.5 font-black uppercase border-r border-black">
                    PART II. RECEIPT PROGRAM
                  </td>
                  <td className="p-1.5 border-r border-black"></td>
                  <td className="p-1.5 border-r border-black"></td>
                  <td className="p-1.5"></td>
                </tr>

                {/* TEN PERCENT (10%) OF GENERAL FUND OF THE BARANGAY */}
                <tr className="border-b border-black">
                  <td className="p-1.5 uppercase font-medium border-r border-black pl-4">
                    TEN PERCENT (10%) OF GENERAL FUND OF THE BARANGAY
                  </td>
                  <td className="p-1.5 border-r border-black text-center font-bold">
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={doc.tenPercentFund}
                        onChange={(e) => setDoc({ ...doc, tenPercentFund: Number(e.target.value) || 0 })}
                        className="w-28 text-center border-b border-zinc-400 text-[9.5px] font-bold py-0.5"
                      />
                    ) : (
                      formatCurrency(doc.tenPercentFund)
                    )}
                  </td>
                  <td className="p-1.5 border-r border-black"></td>
                  <td className="p-1.5"></td>
                </tr>

                {/* TOTAL ESTIMATED FUNDS AVAILABLE FOR APPROPRIATION */}
                <tr className="border-b border-black font-black uppercase">
                  <td className="p-1.5 border-r border-black">
                    TOTAL ESTIMATED FUNDS AVAILABLE FOR APPROPRIATION
                  </td>
                  <td className="p-1.5 border-r border-black text-center">
                    {formatCurrency(calc.totalFundsAvailable)}
                  </td>
                  <td className="p-1.5 border-r border-black"></td>
                  <td className="p-1.5"></td>
                </tr>

                {/* PART III. EXPENDITURE PROGRAM */}
                <tr className="border-b border-black">
                  <td className="p-1.5 font-black uppercase border-r border-black">
                    PART III. EXPENDITURE PROGRAM
                  </td>
                  <td className="p-1.5 border-r border-black"></td>
                  <td className="p-1.5 border-r border-black"></td>
                  <td className="p-1.5"></td>
                </tr>

                {/* GENERAL ADMINISTRATION PROGRAM */}
                <tr className="border-b border-black">
                  <td className="p-1.5 font-black uppercase border-r border-black pl-4">
                    GENERAL ADMINISTRATION PROGRAM
                  </td>
                  <td className="p-1.5 border-r border-black"></td>
                  <td className="p-1.5 border-r border-black"></td>
                  <td className="p-1.5"></td>
                </tr>

                {/* * PERSONAL SERVICES (PS) Header */}
                <tr className="border-b border-black">
                  <td className="p-1.5 font-black border-r border-black pl-4">
                    <div className="flex items-center justify-between">
                      <span>* PERSONAL SERVICES (PS)</span>
                      {isEditing && (
                        <button
                          onClick={handleAddPSItem}
                          className="text-[7.5px] font-bold text-blue-700 hover:underline flex items-center gap-0.5 print:hidden cursor-pointer"
                        >
                          <Plus className="w-2 h-2" /> Add PS
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-1.5 border-r border-black"></td>
                  
                  {/* Spanning Expected Results for PS */}
                  <td rowSpan={doc.gaPersonalServices.length + 2} className="p-1.5 border-r border-black text-center align-middle">
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={doc.gaExpected}
                        onChange={(e) => setDoc({ ...doc, gaExpected: e.target.value })}
                        className="w-full text-center border p-1 text-[8.5px] rounded resize-none"
                      />
                    ) : (
                      <span>{doc.gaExpected}</span>
                    )}
                  </td>

                  {/* Spanning Performance Indicator for General Administration */}
                  <td rowSpan={doc.gaPersonalServices.length + 2} className="p-1.5 text-center align-middle">
                    {isEditing ? (
                      <textarea
                        rows={3}
                        value={doc.gaIndicator}
                        onChange={(e) => setDoc({ ...doc, gaIndicator: e.target.value })}
                        className="w-full text-center border p-1 text-[8.5px] rounded resize-none"
                      />
                    ) : (
                      <span>{doc.gaIndicator}</span>
                    )}
                  </td>
                </tr>

                {/* PS Items Rows */}
                {doc.gaPersonalServices.map((item) => (
                  <tr key={item.id} className="border-b border-black">
                    <td className="p-1 border-r border-black pl-6">
                      <div className="flex items-center justify-between">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handlePSChange(item.id, "name", e.target.value)}
                            className="w-full border-b border-zinc-300 py-0.5 text-[9.5px] focus:outline-none"
                          />
                        ) : (
                          <span>{item.name}</span>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => handleDeletePSItem(item.id)}
                            className="text-rose-500 hover:text-rose-700 ml-2 print:hidden cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-1 border-r border-black text-center font-medium">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) => handlePSChange(item.id, "amount", e.target.value)}
                          className="w-24 text-center border-b border-zinc-300 text-[9.5px] font-bold py-0.5"
                        />
                      ) : (
                        formatCurrency(item.amount)
                      )}
                    </td>
                  </tr>
                ))}

                {/* TOTAL PERSONAL SERVICES */}
                <tr className="border-b border-black font-bold">
                  <td className="p-1.5 uppercase border-r border-black pl-4">
                    TOTAL PERSONAL SERVICES
                  </td>
                  <td className="p-1.5 border-r border-black text-center font-bold">
                    {formatCurrency(calc.totalPS)}
                  </td>
                </tr>

                {/* * MAINTENANCE AND OTHER OPERATING SERVICES Header */}
                <tr className="border-b border-black">
                  <td className="p-1.5 font-black border-r border-black pl-4">
                    <div className="flex items-center justify-between">
                      <span>* MAINTENANCE AND OTHER OPERATING SERVICES</span>
                      {isEditing && (
                        <button
                          onClick={handleAddMOOEItem}
                          className="text-[7.5px] font-bold text-blue-700 hover:underline flex items-center gap-0.5 print:hidden cursor-pointer"
                        >
                          <Plus className="w-2 h-2" /> Add MOOE
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="p-1.5 border-r border-black"></td>
                  <td rowSpan={doc.gaMOOE.length + 2} className="p-1.5 border-r border-black text-center align-middle"></td>
                  <td rowSpan={doc.gaMOOE.length + 2} className="p-1.5 text-center align-middle"></td>
                </tr>

                {/* MOOE Items Rows */}
                {doc.gaMOOE.map((item) => (
                  <tr key={item.id} className="border-b border-black">
                    <td className="p-1 border-r border-black pl-6">
                      <div className="flex items-center justify-between">
                        {isEditing ? (
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleMOOEChange(item.id, "name", e.target.value)}
                            className="w-full border-b border-zinc-300 py-0.5 text-[9.5px] focus:outline-none"
                          />
                        ) : (
                          <span>{item.name}</span>
                        )}
                        {isEditing && (
                          <button
                            onClick={() => handleDeleteMOOEItem(item.id)}
                            className="text-rose-500 hover:text-rose-700 ml-2 print:hidden cursor-pointer"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-1 border-r border-black text-center font-medium">
                      {isEditing ? (
                        <input
                          type="number"
                          step="0.01"
                          value={item.amount}
                          onChange={(e) => handleMOOEChange(item.id, "amount", e.target.value)}
                          className="w-24 text-center border-b border-zinc-300 text-[9.5px] font-bold py-0.5"
                        />
                      ) : (
                        formatCurrency(item.amount)
                      )}
                    </td>
                  </tr>
                ))}

                {/* TOTAL MAINTENANCE AND OTHER OPERATING EXPENSES */}
                <tr className="border-b border-black font-bold">
                  <td className="p-1.5 uppercase border-r border-black pl-4">
                    TOTAL MAINTENANCE AND OTHER OPERATING EXPENSES
                  </td>
                  <td className="p-1.5 border-r border-black text-center font-bold">
                    {formatCurrency(calc.totalMOOE)}
                  </td>
                </tr>

                {/* TOTAL GENERAL ADMINISTRATION PROGRAM */}
                <tr className="border-b border-black font-black uppercase bg-zinc-50/50">
                  <td className="p-2 border-r border-black pl-4">
                    TOTAL GENERAL ADMINISTRATION PROGRAM
                  </td>
                  <td className="p-2 border-r border-black text-center">
                    {formatCurrency(calc.totalGeneralAdministration)}
                  </td>
                  <td className="p-2 border-r border-black"></td>
                  <td className="p-2"></td>
                </tr>

              </tbody>
            </table>
          </div>

          <div className="pt-3 text-[9px] text-zinc-500 italic text-right print:text-zinc-600">
            Page 1 of {1 + paginateBudgetYdepPrograms(doc.ydepPrograms).length} — Office of the Sangguniang Kabataan Annual Budget (CY {doc.calendarYear})
          </div>

        </div>


        {/* ========================================================= */}
        {/* PAGES 2+: SK YDEP PROGRAMS & SIGNATURES                   */}
        {/* Paginated into clean Landscape A4 sheets to avoid cutoffs */}
        {/* ========================================================= */}
        {(() => {
          const ydepChunks = paginateBudgetYdepPrograms(doc.ydepPrograms);
          const totalPages = 1 + ydepChunks.length;

          return ydepChunks.map((chunk, chunkIdx) => {
            const isFirstYdepSheet = chunkIdx === 0;
            const isLastYdepSheet = chunkIdx === ydepChunks.length - 1;
            const pageNumber = chunkIdx + 2;

            return (
              <div 
                key={`budget-ydep-sheet-${chunkIdx + 1}`}
                id={`budget-page-${pageNumber}`}
                className="budget-page-break max-w-[1122px] mx-auto bg-white border border-zinc-300 shadow-xl rounded-2xl p-6 sm:px-8 sm:py-5 min-h-[760px] flex flex-col justify-between print:border-none print:shadow-none print:rounded-none print:p-0"
              >
                <div>
                  {/* HEADER SECTION (Repeats official layout on each sheet) */}
                  <div className="pb-4">
                    <div className="flex items-center justify-between gap-4">
                      
                      {/* Left Circular Emblem */}
                      <div className="w-20 h-20 rounded-full border-2 border-blue-900/80 bg-white p-1 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                        {doc.leftLogoUrl ? (
                          <img src={doc.leftLogoUrl} alt="Barangay Seal" className="w-full h-full object-contain rounded-full" />
                        ) : (
                          <div className="w-full h-full rounded-full border border-amber-500 bg-amber-50 flex flex-col items-center justify-center text-center p-1 text-zinc-900">
                            <span className="text-[7px] font-black uppercase text-blue-950 leading-tight">BARANGAY</span>
                            <span className="text-[7.5px] font-black uppercase text-amber-700 leading-tight">{doc.barangayName.toUpperCase()}</span>
                            <div className="text-emerald-700 font-black text-sm my-0.2">🌴</div>
                            <span className="text-[6px] font-bold uppercase text-zinc-600 leading-none">LAAK, DAVAO DE ORO</span>
                          </div>
                        )}
                      </div>

                      {/* Center Texts */}
                      <div className="text-center space-y-0.5 flex-1">
                        <p className="text-[10px] font-semibold tracking-wider text-zinc-800 uppercase leading-tight">
                          Republic of the Philippines
                        </p>
                        <p className="text-[10px] font-semibold tracking-wider text-zinc-800 uppercase leading-tight">
                          Province of Davao de Oro
                        </p>
                        <p className="text-[10px] font-semibold tracking-wider text-zinc-800 uppercase leading-tight">
                          Municipality of Laak
                        </p>
                        <p className="text-[11px] font-black tracking-wide text-zinc-950 uppercase pt-0.5 leading-tight">
                          Barangay {doc.barangayName.toUpperCase()}
                        </p>
                        <h2 className="text-xs font-black tracking-wider text-zinc-950 uppercase pt-0.5 leading-tight">
                          OFFICE OF THE SANGGUNIANG KABATAAN
                        </h2>
                        <h3 className="text-[11px] font-black tracking-widest text-zinc-900 uppercase leading-tight">
                          CALENDAR YEAR {doc.calendarYear} {!isFirstYdepSheet && "(CONTINUATION)"}
                        </h3>
                      </div>

                      {/* Right Circular Emblem */}
                      <div className="w-20 h-20 rounded-full border-2 border-amber-500/80 bg-white p-1 flex items-center justify-center shadow-sm shrink-0 overflow-hidden">
                        {doc.rightLogoUrl ? (
                          <img src={doc.rightLogoUrl} alt="SK Emblem" className="w-full h-full object-contain rounded-full" />
                        ) : (
                          <div className="w-full h-full rounded-full border border-blue-900 bg-blue-950 flex flex-col items-center justify-center text-white text-center p-1 relative overflow-hidden">
                            <span className="text-[7px] font-black tracking-tighter uppercase text-amber-300 leading-tight">
                              SANGGUNIANG KABATAAN
                            </span>
                            <div className="text-amber-400 font-black text-base leading-none my-0.2">★</div>
                            <span className="text-[6px] font-bold uppercase tracking-wider text-slate-200 leading-none">
                              BARANGAY {doc.barangayName.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>

                  {/* YDEP TABLE */}
                  <table className="w-full border-collapse border border-black text-[9.5px] leading-tight text-black table-fixed">
                    <colgroup>
                      <col style={{ width: "44%" }} />
                      <col style={{ width: "22%" }} />
                      <col style={{ width: "17%" }} />
                      <col style={{ width: "17%" }} />
                    </colgroup>
                    
                    <thead>
                      <tr className="border-b border-black font-black uppercase text-center bg-white">
                        <th className="p-2 border-r border-black font-black">OBJECT OF EXPENDITURES</th>
                        <th className="p-2 border-r border-black font-black">BUDGET YEAR EXPENDITURES</th>
                        <th className="p-2 border-r border-black font-black">EXPECTED RESULTS</th>
                        <th className="p-2 font-black">PERFORMANCE INDICATOR</th>
                      </tr>
                    </thead>

                    <tbody>
                      {/* SK YOUTH DEVELOPMENT AND EMPOWERMENT PROGRAMS Header */}
                      <tr className="border-b border-black font-black uppercase bg-zinc-50/60">
                        <td className="p-1.5 border-r border-black">
                          SK YOUTH DEVELOPMENT AND EMPOWERMENT PROGRAMS {!isFirstYdepSheet && "(CONTINUATION)"}
                        </td>
                        <td className="p-1.5 border-r border-black"></td>
                        <td className="p-1.5 border-r border-black"></td>
                        <td className="p-1.5"></td>
                      </tr>

                      {/* YDEP CATEGORIES IN THIS CHUNK */}
                      {chunk.map((prog) => {
                        const progTotal = calc.ydepSubtotals[prog.id] || 0;
                        const totalSubRows = prog.subcategories.reduce(
                          (acc, sub) => acc + (sub.label ? 1 : 0) + sub.items.length,
                          0
                        );
                        const categoryTotalRowSpan = 1 + totalSubRows + 1;

                        return (
                          <React.Fragment key={prog.id}>
                            {/* Row 1: Category Name & Spanning Results/Indicators */}
                            <tr className="border-b border-black">
                              <td className="p-1 font-black uppercase border-r border-black pl-2">
                                <div className="flex items-center justify-between">
                                  <span>{prog.name}</span>
                                  {isEditing && (
                                    <button
                                      onClick={() => handleAddYdepSubcategory(prog.id)}
                                      className="text-[7px] font-bold text-blue-700 hover:underline flex items-center gap-0.5 print:hidden cursor-pointer"
                                    >
                                      <Plus className="w-1.5 h-1.5" /> Add Sub-PPA
                                    </button>
                                  )}
                                </div>
                              </td>
                              <td className="p-1 border-r border-black"></td>

                              {/* Spanning Expected Results for this Category */}
                              <td rowSpan={categoryTotalRowSpan} className="p-1.5 border-r border-black text-center align-middle">
                                {isEditing ? (
                                  <textarea
                                    rows={2}
                                    value={prog.expectedResults}
                                    onChange={(e) => setDoc({
                                      ...doc,
                                      ydepPrograms: doc.ydepPrograms.map(p => p.id === prog.id ? { ...p, expectedResults: e.target.value } : p)
                                    })}
                                    className="w-full text-center border p-1 text-[8px] rounded resize-none"
                                  />
                                ) : (
                                  <span className="text-[8.5px] leading-tight block">{prog.expectedResults}</span>
                                )}
                              </td>

                              {/* Spanning Performance Indicator for this Category */}
                              <td rowSpan={categoryTotalRowSpan} className="p-1.5 text-center align-middle">
                                {isEditing ? (
                                  <textarea
                                    rows={2}
                                    value={prog.performanceIndicator}
                                    onChange={(e) => setDoc({
                                      ...doc,
                                      ydepPrograms: doc.ydepPrograms.map(p => p.id === prog.id ? { ...p, performanceIndicator: e.target.value } : p)
                                    })}
                                    className="w-full text-center border p-1 text-[8px] rounded resize-none"
                                  />
                                ) : (
                                  <span className="text-[8.5px] leading-tight block">{prog.performanceIndicator}</span>
                                )}
                              </td>
                            </tr>

                            {/* Subcategories & Items */}
                            {prog.subcategories.map((sub) => (
                              <React.Fragment key={sub.id}>
                                {sub.label && (
                                  <tr className="border-b border-black/40">
                                    <td className="p-0.5 font-bold uppercase border-r border-black pl-4 text-[9px]">
                                      <div className="flex items-center justify-between">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={sub.label}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setDoc(prev => ({
                                                ...prev,
                                                ydepPrograms: prev.ydepPrograms.map(p => {
                                                  if (p.id !== prog.id) return p;
                                                  return {
                                                    ...p,
                                                    subcategories: p.subcategories.map(s => s.id === sub.id ? { ...s, label: val } : s)
                                                  };
                                                })
                                              }));
                                            }}
                                            className="w-full border-b border-zinc-300 py-0.5 text-[9px] font-bold focus:outline-none"
                                          />
                                        ) : (
                                          <span>{sub.label}</span>
                                        )}
                                        {isEditing && (
                                          <button
                                            onClick={() => handleAddYdepItem(prog.id, sub.id)}
                                            className="text-[7px] font-bold text-emerald-700 hover:underline flex items-center gap-0.5 print:hidden ml-2 cursor-pointer shrink-0"
                                          >
                                            <Plus className="w-1.5 h-1.5" /> Add Item
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-0.5 border-r border-black"></td>
                                  </tr>
                                )}

                                {sub.items.map((item) => (
                                  <tr key={item.id} className="border-b border-black/30">
                                    <td className="p-0.5 border-r border-black pl-6">
                                      <div className="flex items-center justify-between">
                                        {isEditing ? (
                                          <input
                                            type="text"
                                            value={item.name}
                                            onChange={(e) => handleYdepItemChange(prog.id, sub.id, item.id, "name", e.target.value)}
                                            className="w-full border-b border-zinc-300 py-0.5 text-[9px] focus:outline-none"
                                          />
                                        ) : (
                                          <span>{item.name.startsWith("•") || item.name.startsWith("*") ? item.name : `• ${item.name}`}</span>
                                        )}
                                        {isEditing && (
                                          <button
                                            onClick={() => handleDeleteYdepItem(prog.id, sub.id, item.id)}
                                            className="text-rose-500 hover:text-rose-700 ml-2 print:hidden cursor-pointer"
                                          >
                                            <Trash2 className="w-2 h-2" />
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                    <td className="p-0.5 border-r border-black text-center font-medium">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={item.amount}
                                          onChange={(e) => handleYdepItemChange(prog.id, sub.id, item.id, "amount", e.target.value)}
                                          className="w-24 text-center border-b border-zinc-300 text-[9px] font-bold py-0.5"
                                        />
                                      ) : (
                                        formatCurrency(item.amount)
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </React.Fragment>
                            ))}

                            {/* Program Category Total */}
                            <tr className="border-b border-black font-bold bg-zinc-50/30">
                              <td className="p-1 uppercase border-r border-black pl-4">
                                TOTAL {prog.name === "ACTIVE CITIZENSHIP" ? "ACTIVE CITIZENSHIP" : prog.name === "GOVERNANCE" ? "GOVERNANCE" : `FOR ${prog.name}`}
                              </td>
                              <td className="p-1 border-r border-black text-center font-bold">
                                {formatCurrency(progTotal)}
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}

                      {/* If LAST sheet, render Grand Totals & Ending Balance */}
                      {isLastYdepSheet ? (
                        <>
                          {/* TOTAL SK YDEP */}
                          <tr className="border-b border-black font-black uppercase bg-zinc-50">
                            <td className="p-1.5 border-r border-black">
                              TOTAL SANGGUNIANG KABATAAN YOUTH DEVELOPMENT AND EMPOWERMENT PROGRAMS, PLANS, AND ACTIVITIES (SK YDEP)
                            </td>
                            <td className="p-1.5 border-r border-black text-center">
                              {formatCurrency(calc.totalYDEP)}
                            </td>
                            <td className="p-1.5 border-r border-black"></td>
                            <td className="p-1.5"></td>
                          </tr>

                          {/* TOTAL EXPENDITURE PROGRAM */}
                          <tr className="border-b border-black font-black uppercase bg-zinc-100/70">
                            <td className="p-1.5 border-r border-black">
                              TOTAL EXPENDITURE PROGRAM
                            </td>
                            <td className="p-1.5 border-r border-black text-center">
                              {formatCurrency(calc.totalExpenditures)}
                            </td>
                            <td className="p-1.5 border-r border-black"></td>
                            <td className="p-1.5"></td>
                          </tr>

                          {/* PART IV. ENDING BALANCE */}
                          <tr className="border-b border-black font-black uppercase bg-white">
                            <td className="p-1.5 border-r border-black">
                              PART IV. ENDING BALANCE
                            </td>
                            <td className="p-1.5 border-r border-black text-center">
                              {calc.endingBalance === 0 ? "₱  -" : formatCurrency(calc.endingBalance)}
                            </td>
                            <td className="p-1.5 border-r border-black"></td>
                            <td className="p-1.5"></td>
                          </tr>
                        </>
                      ) : (
                        <tr className="border-b border-black font-bold text-zinc-700 bg-zinc-50/50">
                          <td colSpan={4} className="p-1.5 text-right uppercase tracking-wider italic text-[9px]">
                            Continued on next sheet [Page {pageNumber + 1} of {totalPages}] →
                          </td>
                        </tr>
                      )}

                    </tbody>
                  </table>

                  {/* SIGNATURES SECTION (Only on final sheet) */}
                  {isLastYdepSheet && (
                    <div className="p-3 pt-4 grid grid-cols-2 gap-8 text-center text-xs">
                      
                      {/* Prepared By (SK Treasurer) */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9.5px] font-bold text-zinc-700 uppercase tracking-wider mb-6">
                          Prepared By:
                        </span>
                        {isEditing ? (
                          <div className="w-full max-w-[260px] space-y-1">
                            <input
                              type="text"
                              value={doc.preparedByName}
                              onChange={(e) => setDoc({ ...doc, preparedByName: e.target.value })}
                              className="w-full text-center border-b border-black font-bold uppercase text-xs pb-0.5 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={doc.preparedByTitle}
                              onChange={(e) => setDoc({ ...doc, preparedByTitle: e.target.value })}
                              className="w-full text-center text-[9.5px] font-bold text-zinc-600 uppercase focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-zinc-950 uppercase tracking-wider border-b border-black pb-0.5 min-w-[220px]">
                              {doc.preparedByName}
                            </div>
                            <div className="text-[9.5px] font-black uppercase text-zinc-600 mt-0.5">
                              {doc.preparedByTitle}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* APPROVED BY (SK Chairperson) */}
                      <div className="flex flex-col items-center">
                        <span className="text-[9.5px] font-bold text-zinc-700 uppercase tracking-wider mb-6">
                          APPROVED BY:
                        </span>
                        {isEditing ? (
                          <div className="w-full max-w-[260px] space-y-1">
                            <input
                              type="text"
                              value={doc.approvedByName}
                              onChange={(e) => setDoc({ ...doc, approvedByName: e.target.value })}
                              className="w-full text-center border-b border-black font-bold uppercase text-xs pb-0.5 focus:outline-none"
                            />
                            <input
                              type="text"
                              value={doc.approvedByTitle}
                              onChange={(e) => setDoc({ ...doc, approvedByTitle: e.target.value })}
                              className="w-full text-center text-[9.5px] font-bold text-zinc-600 uppercase focus:outline-none"
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-zinc-950 uppercase tracking-wider border-b border-black pb-0.5 min-w-[220px]">
                              {doc.approvedByName}
                            </div>
                            <div className="text-[9.5px] font-black uppercase text-zinc-600 mt-0.5">
                              {doc.approvedByTitle}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}

                </div>

                <div className="pt-3 text-[9px] text-zinc-500 italic text-right print:text-zinc-600">
                  Page {pageNumber} of {totalPages} — Office of the Sangguniang Kabataan Annual Budget (CY {doc.calendarYear})
                </div>

              </div>
            );
          });
        })()}

      </div>

      {/* SUBMISSION CONFIRMATION MODAL */}
      <AnimatePresence>
        {isSubmitModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-zinc-200"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-black">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#0C1E36]">Submit Annual Youth Budget</h3>
                    <p className="text-[11px] text-zinc-500">Barangay {doc.barangayName} (CY {doc.calendarYear})</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-5 space-y-4 text-xs">
                <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Receipt Allocation (10% GF):</span>
                    <span className="font-black text-[#0C1E36]">{formatCurrency(calc.totalFundsAvailable)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">General Administration:</span>
                    <span className="font-bold text-zinc-800">{formatCurrency(calc.totalGeneralAdministration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 font-medium">Youth Programs (SK YDEP):</span>
                    <span className="font-bold text-zinc-800">{formatCurrency(calc.totalYDEP)}</span>
                  </div>
                  <div className="border-t border-zinc-200 pt-2 flex justify-between">
                    <span className="text-zinc-700 font-black">Total Expenditure Program:</span>
                    <span className="font-black text-blue-900">{formatCurrency(calc.totalExpenditures)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-700 font-black">Ending Net Balance:</span>
                    <span className={`font-black ${calc.endingBalance === 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {calc.endingBalance === 0 ? "₱ - (100% Balanced)" : formatCurrency(calc.endingBalance)}
                    </span>
                  </div>
                </div>

                <p className="text-zinc-600 leading-relaxed text-[11px]">
                  Submitting will transmit this Annual Budget to the <strong>LYDO / Chairman Review Queue</strong> for official statutory validation and compliance endorsement.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSubmitToChairman}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-[#0C1E36] hover:bg-[#C89311] text-white shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Confirm & Submit</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AI COMPLIANCE AUDIT DRAWER / MODAL */}
      <AnimatePresence>
        {isComplianceOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-zinc-200 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-zinc-100 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-[#0C1E36]">AI Statutory Compliance Audit</h3>
                    <p className="text-[11px] text-zinc-500">RA 10742 / DBM / COA Guidelines Check</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsComplianceOpen(false)}
                  className="p-1 text-zinc-400 hover:text-zinc-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 overflow-y-auto space-y-4 flex-1">
                {isScanning ? (
                  <div className="py-12 flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    <p className="text-xs font-black uppercase tracking-wider text-zinc-600">
                      Auditing budget items against legal statutes...
                    </p>
                  </div>
                ) : complianceReport ? (
                  <div className="space-y-4">
                    
                    {/* Score Bar */}
                    <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-600">Statutory Compliance Score</span>
                        <span className="text-sm font-black font-mono text-[#0C1E36]">{complianceReport.score || 95}/100</span>
                      </div>
                      <div className="w-full bg-zinc-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            (complianceReport.score || 95) >= 90 ? "bg-emerald-500" :
                            (complianceReport.score || 95) >= 70 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${complianceReport.score || 95}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 pt-1">
                        <span>Status: <strong className="text-zinc-800">{complianceReport.status || "Compliant"}</strong></span>
                        <span>Standard: <strong>DBM / NYC Guidelines</strong></span>
                      </div>
                    </div>

                    {/* Discrepancies */}
                    {complianceReport.violations && complianceReport.violations.length > 0 ? (
                      <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase text-rose-600 tracking-wider block">
                          Discovered Discrepancies / Recommendations:
                        </span>
                        {complianceReport.violations.map((v: any, idx: number) => (
                          <div key={idx} className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs space-y-1">
                            <div className="font-black text-rose-900">{v.section}</div>
                            <p className="text-zinc-700 text-[11px] leading-relaxed">{v.violation}</p>
                            {v.suggestion && (
                              <p className="text-zinc-600 text-[10.5px] italic bg-white p-2 rounded border border-rose-100 mt-1">
                                💡 {v.suggestion}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs font-bold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>All statutory tests passed! Budget expenditures conform with RA 10742 and DBM regulations.</span>
                      </div>
                    )}

                    {/* Strengths */}
                    {complianceReport.strengths && complianceReport.strengths.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider block">
                          Identified Merits:
                        </span>
                        <ul className="list-disc list-inside text-xs text-zinc-600 space-y-1 pl-1">
                          {complianceReport.strengths.map((str: string, sIdx: number) => (
                            <li key={sIdx}>{str}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                ) : null}
              </div>

              <div className="flex justify-end pt-3 border-t border-zinc-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsComplianceOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-[#0C1E36] text-white hover:bg-[#C89311] transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PRINT CSS STYLING */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm;
          }
          body {
            background-color: white !important;
            color: black !important;
            font-size: 10pt;
          }
          .budget-page-break {
            page-break-after: always !important;
            break-after: page !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          .budget-page-break:last-child {
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          /* Hide non-printable items */
          header, nav, footer, button, .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={isPrintPreviewOpen}
        onClose={() => setIsPrintPreviewOpen(false)}
        title={`Annual Budget CY ${doc.calendarYear} - Barangay ${doc.barangayName}`}
        subtitle="Sangguniang Kabataan Annual Budget Document"
        documentType="Annual Budget"
        pageElementsSelector=".budget-page-break"
        onExportPdf={handleExportPdf}
        isExportingPdf={isExportingPdf}
      />

    </div>
  );
}
