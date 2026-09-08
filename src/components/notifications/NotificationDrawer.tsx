import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bell, 
  CheckCheck, 
  Send, 
  X, 
  AlertTriangle, 
  Info, 
  Megaphone, 
  Building2, 
  Clock, 
  Check, 
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { useAuth } from "../auth/AuthProvider";
import { AppNotification } from "../../types";
import { 
  getAppNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  addAppNotification, 
  MUNICIPAL_BARANGAYS_40 
} from "../../lib/barangayStore";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { role, activeBarangay, user } = useAuth();
  const isLydo = role === "Admin";
  const readerId = isLydo ? "LYDO_OFFICER" : (activeBarangay || "Poblacion");

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [activeTab, setActiveTab] = useState<"inbox" | "compose">("inbox");

  // Compose state for LYDO
  const [dispatchTarget, setDispatchTarget] = useState<string>("All");
  const [dispatchPriority, setDispatchPriority] = useState<"normal" | "urgent" | "announcement">("announcement");
  const [dispatchTitle, setDispatchTitle] = useState("");
  const [dispatchMessage, setDispatchMessage] = useState("");
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const loadNotifications = () => {
    const list = getAppNotifications(isLydo ? "All" : activeBarangay || "Poblacion");
    setNotifications(list);
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener("skompas_notifications_updated", loadNotifications);
    return () => window.removeEventListener("skompas_notifications_updated", loadNotifications);
  }, [activeBarangay, isLydo]);

  const unreadCount = notifications.filter(n => !n.readBy.includes(readerId)).length;

  const handleMarkAsRead = (notifId: string) => {
    markNotificationAsRead(notifId, readerId);
    loadNotifications();
  };

  const handleMarkAllAsRead = () => {
    markAllNotificationsAsRead(readerId);
    loadNotifications();
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchTitle.trim() || !dispatchMessage.trim()) return;

    addAppNotification({
      targetType: dispatchTarget === "All" ? "broadcast" : "private",
      targetBarangay: dispatchTarget,
      title: dispatchTitle.trim(),
      message: dispatchMessage.trim(),
      sender: "Municipal LYDO Officer",
      priority: dispatchPriority
    });

    setDispatchStatus(`Notification dispatched successfully to ${dispatchTarget === "All" ? "all 40 Barangays" : `Barangay ${dispatchTarget}`}!`);
    setDispatchTitle("");
    setDispatchMessage("");
    setTimeout(() => {
      setDispatchStatus(null);
      setActiveTab("inbox");
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[150] flex justify-end bg-black/40 backdrop-blur-xs">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-white shadow-2xl border-l border-amber-200/50 flex flex-col z-10"
        >
          {/* Header */}
          <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-300/40 flex items-center justify-center text-[#C89311]">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-sm text-[#0C1E36] tracking-tight">Official Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[9px] font-black animate-pulse">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                  {isLydo ? "Municipal LYDO Dispatcher" : `Jurisdiction: Brgy. ${activeBarangay || "Poblacion"}`}
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation tabs if LYDO */}
          {isLydo ? (
            <div className="grid grid-cols-2 gap-1 p-2 bg-zinc-100/70 border-b border-zinc-200/50">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all ${
                  activeTab === "inbox" ? "bg-white text-[#0C1E36] shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                Inbox & Activity ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab("compose")}
                className={`py-2 text-[10px] font-black uppercase rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "compose" ? "bg-[#C89311] text-white shadow-xs" : "text-zinc-500 hover:text-zinc-800"
                }`}
              >
                <Send className="w-3 h-3" />
                Dispatch Notice
              </button>
            </div>
          ) : (
            <div className="px-6 py-2.5 bg-amber-50/50 border-b border-amber-200/30 flex items-center justify-between">
              <span className="text-[10px] font-bold text-[#C89311] flex items-center gap-1.5">
                <Building2 className="w-3 h-3" />
                Barangay {activeBarangay || "Poblacion"} Official Channel
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[9px] font-black uppercase tracking-wider text-[#0C1E36] hover:underline flex items-center gap-1"
                >
                  <CheckCheck className="w-3 h-3" />
                  Mark All Read
                </button>
              )}
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {activeTab === "inbox" ? (
              notifications.length === 0 ? (
                <div className="py-16 text-center">
                  <Bell className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-zinc-500">No Notifications Received</p>
                  <p className="text-[10px] text-zinc-400 mt-1">Official dispatches from LYDO will appear here.</p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isRead = notif.readBy.includes(readerId);
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-2xl border transition-all ${
                        isRead 
                          ? "bg-white border-zinc-200/60 opacity-80" 
                          : "bg-amber-50/30 border-amber-300 shadow-xs ring-2 ring-amber-500/5"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                            notif.priority === "urgent"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : notif.priority === "announcement"
                                ? "bg-amber-100 text-[#C89311] border border-amber-200"
                                : "bg-sky-100 text-sky-800 border border-sky-200"
                          }`}>
                            {notif.priority}
                          </span>

                          <span className="text-[8px] font-black uppercase text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                            {notif.targetType === "broadcast" ? "General Broadcast (All 40)" : `Private: Bgy. ${notif.targetBarangay}`}
                          </span>
                        </div>

                        {!isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            title="Mark as Read"
                            className="p-1 hover:bg-emerald-100 text-emerald-600 rounded-md transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <h4 className="text-xs font-black text-[#0C1E36] leading-tight mb-1">
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-zinc-600 leading-relaxed font-medium mb-3">
                        {notif.message}
                      </p>

                      <div className="flex items-center justify-between text-[9px] text-zinc-400 font-semibold pt-2 border-t border-zinc-100">
                        <span>{notif.sender}</span>
                        <span>{new Date(notif.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </motion.div>
                  );
                })
              )
            ) : (
              // COMPOSE TAB FOR LYDO
              <form onSubmit={handleDispatch} className="space-y-4">
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl">
                  <div className="flex items-center gap-2 text-[#C89311] text-xs font-black uppercase tracking-wider mb-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    LYDO Dispatch Center
                  </div>
                  <p className="text-[10px] text-zinc-600 leading-normal">
                    Send general announcements to all 40 barangays or private directives to a single barangay council.
                  </p>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                    Target Barangay Recipient
                  </label>
                  <select
                    value={dispatchTarget}
                    onChange={(e) => setDispatchTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold text-[#0C1E36] focus:outline-none focus:border-[#C89311]"
                  >
                    <option value="All">📢 General Broadcast (All 40 Barangays)</option>
                    {MUNICIPAL_BARANGAYS_40.map(bgy => (
                      <option key={bgy} value={bgy}>🔒 Private: Barangay {bgy}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                    Notification Priority
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["announcement", "urgent", "normal"] as const).map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setDispatchPriority(p)}
                        className={`py-2 text-[9px] font-black uppercase rounded-xl border transition-all ${
                          dispatchPriority === p
                            ? "bg-[#0C1E36] text-white border-[#0C1E36]"
                            : "bg-zinc-50 text-zinc-500 border-zinc-200 hover:bg-zinc-100"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                    Subject / Title
                  </label>
                  <input
                    type="text"
                    value={dispatchTitle}
                    onChange={(e) => setDispatchTitle(e.target.value)}
                    placeholder="e.g. Mandatory Submission of FY 2027 Budget"
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold placeholder-zinc-400 focus:outline-none focus:border-[#C89311]"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block mb-1.5">
                    Official Message
                  </label>
                  <textarea
                    rows={4}
                    value={dispatchMessage}
                    onChange={(e) => setDispatchMessage(e.target.value)}
                    placeholder="Type official guidance, deadline, or compliance requirements here..."
                    className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-semibold placeholder-zinc-400 focus:outline-none focus:border-[#C89311]"
                  />
                </div>

                {dispatchStatus && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded-xl border border-emerald-200 flex items-center gap-2">
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>{dispatchStatus}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-[#C89311] hover:bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Official Notification
                </button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="p-4 bg-zinc-50 border-t border-zinc-100 text-center">
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
              SKOMPAS Municipal Communication Channel • LGU Secure
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
