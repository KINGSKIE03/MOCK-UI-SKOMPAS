import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Printer,
  Download,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle,
  Eye,
  Grid,
  List,
  Compass,
  Edit3,
  Sparkles,
  Sliders,
  Scissors,
  Check,
  RotateCcw,
  Minimize2
} from "lucide-react";

export interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  documentType: "CBYDP" | "ABYIP" | "Annual Budget";
  pageElementsSelector: string;
  onPrint?: () => void;
  onExportPdf?: () => void;
  isExportingPdf?: boolean;
}

interface PageData {
  id: string;
  title: string;
  html: string;
  pageNumber: number;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  documentType,
  pageElementsSelector,
  onPrint,
  onExportPdf,
  isExportingPdf = false,
}) => {
  const [pages, setPages] = useState<PageData[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  
  // Scale & View state
  // 1.0 = Exactly 100% Actual Physical A4 Size (297mm × 210mm)
  const [zoomScale, setZoomScale] = useState<number>(1.0); 
  const [viewMode, setViewMode] = useState<"continuous" | "single" | "grid">("continuous");
  const [showMarginGuides, setShowMarginGuides] = useState<boolean>(true);
  const [showChecklist, setShowChecklist] = useState<boolean>(false);
  
  // Direct In-Sheet Editing State ("Make it editable to ensure no spaces and no gaps")
  const [isDirectEditing, setIsDirectEditing] = useState<boolean>(false);
  const [hasUnsavedEdits, setHasUnsavedEdits] = useState<boolean>(false);

  // Formatting & Spacing Control ("Ensure no spaces and no gaps in printing")
  const [density, setDensity] = useState<"tight" | "compact" | "standard">("compact");
  const [marginMm, setMarginMm] = useState<number>(8); // 4mm, 6mm, 8mm, 10mm
  const [removeVerticalGaps, setRemoveVerticalGaps] = useState<boolean>(true);
  const [fontSizePercent, setFontSizePercent] = useState<number>(100); // 90%, 95%, 100%, 105%

  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Extract pages from DOM whenever the modal opens
  const loadPagesFromDOM = () => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>(pageElementsSelector)
    );

    const extracted: PageData[] = elements.map((el, index) => {
      let pageTitle = `Page ${index + 1}`;
      const id = el.id || `page-${index + 1}`;

      if (id.includes("cover")) {
        pageTitle = "Document Cover & Approval Page";
      } else if (id.includes("signator")) {
        pageTitle = "Official Signatories & Certification";
      } else {
        const centerHeader = el.querySelector("h2, h3, .section-header, .font-black");
        if (centerHeader && centerHeader.textContent) {
          const rawText = centerHeader.textContent.trim();
          if (rawText.toLowerCase().includes("center of participation")) {
            pageTitle = rawText.replace(/\n/g, " ").replace(/\s+/g, " ");
          } else if (rawText.length < 50) {
            pageTitle = rawText;
          } else {
            pageTitle = `Center of Participation: Part ${index}`;
          }
        }
      }

      // Clone node and strip editing buttons / action columns for pure print output
      const clone = el.cloneNode(true) as HTMLElement;
      clone.querySelectorAll("button, .print-hidden, .print\\:hidden, .no-print").forEach((btn) => {
        btn.remove();
      });

      return {
        id,
        title: pageTitle,
        html: clone.innerHTML,
        pageNumber: index + 1,
      };
    });

    setPages(extracted);
    setCurrentPageIndex(0);
    setHasUnsavedEdits(false);
  };

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      loadPagesFromDOM();
    }, 120);

    return () => clearTimeout(timer);
  }, [isOpen, pageElementsSelector]);

  // Keyboard navigation & shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && viewMode === "single") {
        setCurrentPageIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" && viewMode === "single") {
        setCurrentPageIndex((prev) => Math.min(pages.length - 1, prev + 1));
      } else if ((e.ctrlKey || e.metaKey) && e.key === "p") {
        e.preventDefault();
        handleTriggerPrint();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, viewMode, pages.length, isDirectEditing, density, marginMm, removeVerticalGaps]);

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(1.4, Number((prev + 0.1).toFixed(2))));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))));
  };

  // 1:1 Actual A4 Landscape Size (297mm × 210mm)
  const handleSetActualSize = () => {
    setZoomScale(1.0);
  };

  // Fit Screen (approx 75% for laptop displays)
  const handleFitScreen = () => {
    setZoomScale(0.75);
  };

  // Direct In-Sheet Edit tracking
  const handleContentEdited = (index: number) => {
    setHasUnsavedEdits(true);
    const targetDiv = pageRefs.current[index];
    if (targetDiv) {
      // Sync internal HTML state
      setPages((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = {
            ...next[index],
            html: targetDiv.innerHTML,
          };
        }
        return next;
      });
    }
  };

  // Auto-Fit / Gap Removal presets
  const handleApplyZeroGapsPreset = () => {
    setDensity("tight");
    setMarginMm(6);
    setRemoveVerticalGaps(true);
    setFontSizePercent(95);
  };

  const handleResetFormatting = () => {
    setDensity("compact");
    setMarginMm(8);
    setRemoveVerticalGaps(true);
    setFontSizePercent(100);
  };

  // Print execution: uses the exact edited preview sheets via .printing-from-modal class
  const handleTriggerPrint = () => {
    // Add special body class so @media print strictly prints the current preview sheets
    document.body.classList.add("printing-from-modal");
    
    // Give browser brief tick to apply print CSS
    setTimeout(() => {
      window.print();
      // Remove class once print dialog closes or cancels
      setTimeout(() => {
        document.body.classList.remove("printing-from-modal");
      }, 500);
    }, 100);
  };

  const handleScrollToPage = (index: number) => {
    setCurrentPageIndex(index);
    if (viewMode !== "continuous") {
      setViewMode("continuous");
    }
    setTimeout(() => {
      const target = document.getElementById(`preview-sheet-${index}`);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="print-preview-modal"
      className="fixed inset-0 z-[120] flex flex-col bg-slate-950 text-slate-100 overflow-hidden"
    >
      {/* ======================================================== */}
      {/* TOP CONTROL & NAVIGATION BAR                             */}
      {/* ======================================================== */}
      <header className="shrink-0 bg-[#0A1628] border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 shadow-2xl z-30">
        
        {/* Left: Document Info & Actual A4 Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Close Preview (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold uppercase tracking-wider border border-amber-400/30">
                A4 Landscape (297 × 210 mm)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-extrabold uppercase tracking-wider border border-emerald-400/30">
                {documentType} Official
              </span>
              {zoomScale === 1.0 && (
                <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold border border-blue-400/30 animate-pulse">
                  1:1 Actual Scale
                </span>
              )}
            </div>
            <h2 className="text-sm font-black text-white truncate flex items-center gap-1.5 mt-0.5">
              <FileText className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{title}</span>
              {subtitle && <span className="text-slate-400 font-normal text-xs hidden sm:inline">• {subtitle}</span>}
            </h2>
          </div>
        </div>

        {/* Center: Formatting, Gap Elimination & Edit Mode Controls */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Direct In-Page Edit Mode Toggle */}
          <button
            onClick={() => setIsDirectEditing(!isDirectEditing)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-sm ${
              isDirectEditing
                ? "bg-amber-400 text-slate-950 ring-2 ring-amber-300 shadow-amber-400/30"
                : "bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30"
            }`}
            title="Toggle Direct In-Sheet Editing: Click any text or cell on the A4 page to edit directly"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isDirectEditing ? "Editing Active" : "Direct Edit"}</span>
          </button>

          {/* Row Density & Spacing Preset (Removes gaps) */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
              <Sliders className="w-3 h-3 text-amber-400" />
              <span className="hidden lg:inline">Spacing:</span>
            </span>
            <button
              onClick={() => setDensity("tight")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                density === "tight"
                  ? "bg-emerald-600 text-white font-black"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Tight Spacing: Eliminates empty gaps and packs rows tightly"
            >
              Tight (No Gaps)
            </button>
            <button
              onClick={() => setDensity("compact")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                density === "compact"
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Compact: Balanced layout standard"
            >
              Compact
            </button>
            <button
              onClick={() => setDensity("standard")}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                density === "standard"
                  ? "bg-amber-500 text-slate-950 font-black"
                  : "text-slate-300 hover:text-white"
              }`}
              title="Standard spacing"
            >
              Standard
            </button>
          </div>

          {/* Margins Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg p-0.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 hidden xl:inline">
              Margins:
            </span>
            {[
              { mm: 4, label: "4mm (Max)" },
              { mm: 6, label: "6mm" },
              { mm: 8, label: "8mm (SK)" },
            ].map((m) => (
              <button
                key={m.mm}
                onClick={() => setMarginMm(m.mm)}
                className={`px-1.5 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  marginMm === m.mm
                    ? "bg-blue-600 text-white font-black"
                    : "text-slate-300 hover:text-white"
                }`}
                title={`${m.mm}mm margin`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Quick Auto-Fit "Zero Gaps" Button */}
          <button
            onClick={handleApplyZeroGapsPreset}
            className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 cursor-pointer transition-all"
            title="Auto-Fit Preset: Applies Tight Spacing + 6mm margins to remove all empty gaps"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Zero Gaps</span>
          </button>

          {/* Zoom / Scale Controls */}
          <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg px-1 py-0.5">
            <button
              onClick={handleZoomOut}
              className="p-1 text-slate-300 hover:text-white transition-colors"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            
            {/* Quick 100% Actual Size Button */}
            <button
              onClick={handleSetActualSize}
              className={`px-2 text-xs font-mono font-bold transition-colors ${
                zoomScale === 1.0 ? "text-amber-300 bg-amber-400/20 rounded py-0.5" : "text-slate-200 hover:text-white"
              }`}
              title="Click to view in 1:1 Actual Physical A4 Landscape Size (297mm × 210mm)"
            >
              {Math.round(zoomScale * 100)}%
            </button>

            <button
              onClick={handleZoomIn}
              className="p-1 text-slate-300 hover:text-white transition-colors"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleFitScreen}
              className="px-1.5 py-0.5 text-[10px] font-bold text-slate-400 hover:text-white border-l border-slate-800 ml-1"
              title="Fit Screen (75%)"
            >
              Fit
            </button>
          </div>

          {/* Margin Guides Visualizer */}
          <button
            onClick={() => setShowMarginGuides(!showMarginGuides)}
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              showMarginGuides
                ? "bg-blue-600/30 text-blue-300 border-blue-500/50"
                : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
            }`}
            title="Toggle visual margin guidelines"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Right: Print & PDF Actions */}
        <div className="flex items-center gap-2 shrink-0">
          
          {/* Audit Checklist Dropdown Toggle */}
          <button
            onClick={() => setShowChecklist(!showChecklist)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 text-xs font-black transition-colors"
            title="View Print Formatting Audit Checklist"
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>

          {/* Export PDF Button */}
          {onExportPdf && (
            <button
              onClick={onExportPdf}
              disabled={isExportingPdf}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
          )}

          {/* Print Button */}
          <button
            onClick={handleTriggerPrint}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            title="Print Document directly in A4 Landscape (Ctrl+P)"
          >
            <Printer className="w-4 h-4" />
            <span>Print Now</span>
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* DIRECT EDIT NOTIFICATION BANNER                          */}
      {/* ======================================================== */}
      {isDirectEditing && (
        <div className="bg-amber-400 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between gap-3 shadow-md z-20 print:hidden">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 shrink-0" />
            <span>
              <strong>Direct In-Page Editing Active:</strong> Click any cell, title, or paragraph directly on the A4 sheets below to edit text in real time. Perfect for shortening lines, fixing typos, and eliminating accidental empty row spaces before printing!
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDirectEditing(false)}
              className="px-2.5 py-0.5 rounded bg-slate-950 text-amber-300 text-[11px] font-black uppercase tracking-wider"
            >
              Finish Editing
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* AUDIT CHECKLIST FLYOUT                                   */}
      {/* ======================================================== */}
      <AnimatePresence>
        {showChecklist && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-16 right-4 z-30 w-84 bg-slate-900 border border-slate-700 rounded-2xl p-4 shadow-2xl text-xs space-y-3 print:hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> A4 Printing Audit Checklist
              </span>
              <button onClick={() => setShowChecklist(false)} className="text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <ul className="space-y-2.5 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">A4 Paper Dimensions:</strong> Exact 297mm × 210mm in Landscape orientation.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">No Spaces & No Gaps:</strong> Density is set to <span className="font-mono text-amber-300 font-bold uppercase">{density}</span>. Vertical spacers are compacted.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Table Header Alignment:</strong> All 7 column headers are pinned and unclipped.
                </div>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Signatories Intact:</strong> Official signatures are anchored to the final certification sheet.
                </div>
              </li>
            </ul>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-snug">
              💡 <strong>Print Dialog Instructions:</strong> In your browser print dialog, verify <em>Orientation: Landscape</em> and <em>Margins: None / Minimum</em>.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MAIN PREVIEW CANVAS (Exact A4 Landscape Sheet Rendering) */}
      {/* ======================================================== */}
      <div 
        ref={containerRef}
        className={`preview-canvas-container flex-1 overflow-auto bg-[#0d1522] p-4 sm:p-8 flex flex-col items-center select-text ${
          removeVerticalGaps ? "no-vertical-gaps" : ""
        } density-${density}`}
      >
        {pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center my-auto py-20 text-slate-400 gap-3">
            <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-bold">Dividing document into official A4 landscape pages...</p>
          </div>
        ) : viewMode === "grid" ? (
          /* Thumbnail Grid View */
          <div className="max-w-6xl w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
            {pages.map((page, idx) => (
              <div
                key={page.id}
                onClick={() => handleScrollToPage(idx)}
                className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-amber-400 rounded-xl p-2.5 transition-all hover:scale-102 flex flex-col gap-2 shadow-lg"
              >
                <div className="aspect-[297/210] bg-white rounded shadow-sm overflow-hidden p-2 relative pointer-events-none">
                  <div 
                    className="transform origin-top-left scale-[0.22] w-[297mm] pointer-events-none text-[8px]"
                    dangerouslySetInnerHTML={{ __html: page.html }}
                  />
                  <div className="absolute inset-0 bg-transparent group-hover:bg-amber-500/10 transition-colors" />
                </div>
                <div className="flex items-center justify-between text-[11px] px-1">
                  <span className="font-bold text-slate-200 truncate">{page.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                    #{idx + 1}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : viewMode === "single" ? (
          /* Single Page Presentation View */
          <div className="flex flex-col items-center justify-center my-auto">
            {pages[currentPageIndex] && (
              <div className="flex flex-col items-center gap-3">
                {/* Page Label */}
                <div 
                  style={{ width: `${297 * zoomScale}mm` }}
                  className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 mx-auto px-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      Page {currentPageIndex + 1} of {pages.length}
                    </span>
                    <span className="text-slate-200 truncate max-w-[200px]">{pages[currentPageIndex].title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">297 × 210 mm Landscape</span>
                </div>

                {/* Scaled A4 Sheet Container */}
                <div
                  style={{
                    width: `${297 * zoomScale}mm`,
                    height: `${210 * zoomScale}mm`,
                    position: "relative",
                    flexShrink: 0,
                    margin: "0 auto",
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${zoomScale})`,
                      transformOrigin: "top left",
                      width: "297mm",
                      height: "210mm",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      boxSizing: "border-box",
                      fontSize: `${fontSizePercent}%`,
                    }}
                    className="preview-a4-sheet bg-white text-zinc-900 shadow-2xl ring-1 ring-black/10 rounded-xs overflow-hidden"
                  >
                    {/* Optional Margin Guide */}
                    {showMarginGuides && (
                      <div 
                        style={{ inset: `${marginMm}mm` }}
                        className="absolute border border-dashed border-sky-400/40 pointer-events-none z-10 print:hidden" 
                        title={`${marginMm}mm Margin Guide`}
                      />
                    )}

                    {/* Page Content Container */}
                    <div 
                      ref={(el) => {
                        pageRefs.current[currentPageIndex] = el;
                      }}
                      style={{ padding: `${marginMm}mm` }}
                      className="h-full flex flex-col justify-between"
                      contentEditable={isDirectEditing}
                      suppressContentEditableWarning={true}
                      onBlur={() => handleContentEdited(currentPageIndex)}
                      dangerouslySetInnerHTML={{ __html: pages[currentPageIndex].html }} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Continuous Vertical Scroll View (Default: All Pages clearly divided) */
          <div className="flex flex-col items-center gap-12 w-full max-w-full pb-20">
            {pages.map((page, idx) => (
              <div
                key={page.id}
                id={`preview-sheet-${idx}`}
                className="flex flex-col items-center gap-2.5 w-full"
              >
                {/* Page Label & Navigation Strip */}
                <div 
                  style={{ width: `${297 * zoomScale}mm` }}
                  className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400 mx-auto px-1 print:hidden"
                >
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                      Page {page.pageNumber} of {pages.length}
                    </span>
                    <span className="text-slate-200 truncate max-w-[280px]">{page.title}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {isDirectEditing && (
                      <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1">
                        <Edit3 className="w-3 h-3" /> Click text to edit
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      297 × 210 mm Landscape
                    </span>
                  </div>
                </div>

                {/* Scaled A4 Sheet Container */}
                <div
                  style={{
                    width: `${297 * zoomScale}mm`,
                    height: `${210 * zoomScale}mm`,
                    position: "relative",
                    flexShrink: 0,
                    margin: "0 auto",
                  }}
                >
                  <div
                    style={{
                      transform: `scale(${zoomScale})`,
                      transformOrigin: "top left",
                      width: "297mm",
                      height: "210mm",
                      position: "absolute",
                      top: 0,
                      left: 0,
                      boxSizing: "border-box",
                      fontSize: `${fontSizePercent}%`,
                    }}
                    className="preview-a4-sheet bg-white text-zinc-900 shadow-2xl ring-1 ring-black/10 rounded-xs overflow-hidden"
                  >
                    {/* Visual Margin Guide */}
                    {showMarginGuides && (
                      <div 
                        style={{ inset: `${marginMm}mm` }}
                        className="absolute border border-dashed border-sky-400/40 pointer-events-none z-10 print:hidden" 
                        title={`${marginMm}mm Margin Area`}
                      />
                    )}

                    {/* Page Content */}
                    <div 
                      ref={(el) => {
                        pageRefs.current[idx] = el;
                      }}
                      style={{ padding: `${marginMm}mm` }}
                      className="h-full flex flex-col justify-between"
                      contentEditable={isDirectEditing}
                      suppressContentEditableWarning={true}
                      onBlur={() => handleContentEdited(idx)}
                      dangerouslySetInnerHTML={{ __html: page.html }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* BOTTOM FOOTER STATUS & INSTRUCTION STRIP                 */}
      {/* ======================================================== */}
      <footer className="shrink-0 bg-[#0A1628] border-t border-slate-800 px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 z-30 print:hidden">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Divided into <strong>{pages.length} A4 Landscape Pages (297×210mm)</strong>. Spacing set to <strong className="text-white uppercase">{density}</strong> to prevent gaps.
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-slate-400">
            Scale: <strong className="text-amber-300">{Math.round(zoomScale * 100)}%</strong>
          </span>
          <span className="text-slate-400">
            Margins: <strong className="text-white">{marginMm}mm</strong>
          </span>
          {hasUnsavedEdits && (
            <span className="text-amber-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Edits Ready to Print
            </span>
          )}
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Print Ready
          </span>
        </div>
      </footer>
    </div>
  );
};
