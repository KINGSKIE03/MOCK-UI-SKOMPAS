import { useState, useEffect } from "react";
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
  ExternalLink
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { jsPDF } from "jspdf";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../components/auth/AuthProvider";
import { cn } from "../lib/utils";
import { ComplianceReport } from "../types";
import { MOCK_DOCUMENTS } from "../lib/mockData";

export function EditorPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { role } = useAuth();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [docType, setDocType] = useState<"needs" | "budget">("needs");
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [documentStatus, setDocumentStatus] = useState("pending");
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    if (type === "needs" || type === "budget") {
      setDocType(type as "needs" | "budget");
      setTitle(`New ${type === "needs" ? "Needs" : "Budget"} Document`);
      setContent("");
      setDocumentStatus("pending");
    } else if (type) {
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
  }, [type]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate prototype save
    setTimeout(() => {
        setIsSaving(false);
        setHistory(prev => [new Date().toLocaleTimeString(), ...prev.slice(0, 4)]);
    }, 1000);
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setIsAnalyzing(true);
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
  const canEditType = (role === 'Secretary' && docType === 'needs') || (role === 'Treasurer' && docType === 'budget');

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#FDFCFB] font-sans">
      {/* Editor Side */}
      <div className="flex-1 flex flex-col border-r border-[#eee]">
        <div className="px-8 py-6 border-b border-[#eee] flex items-center justify-between bg-white z-10 shadow-sm">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="p-3 hover:bg-[#FDFCFB] rounded-2xl transition-colors border border-transparent hover:border-[#eee]">
              <ArrowLeft className="w-5 h-5 text-[#666]" />
            </Link>
            <div>
                 <input 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isReadOnly}
                  className="bg-transparent border-none text-2xl font-black tracking-tight focus:outline-none placeholder:text-[#ccc] w-[400px]"
                  placeholder="Document Title..."
                />
                <div className="flex items-center gap-3 mt-1">
                    <span className="px-3 py-0.5 bg-[#FDFCFB] border border-[#eee] rounded-full text-[10px] font-black text-[#999] uppercase tracking-widest">
                    {docType} AUDIT
                    </span>
                    <div className="w-1 h-1 bg-[#ccc] rounded-full" />
                    <span className="text-[10px] font-bold text-[#aaa] uppercase tracking-widest">Drafting Phase</span>
                </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {documentStatus === 'approved' && (
              <div className="flex items-center gap-2 mr-2">
                <button 
                  onClick={() => handleDownload('pdf')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#C89311] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-[#C89311]/20"
                >
                  <Download className="w-4 h-4" />
                  PDF Export
                </button>
                <button 
                  onClick={() => handleDownload('txt')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#eee] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#0C1E36] transition-all"
                >
                  TXT
                </button>
              </div>
            )}
            {!isReadOnly && canEditType && (
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#eee] rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#0C1E36] transition-all disabled:opacity-50 shadow-sm"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-[#C89311]" /> : <Save className="w-4 h-4 text-[#C89311]" />}
                Save Progress
              </button>
            )}
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-3 bg-[#0C1E36] text-white px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#C89311] transition-all disabled:opacity-50 shadow-lg shadow-black/10"
            >
              {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              AI Compliance Audit
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative bg-[#FDFCFB]">
             {/* Line Numbers Simulation for technical look */}
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#FDFCFB] border-r border-[#f5f5f5] flex flex-col items-center pt-8 pointer-events-none select-none">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="text-[9px] font-bold text-[#ccc] leading-relaxed mb-[10.5px]">{i + 1}</div>
                ))}
            </div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isReadOnly}
                placeholder="PROMPT: Describe the program needs or budget allocations in detail..."
                className="w-full min-h-full p-8 pl-16 text-lg font-medium leading-relaxed resize-none focus:outline-none bg-transparent text-[#0C1E36] placeholder:text-[#ddd] placeholder:italic"
            />
        </div>

        <div className="px-8 py-4 bg-white border-t border-[#eee] flex items-center justify-between z-10">
           <div className="flex items-center gap-6">
             {!isReadOnly && (
               <button 
                 onClick={handleGetSuggestion}
                 disabled={isGeneratingSuggestion}
                 className="flex items-center gap-3 text-[#0052FF] hover:bg-blue-50 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 border border-transparent hover:border-blue-100"
               >
                 {isGeneratingSuggestion ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                 AI Content Assist
               </button>
             )}
             <div className="h-4 w-px bg-[#eee]" />
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-[#999]">
                <div className="flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5" />
                    History: {history[0] || 'No edits'}
                </div>
             </div>
           </div>
           <div className="flex items-center gap-4 text-[10px] font-black text-[#999] uppercase tracking-widest">
             <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                {content.split(/\s+/).filter(Boolean).length} Words
             </div>
             <div className="w-1 h-1 bg-[#ccc] rounded-full" />
             <div className="flex items-center gap-1.5 text-[#0C1E36]">
                <Clock className="w-3.5 h-3.5" />
                DRAFT · {documentStatus.toUpperCase()}
             </div>
           </div>
        </div>
      </div>

      {/* Analysis Sidebar */}
      <div className="w-[440px] bg-white flex flex-col overflow-y-auto border-l border-[#eee]">
        <div className="p-8 border-b border-[#eee] sticky top-0 bg-white z-20">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-black text-2xl tracking-tight text-[#0C1E36]">SKompas Advisor</h3>
            <div className="px-2 py-0.5 bg-green-50 text-green-600 border border-green-100 rounded md text-[8px] font-black uppercase tracking-widest">Live Engine</div>
          </div>
          <p className="text-[10px] text-[#999] font-black uppercase tracking-[0.25em]">Explainable Hybrid Audit System</p>
        </div>

        <div className="p-8 space-y-10">
          <AnimatePresence mode="wait">
            {!report && !suggestion && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-[#FDFCFB] border border-[#eee] rounded-[32px] flex items-center justify-center text-[#ccc] shadow-inner">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <div>
                  <p className="font-black text-lg text-[#0C1E36] tracking-tight">System Idle</p>
                  <p className="text-[11px] text-[#888] max-w-[240px] mx-auto mt-3 font-semibold leading-relaxed uppercase tracking-wider">
                    Awaiting input signals. Click 'AI Compliance Audit' to trigger the advisory processor.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 w-full pt-4">
                    <div className="p-3 bg-[#FDFCFB] border border-[#eee] rounded-2xl flex flex-col items-center gap-2">
                        <Info className="w-4 h-4 text-blue-400" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#999]">Legal Context</span>
                    </div>
                    <div className="p-3 bg-[#FDFCFB] border border-[#eee] rounded-2xl flex flex-col items-center gap-2">
                        <ArrowRight className="w-4 h-4 text-orange-400" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-[#999]">Auto-Fix Ups</span>
                    </div>
                </div>
              </motion.div>
            )}

            {suggestion && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-blue-50/40 border border-blue-100 rounded-[40px] p-8 mt-4"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-800">AI Component Suggestion</h4>
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
                    className="mt-8 w-full py-3.5 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 active:scale-95"
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
                className="space-y-10"
              >
                {/* Visual Score Card */}
                <div className="p-8 bg-[#0C1E36] rounded-[48px] text-white shadow-2xl shadow-black/20 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/10 transition-colors" />
                  
                  <div className="flex items-end justify-between mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-black tracking-tighter">{report.score}</span>
                      <span className="text-xs font-black text-white/40 uppercase tracking-widest">/ 100</span>
                    </div>
                    <div className="w-14 h-14 bg-white/10 rounded-[20px] flex items-center justify-center backdrop-blur-md">
                      {report.status === "Compliant" ? <CheckCircle className="w-7 h-7 text-green-400" /> : <AlertTriangle className="w-7 h-7 text-orange-400" />}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span>Compliance Status</span>
                        <span className={report.score > 80 ? 'text-green-400' : 'text-orange-400'}>{report.status}</span>
                    </div>
                    <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
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
                  <div className="space-y-6">
                    <h4 className="flex items-center gap-3 text-[10px] font-black text-[#0C1E36] uppercase tracking-[0.3em] pl-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                      Critical Compliance Violations
                    </h4>
                    {report.violations.map((v, i) => (
                      <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-7 bg-[#FDFCFB] border border-red-100 rounded-[32px] space-y-4 hover:shadow-lg hover:shadow-red-500/5 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-black text-red-500 bg-red-50 px-3 py-1 rounded-full uppercase tracking-widest border border-red-100">{v.section}</span>
                          <button className="text-[9px] font-black text-[#ccc] hover:text-[#0C1E36] transition-colors flex items-center gap-1">
                            <ExternalLink className="w-3 h-3" />
                            VIEW SOURCE
                          </button>
                        </div>
                        <h5 className="text-sm font-black text-[#0C1E36] leading-tight tracking-tight">{v.violation}</h5>
                        <div className="flex flex-wrap gap-1.5">
                          {v.legalCitations.map((cit, ci) => (
                            <span key={ci} className="bg-white text-[8px] px-2.5 py-1 rounded-lg text-red-600 font-bold border border-red-100 uppercase tracking-widest">
                              {cit}
                            </span>
                          ))}
                        </div>
                        <div className="pt-4 mt-2 border-t border-red-50">
                           <div className="text-[11px] text-[#555] italic leading-relaxed font-medium">
                             <ReactMarkdown>{`**Recommendation:** ${v.suggestion}`}</ReactMarkdown>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* 4-Level Alignment Module */}
                <div className="p-8 bg-[#FDFCFB] border border-[#eee] rounded-[40px] space-y-6 border-b-4 border-b-[#C89311]">
                   <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn("w-2 h-2 rounded-full", report.alignmentCheck.aligned ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-amber-500 animate-pulse")} />
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-[#0C1E36]">Structural Alignment</h4>
                        </div>
                        <div className="p-2 bg-white rounded-lg border border-[#eee]">
                            <Info className="w-4 h-4 text-[#ccc]" />
                        </div>
                   </div>
                   <p className="text-[11px] text-[#666] leading-relaxed italic font-medium">{report.alignmentCheck.feedback}</p>
                   
                   <div className="relative pt-4 overflow-hidden rounded-2xl bg-white p-4 border border-[#eee]">
                        <div className="absolute top-0 left-0 w-1 h-full bg-[#eee]" />
                        <div className="flex flex-col gap-4 relative z-10">
                            {[
                                { id: 'PYDP', active: true },
                                { id: 'LYDP', active: true },
                                { id: 'CBYDP', active: true },
                                { id: 'ABYIP', active: true, highlighted: true },
                            ].map((level, li) => (
                                <div key={li} className="flex items-center gap-4">
                                    <div className={cn(
                                        "w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-colors",
                                        level.highlighted ? "bg-[#C89311] scale-150 ring-4 ring-[#C89311]/10" : level.active ? "bg-green-500" : "bg-[#ccc]"
                                    )} />
                                    <span className={cn(
                                        "text-[9px] font-black tracking-widest transition-colors",
                                        level.highlighted ? "text-[#0C1E36]" : "text-[#999]"
                                    )}>{level.id}</span>
                                    {level.highlighted && <div className="ml-auto w-1 h-1 bg-[#C89311] rounded-full" />}
                                </div>
                            ))}
                        </div>
                   </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
