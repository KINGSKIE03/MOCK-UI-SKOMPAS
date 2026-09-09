import { useState, useEffect } from "react";
import { LogOut, Home, FilePlus, User, Bell, Landmark, Shield, Archive, Building2 } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";
import { useAuth } from "../auth/AuthProvider";
import { NotificationDrawer } from "../notifications/NotificationDrawer";
import { DocumentArchiveManager } from "../archive/DocumentArchiveManager";
import { getAppNotifications } from "../../lib/barangayStore";
const logo = "/src/assets/images/input_file_0.png";

export function Navbar() {
  const { role, logout, user, activeBarangay } = useAuth();
  const location = useLocation();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const checkUnread = () => {
    const readerId = role === 'Admin' ? 'LYDO_OFFICER' : (activeBarangay || 'Poblacion');
    const notifs = getAppNotifications(role === 'Admin' ? 'All' : activeBarangay || 'Poblacion');
    const unread = notifs.filter(n => !n.readBy.includes(readerId)).length;
    setUnreadCount(unread);
  };

  useEffect(() => {
    checkUnread();
    window.addEventListener("skompas_notifications_updated", checkUnread);
    return () => window.removeEventListener("skompas_notifications_updated", checkUnread);
  }, [activeBarangay, role]);

  const navItems = role === 'Admin'
    ? [
        { label: "Monitoring Board", path: "/dashboard", icon: Landmark },
        { label: "Annual Budget", path: "/budget-template", icon: FilePlus }
      ]
    : [
        { label: "Overview", path: "/dashboard", icon: Home },
        { label: "CBYDP Plan", path: "/cbydp-template", icon: FilePlus },
        { label: "ABYIP Program", path: "/abyip-template", icon: FilePlus },
        { label: "Annual Budget", path: "/budget-template", icon: FilePlus }
      ];

  return (
    <>
      <nav className="sticky top-0 z-[100] w-full bg-[#FAF9F5]/90 backdrop-blur-xl border-b border-amber-200/40 px-6 sm:px-8 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8 lg:gap-12">
          <Link to="/dashboard" className="text-2xl font-black tracking-tighter flex items-center gap-4 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white ring-4 ring-amber-500/10 flex items-center justify-center overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <img src={logo} alt="SKOMPAS Logo" className="w-full h-full object-cover scale-[1.42]" />
            </div>
            <div className="flex flex-col">
              <span className="text-[#0C1E36] group-hover:text-[#C89311] transition-colors font-black leading-none">SKOMPAS</span>
              <span className="text-[7.5px] font-black uppercase tracking-widest text-[#C89311] mt-1">Official Portal</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-2.5">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-5 py-2.5 text-[9.5px] uppercase font-black tracking-widest rounded-2xl transition-all duration-300",
                    isActive 
                      ? "bg-[#0C1E36] text-white shadow-lg shadow-[#0C1E36]/15 hover:bg-slate-800" 
                      : "text-zinc-500 hover:bg-amber-100/50 hover:text-[#0C1E36] border border-transparent hover:border-amber-200/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className={cn("w-4 h-4", isActive ? "text-amber-400" : "text-[#C89311]")} />
                    {item.label}
                  </div>
                </Link>
              );
            })}

            {/* Archive / History Quick Link */}
            <button
              onClick={() => setIsArchiveOpen(true)}
              className="px-5 py-2.5 text-[9.5px] uppercase font-black tracking-widest rounded-2xl transition-all duration-300 text-zinc-600 hover:bg-amber-100/50 hover:text-[#0C1E36] border border-transparent hover:border-amber-200/30 flex items-center gap-2"
            >
              <Archive className="w-4 h-4 text-[#C89311]" />
              Archive / History
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          {/* Notifications Bell Trigger */}
          <button 
            onClick={() => setIsNotifOpen(true)}
            className="p-2.5 text-zinc-400 hover:text-[#0C1E36] hover:bg-amber-100/30 transition-all rounded-xl relative"
            title="Official Notifications"
          >
            <Bell className="w-5 h-5 text-[#C89311]" />
            {unreadCount > 0 ? (
              <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 min-w-[18px] text-[8px] font-black bg-rose-500 text-white rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </div>
            ) : (
              <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-emerald-500 rounded-full ring-4 ring-white" />
            )}
          </button>

          {/* Quick Archive button for mobile/tablet */}
          <button
            onClick={() => setIsArchiveOpen(true)}
            className="lg:hidden p-2.5 text-zinc-400 hover:text-[#0C1E36] hover:bg-amber-100/30 transition-all rounded-xl"
            title="Archive / History"
          >
            <Archive className="w-5 h-5 text-[#C89311]" />
          </button>

          <div className="h-8 w-px bg-amber-200/40 hidden md:block" />

          {/* User Profile Chip */}
          <div className="flex items-center gap-3.5 group cursor-default bg-white/70 border border-amber-200/60 px-3.5 sm:px-4 py-1.5 rounded-2xl shadow-xs">
            <div className="flex flex-col items-end hidden sm:flex">
               <span className="text-xs font-black text-[#0C1E36] leading-none">{user?.displayName || 'Official'}</span>
               <span className="text-[8px] font-black text-[#C89311] uppercase tracking-widest mt-1.5 flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5" />
                  {role === 'Admin' ? 'LYDO · 40 Barangays' : `Brgy. ${user?.barangayName || activeBarangay || 'Poblacion'} · ${role}`}
               </span>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-[#0C1E36] to-slate-800 text-amber-400 rounded-xl flex items-center justify-center shadow-inner">
              <User className="w-4 h-4" />
            </div>
          </div>
          
          <button 
            onClick={logout}
            className="p-2.5 sm:p-3 text-zinc-400 hover:text-rose-600 transition-all rounded-2xl hover:bg-rose-50 border border-transparent hover:border-rose-100"
            title="Secure Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* Notification Drawer */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />

      {/* Archive Modal */}
      {isArchiveOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[32px] w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl border border-amber-200/70">
            <DocumentArchiveManager onClose={() => setIsArchiveOpen(false)} isModal={true} />
          </div>
        </div>
      )}
    </>
  );
}

