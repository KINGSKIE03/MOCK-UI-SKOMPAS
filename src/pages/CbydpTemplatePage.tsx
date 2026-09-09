import { useState, useEffect, useRef } from "react";
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
  ChevronRight, 
  ArrowLeft,
  Share2,
  HelpCircle,
  FileCheck2,
  X,
  Loader2,
  Upload
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { exportOfficialLandscapePdf } from "../lib/pdfExport";
import { useAuth } from "../components/auth/AuthProvider";
import { 
  CbydpDocument, 
  CbydpCenterSection, 
  CbydpRowItem 
} from "../types";
import { 
  loadCbydpDocument, 
  saveCbydpDocument, 
  resetCbydpToDefault, 
  calculateCbydpSectionTotal, 
  calculateCbydpGrandTotal
} from "../lib/cbydpStore";
import { MUNICIPAL_BARANGAYS_40 } from "../lib/barangayStore";

export function CbydpTemplatePage() {
  const { user, role, activeBarangay } = useAuth();
  const navigate = useNavigate();

  // Active barangay for this CBYDP document
  const currentBarangay = user?.barangayName || activeBarangay || "Kapatagan";
  const [selectedBarangay, setSelectedBarangay] = useState<string>(currentBarangay);

  // Document state
  const [doc, setDoc] = useState<CbydpDocument>(() => 
    loadCbydpDocument(currentBarangay, user?.displayName, undefined)
  );

  // View & Edit Mode state
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeCenterId, setActiveCenterId] = useState<string>(doc.sections[0]?.id || "sec-governance");
  const [toastMessage, setToastMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Modal for editing/adding single row
  const [modalItem, setModalItem] = useState<{
    sectionId: string;
    item: CbydpRowItem;
    isNew: boolean;
  } | null>(null);

  // Logo upload input refs
  const leftLogoInputRef = useRef<HTMLInputElement>(null);
  const rightLogoInputRef = useRef<HTMLInputElement>(null);

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
        showToast("Sangguniang Kabataan logo updated!", "success");
      } else {
        setDoc((prev) => ({ ...prev, rightLogoUrl: result }));
        showToast("Barangay Seal updated!", "success");
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

  // Load document when barangay changes
  useEffect(() => {
    const loaded = loadCbydpDocument(selectedBarangay, user?.displayName, undefined);
    setDoc(loaded);
    if (loaded.sections.length > 0) {
      setActiveCenterId(loaded.sections[0].id);
    }
  }, [selectedBarangay, user?.displayName]);

  const showToast = (text: string, type: "success" | "error" | "info" = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save document
  const handleSave = () => {
    try {
      saveCbydpDocument(doc);
      showToast(`CBYDP successfully saved and updated for Barangay ${doc.barangayName}!`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save CBYDP", "error");
    }
  };

  // Reset to original PDF standard
  const handleReset = () => {
    if (window.confirm("Restore standard CBYDP template? This will load the official 10 Centers of Participation with default statutory allocations matching the reference document.")) {
      const fresh = resetCbydpToDefault(selectedBarangay, user?.displayName, undefined);
      setDoc(fresh);
      showToast("Restored official standard CBYDP template.", "info");
    }
  };

  // Export directly as PDF file
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
      const pageElements = Array.from(
        document.querySelectorAll(".cbydp-page-break")
      ) as HTMLElement[];

      if (pageElements.length === 0) {
        throw new Error("No document pages found to export");
      }

      const cleanBarangay = doc.barangayName.replace(/[^a-zA-Z0-9_-]/g, "_");
      const cleanYears = doc.calendarYears.replace(/[^a-zA-Z0-9_-]/g, "-");
      const filename = `CBYDP_${cleanBarangay}_CY${cleanYears}.pdf`;

      await exportOfficialLandscapePdf(pageElements, {
        filename,
        marginMm: 8,
        scale: 2,
        windowWidth: 1200,
      });

      showToast(`Exported ${filename} successfully!`, "success");
    } catch (err: any) {
      console.error("PDF generation failed:", err);
      showToast("Direct PDF export encountered an error, opening print dialog...", "error");
      window.print();
    } finally {
      if (wasEditing) {
        setIsEditing(true);
      }
      setIsExportingPdf(false);
    }
  };

  // Delete item from section
  const handleDeleteItem = (sectionId: string, itemId: string) => {
    if (window.confirm("Are you sure you want to delete this PPA row?")) {
      const updatedSections = doc.sections.map(sec => {
        if (sec.id === sectionId) {
          return {
            ...sec,
            items: sec.items.filter(it => it.id !== itemId)
          };
        }
        return sec;
      });

      const updatedDoc = {
        ...doc,
        sections: updatedSections,
        totalAppropriation: calculateCbydpGrandTotal({ ...doc, sections: updatedSections })
      };
      setDoc(updatedDoc);
      showToast("Row deleted.", "info");
    }
  };

  // Open modal to add item
  const handleOpenAddItem = (sectionId: string) => {
    const targetSec = doc.sections.find(s => s.id === sectionId);
    const newItem: CbydpRowItem = {
      id: `item-${Date.now()}`,
      concern: "",
      objectives: "",
      performanceIndicator: "",
      targetYear1: "10",
      targetYear2: "15",
      targetYear3: "20",
      targetYear4: "25",
      ppas: "",
      budgetCategory: "MOOE",
      budgetAmount: 100000,
      personResponsible: "SK OFFICIALS"
    };

    setModalItem({
      sectionId,
      item: newItem,
      isNew: true
    });
  };

  // Open modal to edit item
  const handleOpenEditItem = (sectionId: string, item: CbydpRowItem) => {
    setModalItem({
      sectionId,
      item: { ...item },
      isNew: false
    });
  };

  // Save modal item
  const handleSaveModalItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalItem) return;

    const { sectionId, item, isNew } = modalItem;
    const updatedSections = doc.sections.map(sec => {
      if (sec.id === sectionId) {
        let newItems: CbydpRowItem[];
        if (isNew) {
          newItems = [...sec.items, item];
        } else {
          newItems = sec.items.map(it => it.id === item.id ? item : it);
        }
        return {
          ...sec,
          items: newItems
        };
      }
      return sec;
    });

    const updatedDoc = {
      ...doc,
      sections: updatedSections,
      totalAppropriation: calculateCbydpGrandTotal({ ...doc, sections: updatedSections })
    };
    setDoc(updatedDoc);
    setModalItem(null);
    showToast(isNew ? "PPA item added." : "PPA item updated.", "success");
  };

  // Add new Center of Participation
  const handleAddCenter = () => {
    const name = window.prompt("Enter title for new Center of Participation (e.g. SPORTS & WELLNESS):");
    if (!name || !name.trim()) return;

    const newSec: CbydpCenterSection = {
      id: `sec-${Date.now()}`,
      centerName: name.trim().toUpperCase(),
      agendaStatement: "By 2028, youth will be empowered through dedicated programs and strategic initiatives.",
      items: [
        {
          id: `item-${Date.now()}`,
          concern: "Youth development priority area",
          objectives: "Strengthen youth participation and institutional services",
          performanceIndicator: "Number of participants served",
          targetYear1: "50",
          targetYear2: "50",
          targetYear3: "50",
          targetYear4: "50",
          ppas: "PPA Initiative for " + name.trim(),
          budgetCategory: "MOOE",
          budgetAmount: 500000,
          personResponsible: "SK OFFICIALS"
        }
      ]
    };

    const updatedSections = [...doc.sections, newSec];
    const updatedDoc = {
      ...doc,
      sections: updatedSections,
      totalAppropriation: calculateCbydpGrandTotal({ ...doc, sections: updatedSections })
    };
    setDoc(updatedDoc);
    setActiveCenterId(newSec.id);
    showToast(`Added Center of Participation: ${name.trim().toUpperCase()}`, "success");
  };

  // Delete an entire Center of Participation
  const handleDeleteCenter = (sectionId: string, centerName: string) => {
    if (doc.sections.length <= 1) {
      alert("A CBYDP must contain at least one Center of Participation.");
      return;
    }
    if (window.confirm(`Are you sure you want to remove the entire "${centerName}" Center of Participation?`)) {
      const updatedSections = doc.sections.filter(s => s.id !== sectionId);
      const updatedDoc = {
        ...doc,
        sections: updatedSections,
        totalAppropriation: calculateCbydpGrandTotal({ ...doc, sections: updatedSections })
      };
      setDoc(updatedDoc);
      setActiveCenterId(updatedSections[0].id);
      showToast(`Removed Center of Participation: ${centerName}`, "info");
    }
  };

  // Calculate grand total appropriation
  const grandTotal = calculateCbydpGrandTotal(doc);

  return (
    <div className="min-h-screen bg-[#F4F3F0] text-zinc-900 font-sans pb-24 print:bg-white print:p-0 print:m-0">
      {/* PRINT CSS: Explicitly forces landscape orientation and hides web app chrome */}
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 8mm 10mm 8mm 10mm;
          }
          html, body {
            background: #ffffff !important;
            color: #000000 !important;
            font-family: 'Arial', sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-hidden,
          .print\\:hidden,
          nav,
          header,
          button,
          .no-print {
            display: none !important;
          }
          .cbydp-sheet {
            box-shadow: none !important;
            border: none !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
            padding: 0 !important;
          }
          .cbydp-page-break {
            page-break-before: always !important;
            break-before: page !important;
          }
          .cbydp-table {
            border-collapse: collapse !important;
            width: 100% !important;
            font-size: 8.5pt !important;
          }
          .cbydp-table th, .cbydp-table td {
            border: 1px solid #000000 !important;
            padding: 4px 6px !important;
            color: #000000 !important;
          }
          .cbydp-table th {
            background-color: #f5f5f5 !important;
            font-weight: bold !important;
            text-align: center !important;
          }
        }
      `}</style>

      {/* Top Floating Action & Control Toolbar (Hidden in Print) */}
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
                <span className="text-xs font-black uppercase tracking-widest text-amber-400">
                  CBYDP Standard Framework
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold border border-emerald-500/30">
                  {doc.calendarYears}
                </span>
              </div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-amber-400" />
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
                  ? "bg-amber-400 text-[#0C1E36] shadow-md hover:bg-amber-300" 
                  : "bg-slate-800 text-zinc-200 border border-slate-700 hover:bg-slate-700"
              }`}
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit3 className="w-3.5 h-3.5" />}
              <span>{isEditing ? "Preview Clean PDF" : "Edit Fields & Rows"}</span>
            </button>

            {/* Save Button */}
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-emerald-950/30 transition-all active:scale-95 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>

            {/* Export as PDF Button (Automatically generates and downloads .pdf file) */}
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-75 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-blue-950/30 transition-all active:scale-95 cursor-pointer"
              title="Exports and automatically downloads the CBYDP as a PDF file"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Export as PDF</span>
                </>
              )}
            </button>

            {/* Print (Landscape) Button */}
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-zinc-200 border border-slate-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
              title="Prints or saves via browser landscape dialog"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Print</span>
            </button>

            {/* Reset Template */}
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-zinc-400 hover:text-rose-300 border border-slate-700 text-xs transition-colors cursor-pointer"
              title="Reset to Official 10 Centers Standard Template"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Centers of Participation Quick Jump Bar */}
        <div className="max-w-7xl mx-auto mt-3 pt-2.5 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 shrink-0 mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-400" /> Centers:
          </span>
          {doc.sections.map((sec, idx) => {
            const isActive = activeCenterId === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveCenterId(sec.id);
                  const el = document.getElementById(sec.id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[9.5px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                  isActive 
                    ? "bg-amber-400 text-[#0C1E36] font-black shadow-xs" 
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700"
                }`}
              >
                <span>{idx + 1}. {sec.centerName}</span>
                <span className="text-[8px] opacity-70">({sec.items.length})</span>
              </button>
            );
          })}

          {isEditing && (
            <button
              onClick={handleAddCenter}
              className="px-2.5 py-1 rounded-lg text-[9.5px] font-black uppercase whitespace-nowrap bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-600 flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3 h-3" />
              <span>Add Center</span>
            </button>
          )}
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

      {/* Main Document Content Container (Landscape Paper Aspect) */}
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 pt-8 print:p-0 print:m-0 print:max-w-none">
        
        {/* Notice in Edit Mode */}
        {isEditing && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl mb-6 text-xs text-amber-900 flex items-center justify-between gap-4 print:hidden">
            <div className="flex items-center gap-2.5">
              <Edit3 className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <strong>Edit Mode Active:</strong> You can edit titles, agenda statements, add new PPA rows, modify targets, and adjust budget allocations. All calculations update automatically.
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

        {/* CBYDP DOCUMENT PAPER CANVAS */}
        <div className="cbydp-document-container space-y-8 print:space-y-0">
          
          {/* ======================================================== */}
          {/* PAGE 1: TITLE & COVER PAGE (Identical to PDF Page 1)     */}
          {/* ======================================================== */}
          <div 
            id="cbydp-cover-page"
            className="cbydp-page-break print-page-break-after bg-white text-zinc-900 border border-zinc-200 shadow-sm rounded-lg p-8 sm:p-12 print:border-none print:shadow-none print:rounded-none print:p-0 min-h-[640px] flex flex-col justify-between"
          >
            
            {/* Header Logos & Republic Header */}
            <div className="flex items-center justify-between gap-4 pt-4">
              
              {/* Left Circular Emblem: Sangguniang Kabataan */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-amber-500/80 bg-white p-1 flex items-center justify-center shadow-sm shrink-0 relative group overflow-hidden">
                  {doc.leftLogoUrl ? (
                    <img src={doc.leftLogoUrl} alt="SK Logo" className="w-full h-full object-contain rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-blue-900 bg-blue-950 flex flex-col items-center justify-center text-white text-center p-1 relative overflow-hidden">
                      <span className="text-[7.5px] font-black tracking-tighter uppercase text-amber-300 leading-tight">
                        SANGGUNIANG KABATAAN
                      </span>
                      <div className="text-amber-400 font-black text-xl leading-none my-0.5">★</div>
                      <span className="text-[6.5px] font-bold uppercase tracking-wider text-slate-200 leading-none">
                        BARANGAY {doc.barangayName.toUpperCase()}
                      </span>
                    </div>
                  )}

                  {isEditing && (
                    <div 
                      onClick={() => leftLogoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity rounded-full p-1 print:hidden"
                      title="Upload Sangguniang Kabataan Logo"
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
                      <Upload className="w-2.5 h-2.5" /> Upload Logo
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

              {/* Center Republic Header Texts */}
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
                    <p className="text-xs tracking-wider uppercase text-zinc-700 font-semibold">Republic of the Philippines</p>
                    <p className="text-xs tracking-wider uppercase text-zinc-700 font-semibold">Province of {doc.province}</p>
                    <p className="text-xs tracking-wider uppercase text-zinc-700 font-semibold">Municipality of {doc.municipality}</p>
                    <p className="text-sm tracking-wider uppercase text-zinc-900 font-extrabold">Barangay {doc.barangayName}</p>
                    <p className="text-xs tracking-widest uppercase text-blue-900 font-black pt-1">Sangguniang Kabataan</p>
                  </>
                )}
              </div>

              {/* Right Circular Emblem: Barangay Seal */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-blue-900/80 bg-white p-1 flex items-center justify-center shadow-sm shrink-0 relative group overflow-hidden">
                  {doc.rightLogoUrl ? (
                    <img src={doc.rightLogoUrl} alt="Barangay Seal" className="w-full h-full object-contain rounded-full" />
                  ) : (
                    <div className="w-full h-full rounded-full border-2 border-amber-500 bg-amber-50 flex flex-col items-center justify-center text-center p-1 text-zinc-900">
                      <span className="text-[7.5px] font-black uppercase text-blue-950 leading-tight">
                        BARANGAY
                      </span>
                      <span className="text-[8.5px] font-black uppercase text-amber-700 leading-tight">
                        {doc.barangayName.toUpperCase()}
                      </span>
                      <div className="text-emerald-700 font-black text-base my-0.5">🌴</div>
                      <span className="text-[6.5px] font-bold uppercase text-zinc-600 leading-none">
                        LAAK, DAVAO DE ORO
                      </span>
                    </div>
                  )}

                  {isEditing && (
                    <div 
                      onClick={() => rightLogoInputRef.current?.click()}
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity rounded-full p-1 print:hidden"
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
                      onClick={() => rightLogoInputRef.current?.click()}
                      className="text-[8px] font-bold text-blue-700 hover:underline flex items-center gap-0.5"
                    >
                      <Upload className="w-2.5 h-2.5" /> Upload Seal
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

            {/* Grand Massive Outlined Title (Exactly matching PDF Page 1) */}
            <div className="my-14 space-y-4">
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-zinc-900 drop-shadow-sm font-sans leading-none">
                Comprehensive Barangay
                <br />
                Youth Development Plan
              </h1>

              <div className="pt-4">
                <p className="text-lg sm:text-2xl font-black tracking-widest uppercase text-zinc-800">
                  Calendar Year
                </p>
                {isEditing ? (
                  <input
                    type="text"
                    value={doc.calendarYears}
                    onChange={(e) => setDoc({ ...doc, calendarYears: e.target.value })}
                    className="text-2xl sm:text-4xl font-black text-center border-b-2 border-zinc-700 focus:outline-none px-4 py-1 mt-1 bg-transparent"
                  />
                ) : (
                  <p className="text-3xl sm:text-5xl font-black text-zinc-900 tracking-wider mt-1">
                    {doc.calendarYears}
                  </p>
                )}
              </div>
            </div>

            {/* Subtitle / Center note */}
            <div className="text-left text-xs font-black uppercase tracking-wider text-zinc-700 pb-2 border-t border-zinc-200 pt-3">
              Center of Participation: <span className="font-extrabold text-blue-950">ALL CENTERS / SANGGUNIANG KABATAAN</span>
            </div>
          </div>

          {/* ======================================================== */}
          {/* SECTIONS & TABLES FOR EACH CENTER OF PARTICIPATION       */}
          {/* ======================================================== */}
          <div className="space-y-8 print:space-y-0">
            {doc.sections.map((section, sIndex) => {
              const secTotal = calculateCbydpSectionTotal(section);

              return (
                <div 
                  key={section.id} 
                  id={section.id} 
                  className="cbydp-page-break bg-white text-zinc-900 border border-zinc-200 shadow-sm rounded-lg p-6 sm:p-8 print:border-none print:shadow-none print:rounded-none print:p-0 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Center Header & Agenda Statement */}
                    <div className="space-y-2 border-b-2 border-zinc-900 pb-2">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-zinc-900">
                        Center of Participation: <span className="text-blue-950 font-black">{section.centerName}</span>
                      </h2>

                      {/* Edit controls for section header (Hidden in print) */}
                      {isEditing && (
                        <div className="flex items-center gap-2 print:hidden">
                          <button
                            onClick={() => handleOpenAddItem(section.id)}
                            className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add PPA Item</span>
                          </button>
                          <button
                            onClick={() => handleDeleteCenter(section.id, section.centerName)}
                            className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-black uppercase flex items-center gap-1 border border-rose-200"
                            title="Delete Center"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete Center</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Agenda Statement */}
                    <div className="text-xs font-normal text-zinc-800 leading-relaxed">
                      <strong className="font-black text-zinc-950 mr-1.5">Agenda Statement:</strong>
                      {isEditing ? (
                        <textarea
                          value={section.agendaStatement}
                          onChange={(e) => {
                            const updated = doc.sections.map(s => 
                              s.id === section.id ? { ...s, agendaStatement: e.target.value } : s
                            );
                            setDoc({ ...doc, sections: updated });
                          }}
                          rows={2}
                          className="w-full mt-1.5 p-2 text-xs border border-zinc-300 rounded focus:border-blue-900 focus:outline-none"
                        />
                      ) : (
                        <span>{section.agendaStatement}</span>
                      )}
                    </div>
                  </div>

                  {/* Standard CBYDP 7-Column Table - Crisp border-separate prevents any header text clipping */}
                  <div className="w-full pt-1">
                    <table className="cbydp-table w-full border-separate border-spacing-0 border-t border-l border-zinc-900 text-[10px] leading-snug text-left">
                      <colgroup>
                        <col style={{ width: "16%" }} />
                        <col style={{ width: "15%" }} />
                        <col style={{ width: "16%" }} />
                        <col style={{ width: "3.5%" }} />
                        <col style={{ width: "3.5%" }} />
                        <col style={{ width: "3.5%" }} />
                        <col style={{ width: "18%" }} />
                        <col style={{ width: "11.5%" }} />
                        <col style={{ width: "13%" }} />
                        {isEditing && <col style={{ width: "8%" }} className="print:hidden" />}
                      </colgroup>
                      <thead>
                        <tr className="bg-zinc-100 text-zinc-900 font-black uppercase text-center">
                          <th className="border-r border-b border-zinc-900 px-2 py-3.5 w-[16%] align-middle text-[9.5px] tracking-wide" rowSpan={2}>
                            Youth Development Concern
                          </th>
                          <th className="border-r border-b border-zinc-900 px-2 py-3.5 w-[15%] align-middle text-[9.5px] tracking-wide" rowSpan={2}>
                            Objectives
                          </th>
                          <th className="border-r border-b border-zinc-900 px-2 py-3.5 w-[16%] align-middle text-[9.5px] tracking-wide" rowSpan={2}>
                            Performance Indicator
                          </th>
                          <th className="border-r border-b border-zinc-900 px-1 py-2 align-middle text-[9.5px] tracking-wide" colSpan={3}>
                            Target
                          </th>
                          <th className="border-r border-b border-zinc-900 px-2 py-3.5 w-[18%] align-middle text-[9.5px] tracking-wide" rowSpan={2}>
                            PPA'S
                          </th>
                          <th className="border-r border-b border-zinc-900 px-2 py-3.5 w-[11.5%] align-middle text-[9.5px] tracking-wide" rowSpan={2}>
                            Budget
                          </th>
                          <th className="border-r border-b border-zinc-900 px-2 py-3.5 w-[13%] align-middle text-[9.5px] tracking-wide" rowSpan={2}>
                            Person Responsible
                          </th>
                          {isEditing && (
                            <th className="border-r border-b border-zinc-900 px-2 py-3.5 w-[8%] align-middle print:hidden text-[9.5px] tracking-wide" rowSpan={2}>
                              Actions
                            </th>
                          )}
                        </tr>
                        <tr className="bg-zinc-100 text-zinc-900 font-extrabold uppercase text-center">
                          <th className="border-r border-b border-zinc-900 px-1 py-1.5 w-[3.5%] text-[9px]">{doc.targetYearLabels[0] || "2026"}</th>
                          <th className="border-r border-b border-zinc-900 px-1 py-1.5 w-[3.5%] text-[9px]">{doc.targetYearLabels[1] || "2027"}</th>
                          <th className="border-r border-b border-zinc-900 px-1 py-1.5 w-[3.5%] text-[9px]">{doc.targetYearLabels[2] || "2028"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {section.items.length === 0 ? (
                          <tr>
                            <td colSpan={isEditing ? 10 : 9} className="border-r border-b border-zinc-900 p-6 text-center text-zinc-400 italic">
                              No items recorded for this Center of Participation.
                            </td>
                          </tr>
                        ) : (
                          section.items.map((item) => (
                            <tr key={item.id} className="hover:bg-amber-50/20 transition-colors align-top">
                              {/* Concern */}
                              <td className="border-r border-b border-zinc-900 p-2 text-zinc-800 leading-snug">
                                {item.concern}
                              </td>

                              {/* Objectives */}
                              <td className="border-r border-b border-zinc-900 p-2 text-zinc-800 leading-snug">
                                {item.objectives}
                              </td>

                              {/* Performance Indicator */}
                              <td className="border-r border-b border-zinc-900 p-2 text-zinc-800 leading-snug">
                                {item.performanceIndicator}
                              </td>

                              {/* Target Years */}
                              <td className="border-r border-b border-zinc-900 p-2 text-center font-bold text-zinc-900">
                                {item.targetYear1}
                              </td>
                              <td className="border-r border-b border-zinc-900 p-2 text-center font-bold text-zinc-900">
                                {item.targetYear2}
                              </td>
                              <td className="border-r border-b border-zinc-900 p-2 text-center font-bold text-zinc-900">
                                {item.targetYear3}
                              </td>

                              {/* PPA'S */}
                              <td className="border-r border-b border-zinc-900 p-2 font-medium text-zinc-900 leading-snug">
                                {item.ppas}
                              </td>

                              {/* Budget (Category + Amount) */}
                              <td className="border-r border-b border-zinc-900 p-2 text-right">
                                <span className="block text-[9px] font-black uppercase text-zinc-500">
                                  {item.budgetCategory}
                                </span>
                                <span className="font-extrabold text-zinc-900">
                                  ₱{Number(item.budgetAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                              </td>

                              {/* Person Responsible */}
                              <td className="border-r border-b border-zinc-900 p-2 font-bold text-zinc-900 text-xs uppercase leading-snug">
                                {item.personResponsible}
                              </td>

                              {/* Edit Actions in Edit Mode (Hidden in Print) */}
                              {isEditing && (
                                <td className="border-r border-b border-zinc-900 p-2 text-center align-middle print:hidden">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleOpenEditItem(section.id, item)}
                                      className="p-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100"
                                      title="Edit row"
                                    >
                                      <Edit3 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(section.id, item.id)}
                                      className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
                                      title="Delete row"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </td>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                      <tfoot>
                        <tr className="bg-zinc-100/90 font-black text-xs text-zinc-900">
                          <td colSpan={6} className="border-r border-b border-zinc-900 p-2.5 uppercase tracking-wider">
                            TOTAL {section.centerName}
                          </td>
                          <td colSpan={isEditing ? 4 : 3} className="border-r border-b border-zinc-900 p-2.5 text-right font-black text-sm text-blue-950 font-mono">
                            ₱{secTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Official Page Footer */}
                <div className="pt-4 mt-6 flex items-center justify-between text-[9px] font-bold text-zinc-500 uppercase tracking-wider border-t border-zinc-300">
                  <span>Comprehensive Barangay Youth Development Plan (CBYDP) • CY {doc.calendarYears}</span>
                  <span>Barangay {doc.barangayName} • Center of Participation: {section.centerName}</span>
                </div>
              </div>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* FINAL SUMMARY & SIGNATORIES (Matching PDF Page 32)       */}
          {/* ======================================================== */}
          <div 
            id="cbydp-signatories-page"
            className="cbydp-page-break keep-together bg-white text-zinc-900 border border-zinc-200 shadow-sm rounded-lg p-8 sm:p-12 mb-8 print:border-none print:shadow-none print:rounded-none print:p-0 flex flex-col justify-between"
          >
            <div className="space-y-6">
              {/* Top Header */}
              <div className="text-center space-y-1 border-b pb-4 border-zinc-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                  Republic of the Philippines • Province of {doc.province} • Municipality of {doc.municipality} • Barangay {doc.barangayName}
                </p>
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-zinc-950">
                  COMPREHENSIVE BARANGAY YOUTH DEVELOPMENT PLAN (CBYDP) CY {doc.calendarYears}
                </h2>
                <p className="text-xs font-black uppercase tracking-widest text-blue-950">
                  STATUTORY SUMMARY & OFFICIAL APPROVAL
                </p>
              </div>

              {/* 10-Centers Summary Table */}
              <div className="w-full">
                <table className="w-full border-separate border-spacing-0 border-t border-l border-zinc-900 text-[10px]">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-900 font-black uppercase">
                      <th className="border-r border-b border-zinc-900 px-2 py-3 text-center w-12 text-[9.5px]">#</th>
                      <th className="border-r border-b border-zinc-900 px-2 py-3 text-left text-[9.5px]">Center of Participation</th>
                      <th className="border-r border-b border-zinc-900 px-2 py-3 text-center w-28 text-[9.5px]">PPA Items</th>
                      <th className="border-r border-b border-zinc-900 px-2 py-3 text-right w-48 text-[9.5px]">Total Appropriation (3 Years)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.sections.map((sec, idx) => {
                      const total = calculateCbydpSectionTotal(sec);
                      return (
                        <tr key={sec.id} className="hover:bg-zinc-50">
                          <td className="border-r border-b border-zinc-900 p-2 text-center font-bold text-zinc-500">{idx + 1}</td>
                          <td className="border-r border-b border-zinc-900 p-2 font-bold uppercase text-zinc-900">{sec.centerName}</td>
                          <td className="border-r border-b border-zinc-900 p-2 text-center font-medium">{sec.items.length}</td>
                          <td className="border-r border-b border-zinc-900 p-2 text-right font-mono font-bold text-zinc-950">
                            ₱{total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="bg-zinc-100/90 font-black text-xs text-zinc-950">
                      <td colSpan={3} className="border-r border-b border-zinc-900 p-2.5 uppercase tracking-wider text-right">
                        GRAND TOTAL APPROPRIATION:
                      </td>
                      <td className="border-r border-b border-zinc-900 p-2.5 text-right font-mono text-sm text-blue-950 font-black">
                        ₱{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Grand Summary Appropriation Box */}
              <div className="border-2 border-zinc-900 bg-amber-50/40 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 block">
                    3-Year Statutory Youth Development Fund
                  </span>
                  <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-zinc-900">
                    TOTAL STATUTORY APPROPRIATION
                  </h3>
                </div>

                <div className="text-2xl sm:text-3xl font-black text-blue-950 tracking-tight font-mono">
                  ₱{grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Official Signatories (Prepared by & Approved by) */}
            <div className="pt-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12 sm:gap-24 text-center">
                
                {/* Prepared by: SK Treasurer */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase text-zinc-600 text-left">Prepared by:</p>
                  <div className="pt-10 border-b border-zinc-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={doc.preparedByName}
                        onChange={(e) => setDoc({ ...doc, preparedByName: e.target.value.toUpperCase() })}
                        className="w-full text-center font-black text-sm uppercase border border-zinc-300 rounded p-1 mb-1"
                        placeholder="NAME OF SK TREASURER"
                      />
                    ) : (
                      <p className="font-black text-sm uppercase tracking-wider text-zinc-900">
                        {doc.preparedByName}
                      </p>
                    )}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={doc.preparedByTitle}
                      onChange={(e) => setDoc({ ...doc, preparedByTitle: e.target.value })}
                      className="w-full text-center font-bold text-xs uppercase border border-zinc-300 rounded p-1"
                      placeholder="TITLE (e.g. SK Treasurer)"
                    />
                  ) : (
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-700">
                      {doc.preparedByTitle}
                    </p>
                  )}
                </div>

                {/* Approved by: SK Chairperson */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase text-zinc-600 text-left">Approved by:</p>
                  <div className="pt-10 border-b border-zinc-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={doc.approvedByName}
                        onChange={(e) => setDoc({ ...doc, approvedByName: e.target.value.toUpperCase() })}
                        className="w-full text-center font-black text-sm uppercase border border-zinc-300 rounded p-1 mb-1"
                        placeholder="NAME OF SK CHAIRPERSON"
                      />
                    ) : (
                      <p className="font-black text-sm uppercase tracking-wider text-zinc-900">
                        {doc.approvedByName}
                      </p>
                    )}
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={doc.approvedByTitle}
                      onChange={(e) => setDoc({ ...doc, approvedByTitle: e.target.value })}
                      className="w-full text-center font-bold text-xs uppercase border border-zinc-300 rounded p-1"
                      placeholder="TITLE (e.g. SK Chairperson)"
                    />
                  ) : (
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-700">
                      {doc.approvedByTitle}
                    </p>
                  )}
                </div>

              </div>

              {/* Document metadata footer in print */}
              <div className="pt-8 text-center text-[9px] font-bold uppercase tracking-widest text-zinc-400 border-t border-zinc-200 mt-6">
                Comprehensive Barangay Youth Development Plan (CBYDP) • Republic of the Philippines • Municipality of {doc.municipality}, {doc.province}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL: ADD / EDIT PPA ITEM */}
      {modalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs print:hidden">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-zinc-200 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div>
                <h3 className="text-lg font-black uppercase text-[#0C1E36]">
                  {modalItem.isNew ? "Add PPA Program / Activity" : "Edit PPA Program / Activity"}
                </h3>
                <p className="text-xs text-zinc-500 font-medium">
                  Center of Participation: {doc.sections.find(s => s.id === modalItem.sectionId)?.centerName}
                </p>
              </div>
              <button 
                onClick={() => setModalItem(null)}
                className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModalItem} className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block mb-1">
                  Youth Development Concern
                </label>
                <textarea
                  required
                  value={modalItem.item.concern}
                  onChange={(e) => setModalItem({
                    ...modalItem,
                    item: { ...modalItem.item, concern: e.target.value }
                  })}
                  placeholder="e.g. Inadequate leadership capability-building"
                  rows={2}
                  className="w-full p-2.5 text-xs border border-zinc-200 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block mb-1">
                  Objectives
                </label>
                <textarea
                  required
                  value={modalItem.item.objectives}
                  onChange={(e) => setModalItem({
                    ...modalItem,
                    item: { ...modalItem.item, objectives: e.target.value }
                  })}
                  placeholder="e.g. To enhance the leadership skills of SK Officials"
                  rows={2}
                  className="w-full p-2.5 text-xs border border-zinc-200 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block mb-1">
                  Performance Indicator
                </label>
                <input
                  type="text"
                  required
                  value={modalItem.item.performanceIndicator}
                  onChange={(e) => setModalItem({
                    ...modalItem,
                    item: { ...modalItem.item, performanceIndicator: e.target.value }
                  })}
                  placeholder="e.g. Number of trainings conducted / attended"
                  className="w-full p-2.5 text-xs border border-zinc-200 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>

              {/* Target Years Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block mb-1">
                    Target {doc.targetYearLabels[0] || "2026"}
                  </label>
                  <input
                    type="text"
                    required
                    value={modalItem.item.targetYear1}
                    onChange={(e) => setModalItem({
                      ...modalItem,
                      item: { ...modalItem.item, targetYear1: e.target.value }
                    })}
                    placeholder="e.g. 10"
                    className="w-full p-2.5 text-xs border border-zinc-200 rounded-xl focus:border-blue-900 focus:outline-none text-center font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block mb-1">
                    Target {doc.targetYearLabels[1] || "2027"}
                  </label>
                  <input
                    type="text"
                    required
                    value={modalItem.item.targetYear2}
                    onChange={(e) => setModalItem({
                      ...modalItem,
                      item: { ...modalItem.item, targetYear2: e.target.value }
                    })}
                    placeholder="e.g. 15"
                    className="w-full p-2.5 text-xs border border-zinc-200 rounded-xl focus:border-blue-900 focus:outline-none text-center font-bold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block mb-1">
                    Target {doc.targetYearLabels[2] || "2028"}
                  </label>
                  <input
                    type="text"
                    required
                    value={modalItem.item.targetYear3}
                    onChange={(e) => setModalItem({
                      ...modalItem,
                      item: { ...modalItem.item, targetYear3: e.target.value }
                    })}
                    placeholder="e.g. 20"
                    className="w-full p-2.5 text-xs border border-zinc-200 rounded-xl focus:border-blue-900 focus:outline-none text-center font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block mb-1">
                  Programs, Projects and Activities (PPA'S)
                </label>
                <textarea
                  required
                  value={modalItem.item.ppas}
                  onChange={(e) => setModalItem({
                    ...modalItem,
                    item: { ...modalItem.item, ppas: e.target.value }
                  })}
                  placeholder="e.g. Attend various seminar and training for SK Officials (Training Expenses, Travelling Expenses)"
                  rows={3}
                  className="w-full p-2.5 text-xs border border-zinc-200 rounded-xl focus:border-blue-900 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block mb-1">
                    Budget Category
                  </label>
                  <select
                    value={modalItem.item.budgetCategory}
                    onChange={(e) => setModalItem({
                      ...modalItem,
                      item: { ...modalItem.item, budgetCategory: e.target.value }
                    })}
                    className="w-full p-2.5 text-xs border border-zinc-200 rounded-xl focus:border-blue-900 focus:outline-none font-bold"
                  >
                    <option value="MOOE">MOOE (Maintenance & Other Operating Expenses)</option>
                    <option value="CO">CO (Capital Outlay)</option>
                    <option value="PERSONNEL SERVICES">Personnel Services (Honorarium)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block mb-1">
                    Budget Amount (₱)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={modalItem.item.budgetAmount}
                    onChange={(e) => setModalItem({
                      ...modalItem,
                      item: { ...modalItem.item, budgetAmount: parseFloat(e.target.value) || 0 }
                    })}
                    placeholder="2000000"
                    className="w-full p-2.5 text-xs border border-zinc-200 rounded-xl focus:border-blue-900 focus:outline-none font-extrabold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-zinc-600 block mb-1">
                  Person Responsible
                </label>
                <input
                  type="text"
                  required
                  value={modalItem.item.personResponsible}
                  onChange={(e) => setModalItem({
                    ...modalItem,
                    item: { ...modalItem.item, personResponsible: e.target.value.toUpperCase() }
                  })}
                  placeholder="e.g. SK OFFICIALS, DILG, COA"
                  className="w-full p-2.5 text-xs border border-zinc-200 rounded-xl focus:border-blue-900 focus:outline-none font-bold uppercase"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white text-xs font-black uppercase tracking-wider shadow-md"
                >
                  {modalItem.isNew ? "Add Row Item" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
