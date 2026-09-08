import { BarangayAccount, DocumentArchiveItem, AppNotification, UserRole } from "../types";

export const MUNICIPAL_BARANGAYS_40 = [
  "Aguinaldo",
  "Amorcruz (Amor Cruz)",
  "Ampawid",
  "Andap",
  "Anitap",
  "Bagong Silang",
  "Banbanon",
  "Belmonte",
  "Binasbas",
  "Bullucan",
  "Ceboleda (Cebulida)",
  "Concepcion",
  "Datu Ampunan",
  "Datu Davao",
  "Doña Josefa",
  "El Katipunan",
  "Il Papa",
  "Imelda",
  "Inakayan (Inacayan)",
  "Kaligutan",
  "Kapatagan",
  "Kidawa",
  "Kilagding",
  "Kiokmay",
  "Laak / Laac (Poblacion)",
  "Langtud",
  "Longanapan",
  "Mabuhay",
  "Macopa",
  "Malinao",
  "Mangloy",
  "Melale",
  "Naga",
  "New Bethlehem",
  "Panamoren",
  "Sabud",
  "San Antonio",
  "Santa Emilia (Sta. Emilia)",
  "Santo Niño (Sto. Niño)",
  "Sisimon"
] as const;

export type MunicipalBarangay = typeof MUNICIPAL_BARANGAYS_40[number];

// Initial seeded accounts: Empty so only LYDO officer remains
const INITIAL_ACCOUNTS: BarangayAccount[] = [];

// Initial seeded archives: Empty
const INITIAL_ARCHIVES: DocumentArchiveItem[] = [];

// Initial seeded notifications
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-laak-initial-1",
    targetType: "broadcast",
    targetBarangay: "All",
    title: "Official Notice: 40 Barangays of the Municipality of Laak",
    message: "Greetings to all Sangguniang Kabataan Councils across the 40 barangays of the Municipality of Laak, Davao de Oro. The SKOMPAS municipal registry has been reset. Only the Municipal LYDO Officer is currently active. SK Chairpersons, Secretaries, and Treasurers must register their official barangay accounts through the portal for LYDO accreditation before submitting statutory planning and financial documents.",
    sender: "Municipal LYDO Officer",
    priority: "announcement",
    createdAt: new Date().toISOString(),
    readBy: []
  }
];

// Keys for local persistence (v3 for clean Laak reset)
const STORAGE_KEYS = {
  ACCOUNTS: "skompas_barangay_accounts_laak_v3",
  ARCHIVES: "skompas_document_archives_laak_v3",
  NOTIFICATIONS: "skompas_notifications_laak_v3",
  DOC_SUBMISSIONS: "skompas_document_submissions_laak_v3",
  RECORDS: "skompas_barangay_records_laak_v3"
};

// Global reset function ensuring all registered barangays are purged, only LYDO remains
export function resetAllBarangays(): void {
  try {
    localStorage.removeItem("skompas_barangay_accounts_v1");
    localStorage.removeItem("skompas_barangay_accounts_v2");
    localStorage.removeItem("skompas_document_archives_v1");
    localStorage.removeItem("skompas_document_archives_v2");
    localStorage.removeItem("skompas_document_submissions_v1");
    localStorage.removeItem("skompas_document_submissions_v2");
    localStorage.removeItem("skompas_notifications_v1");
    localStorage.removeItem("skompas_notifications_v2");
    localStorage.removeItem("skompas_barangay_records");

    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.DOC_SUBMISSIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));

    // If current session is a barangay user (non-Admin), reset session to login
    const currentRole = localStorage.getItem("sk_mock_role");
    if (currentRole && currentRole !== "Admin") {
      localStorage.removeItem("sk_mock_user");
      localStorage.removeItem("sk_mock_role");
      localStorage.removeItem("sk_active_barangay");
    }

    window.dispatchEvent(new Event("skompas_accounts_updated"));
    window.dispatchEvent(new Event("skompas_submissions_updated"));
    window.dispatchEvent(new Event("skompas_archives_updated"));
    window.dispatchEvent(new Event("skompas_notifications_updated"));
    window.dispatchEvent(new Event("skompas_records_updated"));
  } catch (e) {
    console.error("Error resetting barangay data:", e);
  }
}

// Auto-run legacy cleanup once on load if older storage keys are found
if (typeof window !== "undefined") {
  try {
    if (
      localStorage.getItem("skompas_barangay_accounts_v2") || 
      localStorage.getItem("skompas_barangay_accounts_v1") ||
      !localStorage.getItem(STORAGE_KEYS.ACCOUNTS)
    ) {
      resetAllBarangays();
    }
  } catch (e) {
    // Ignore storage access errors
  }
}

// --- Accounts Management ---
export function getBarangayAccounts(): BarangayAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    const accounts: BarangayAccount[] = JSON.parse(raw);
    const validBarangays = new Set<string>(MUNICIPAL_BARANGAYS_40);
    const filtered = accounts.filter(a => validBarangays.has(a.barangayName));
    if (filtered.length !== accounts.length) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(filtered));
      return filtered;
    }
    return accounts;
  } catch (e) {
    console.error("Error reading barangay accounts", e);
    return INITIAL_ACCOUNTS;
  }
}

export function saveBarangayAccounts(accounts: BarangayAccount[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
    window.dispatchEvent(new Event("skompas_accounts_updated"));
  } catch (e) {
    console.error("Error saving barangay accounts", e);
  }
}

export function registerBarangayAccount(params: {
  barangayName: string;
  officerName: string;
  role: "Chairman" | "Secretary" | "Treasurer";
  email: string;
  password?: string;
  contactNumber?: string;
}): { success: boolean; message: string; account?: BarangayAccount } {
  const accounts = getBarangayAccounts();
  const normalizedEmail = params.email.trim().toLowerCase();

  // Check if email already registered
  if (accounts.some(a => a.email.toLowerCase() === normalizedEmail)) {
    return { 
      success: false, 
      message: "An official account with this email address already exists in the registry." 
    };
  }

  // Check maximum 40 barangays limit constraint
  const uniqueBarangaysRegistered = new Set(accounts.map(a => a.barangayName));
  if (!uniqueBarangaysRegistered.has(params.barangayName) && uniqueBarangaysRegistered.size >= 40) {
    return {
      success: false,
      message: "The municipal system has reached the statutory maximum limit of 40 barangays."
    };
  }

  const newAccount: BarangayAccount = {
    id: `acct-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    barangayName: params.barangayName,
    officerName: params.officerName,
    role: params.role,
    email: normalizedEmail,
    password: params.password || "pass123",
    contactNumber: params.contactNumber || "",
    status: "pending",
    registeredAt: new Date().toISOString()
  };

  accounts.push(newAccount);
  saveBarangayAccounts(accounts);

  // Send an automated notification to LYDO log
  addAppNotification({
    targetType: "private",
    targetBarangay: params.barangayName,
    title: "New Registration Awaiting Review",
    message: `Account registration received for ${params.officerName} (${params.role}) of Barangay ${params.barangayName}. Pending LYDO verification.`,
    sender: "SKOMPAS Registration Gateway",
    priority: "normal"
  });

  return {
    success: true,
    message: "Registration submitted successfully! Your account is queued for review by the Municipal LYDO Officer.",
    account: newAccount
  };
}

export function approveBarangayAccount(accountId: string, officerName: string = "Municipal LYDO Officer"): boolean {
  const accounts = getBarangayAccounts();
  const index = accounts.findIndex(a => a.id === accountId);
  if (index === -1) return false;

  const target = accounts[index];
  target.status = "approved";
  target.approvedAt = new Date().toISOString();
  target.approvedBy = officerName;

  saveBarangayAccounts(accounts);

  // Notify the barangay
  addAppNotification({
    targetType: "private",
    targetBarangay: target.barangayName,
    title: "Account Registration Approved",
    message: `Congratulations! Your SKOMPAS official workspace account for Barangay ${target.barangayName} (${target.role}) has been officially verified and approved by the Municipal LYDO. You may now access all governance modules.`,
    sender: officerName,
    priority: "announcement"
  });

  return true;
}

export function rejectBarangayAccount(
  accountId: string, 
  reason: string = "Incomplete municipal credential verification",
  _reviewerName: string = "Municipal LYDO Officer"
): boolean {
  const accounts = getBarangayAccounts();
  const index = accounts.findIndex(a => a.id === accountId);
  if (index === -1) return false;

  accounts[index].status = "rejected";
  accounts[index].rejectionReason = reason;

  saveBarangayAccounts(accounts);
  return true;
}

// --- Document Archive Management ---
export type ArchiveDocument = DocumentArchiveItem;

export function getDocumentArchives(barangayName?: string): DocumentArchiveItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ARCHIVES);
    let all: DocumentArchiveItem[] = raw ? JSON.parse(raw) : INITIAL_ARCHIVES;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(INITIAL_ARCHIVES));
    }
    if (barangayName && barangayName !== "All") {
      return all.filter(a => a.barangayName.toLowerCase() === barangayName.toLowerCase());
    }
    return all;
  } catch (e) {
    console.error("Error reading archives", e);
    return INITIAL_ARCHIVES;
  }
}

export const getBarangayArchives = getDocumentArchives;

export function archiveDocument(item: Omit<DocumentArchiveItem, "id" | "archivedAt">): DocumentArchiveItem {
  const archives = getDocumentArchives();
  const newArchiveItem: DocumentArchiveItem = {
    ...item,
    id: `arch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    archivedAt: new Date().toISOString()
  };

  archives.unshift(newArchiveItem);
  try {
    localStorage.setItem(STORAGE_KEYS.ARCHIVES, JSON.stringify(archives));
    window.dispatchEvent(new Event("skompas_archives_updated"));
  } catch (e) {
    console.error("Error saving archive item", e);
  }
  return newArchiveItem;
}

// Automatic archiving helper: when a new year/document is submitted/approved, move the previous approved doc of that type to archive
export function autoArchivePreviousDocument(params: {
  barangayName: string;
  docType: "CBYDP" | "ABYIP" | "Annual Budget";
  previousYearOrPeriod: string;
  title: string;
  approvedBy?: string;
  totalBudget?: number;
  remarks?: string;
  summaryData?: Record<string, any>;
}) {
  const archives = getDocumentArchives();
  // Check if an archive for this barangay, docType, and period already exists
  const alreadyArchived = archives.some(
    a => a.barangayName === params.barangayName &&
         a.docType === params.docType &&
         a.yearOrPeriod === params.previousYearOrPeriod
  );

  if (!alreadyArchived) {
    archiveDocument({
      barangayName: params.barangayName,
      docType: params.docType,
      yearOrPeriod: params.previousYearOrPeriod,
      title: params.title,
      status: "archived",
      approvedBy: params.approvedBy || "Municipal LYDO Officer",
      totalBudget: params.totalBudget,
      remarks: params.remarks || `Automatically moved to historical archive upon creation of newer planning period.`,
      summaryData: params.summaryData
    });
  }
}

// --- Notifications Management ---
export function getAppNotifications(userBarangayName?: string): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    let all: AppNotification[] = raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    }
    
    // Sort latest first
    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (!userBarangayName || userBarangayName === "Admin" || userBarangayName === "All") {
      return all;
    }

    // Filter to broadcast OR targeted to this specific barangay
    return all.filter(n => 
      n.targetType === "broadcast" || 
      n.targetBarangay.toLowerCase() === "all" ||
      n.targetBarangay.toLowerCase() === userBarangayName.toLowerCase()
    );
  } catch (e) {
    console.error("Error reading notifications", e);
    return INITIAL_NOTIFICATIONS;
  }
}

export function addAppNotification(item: Omit<AppNotification, "id" | "createdAt" | "readBy">): AppNotification {
  const notifications = getAppNotifications();
  const newNotif: AppNotification = {
    ...item,
    id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
    readBy: []
  };

  notifications.unshift(newNotif);
  try {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    window.dispatchEvent(new Event("skompas_notifications_updated"));
  } catch (e) {
    console.error("Error saving notification", e);
  }
  return newNotif;
}

export function markNotificationAsRead(notifId: string, readerIdentifier: string) {
  const notifications = getAppNotifications();
  const target = notifications.find(n => n.id === notifId);
  if (target) {
    if (!target.readBy.includes(readerIdentifier)) {
      target.readBy.push(readerIdentifier);
      try {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        window.dispatchEvent(new Event("skompas_notifications_updated"));
      } catch (e) {
        console.error("Error updating read state", e);
      }
    }
  }
}

export function markAllNotificationsAsRead(readerIdentifier: string) {
  const notifications = getAppNotifications();
  let changed = false;
  notifications.forEach(n => {
    if (!n.readBy.includes(readerIdentifier)) {
      n.readBy.push(readerIdentifier);
      changed = true;
    }
  });
  if (changed) {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
      window.dispatchEvent(new Event("skompas_notifications_updated"));
    } catch (e) {
      console.error("Error marking all read", e);
    }
  }
}

// --- LYDO Document Submissions & Review Queue ---
export interface DocumentSubmission {
  id: string;
  barangayName: string;
  docCode: string;
  docType: "CBYDP" | "ABYIP" | "Annual Budget" | "Table 1 Compliance";
  title: string;
  yearOrPeriod: string;
  submittedBy: string;
  officerRole: UserRole;
  submittedAt: string;
  status: "pending_review" | "approved" | "rejected";
  reviewedAt?: string;
  reviewedBy?: string;
  remarks?: string;
  reviewNotes?: string;
  totalBudget?: number;
  contentSnapshot?: any;
}

export type DocumentSubmissionItem = DocumentSubmission;

const INITIAL_SUBMISSIONS: DocumentSubmission[] = [];

export function getDocumentSubmissions(barangayName?: string): DocumentSubmission[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOC_SUBMISSIONS);
    let all: DocumentSubmission[] = raw ? JSON.parse(raw) : INITIAL_SUBMISSIONS;
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DOC_SUBMISSIONS, JSON.stringify(INITIAL_SUBMISSIONS));
    }
    if (barangayName && barangayName !== "All" && barangayName !== "Admin") {
      return all.filter(s => s.barangayName.toLowerCase() === barangayName.toLowerCase());
    }
    return all;
  } catch (e) {
    console.error("Error reading submissions", e);
    return INITIAL_SUBMISSIONS;
  }
}

export function saveDocumentSubmission(sub: Omit<DocumentSubmission, "id" | "submittedAt" | "status">): DocumentSubmission {
  const submissions = getDocumentSubmissions();
  const newSub: DocumentSubmission = {
    ...sub,
    id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    submittedAt: new Date().toISOString(),
    status: "pending_review"
  };

  submissions.unshift(newSub);
  try {
    localStorage.setItem(STORAGE_KEYS.DOC_SUBMISSIONS, JSON.stringify(submissions));
    window.dispatchEvent(new Event("skompas_submissions_updated"));
  } catch (e) {
    console.error("Error saving submission", e);
  }

  // Automated notification to LYDO
  addAppNotification({
    targetType: "broadcast",
    targetBarangay: "All",
    title: `New Document Submitted: ${sub.title}`,
    message: `${sub.barangayName} submitted ${sub.docType} (${sub.yearOrPeriod}) for statutory review and approval.`,
    sender: `${sub.barangayName} SK Council`,
    priority: "normal"
  });

  return newSub;
}

// --- Barangay Official Records ---
export interface BarangayRecord {
  id: string;
  barangayName: string;
  docType: "CBYDP" | "ABYIP" | "Annual Budget" | "Table 1 Compliance";
  title: string;
  yearOrPeriod: string;
  approvedAt: string;
  approvedBy: string;
  totalBudget?: number;
  contentSnapshot?: any;
}

export function getBarangayRecords(barangayName?: string): BarangayRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.RECORDS);
    let all: BarangayRecord[] = raw ? JSON.parse(raw) : [];
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify([]));
    }
    if (barangayName && barangayName !== "All" && barangayName !== "Admin") {
      return all.filter(r => r.barangayName.toLowerCase() === barangayName.toLowerCase());
    }
    return all;
  } catch (e) {
    return [];
  }
}

export function saveBarangayRecord(record: BarangayRecord) {
  try {
    const existing = getBarangayRecords();
    const updated = [record, ...existing.filter(r => r.id !== record.id)];
    localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
    window.dispatchEvent(new Event("skompas_records_updated"));
  } catch (e) {
    console.error("Error saving barangay record", e);
  }
}

export function reviewDocumentSubmission(params: {
  submissionId: string;
  status: "approved" | "rejected";
  reviewedBy?: string;
  remarks?: string;
  reviewNotes?: string;
}): boolean {
  const submissions = getDocumentSubmissions();
  const target = submissions.find(s => s.id === params.submissionId);
  if (!target) return false;

  const finalRemarks = params.remarks || params.reviewNotes || (params.status === "approved" ? "Officially approved by LYDO." : "Revisions requested.");

  target.status = params.status;
  target.reviewedAt = new Date().toISOString();
  target.reviewedBy = params.reviewedBy || "Municipal LYDO Officer";
  target.remarks = finalRemarks;
  target.reviewNotes = finalRemarks;

  try {
    localStorage.setItem(STORAGE_KEYS.DOC_SUBMISSIONS, JSON.stringify(submissions));
    window.dispatchEvent(new Event("skompas_submissions_updated"));
  } catch (e) {
    console.error("Error updating submission", e);
  }

  // If approved, save to barangay official records AND auto-archive old previous documents of this type
  if (params.status === "approved") {
    // 1. Save in Barangay Official Records
    saveBarangayRecord({
      id: `rec-${target.id}`,
      barangayName: target.barangayName,
      docType: target.docType,
      title: target.title,
      yearOrPeriod: target.yearOrPeriod,
      approvedAt: target.reviewedAt,
      approvedBy: target.reviewedBy,
      totalBudget: target.totalBudget,
      contentSnapshot: target.contentSnapshot
    });

    // 2. Auto-archive any previous approved document of the same docType for this barangay
    const allRecords = getBarangayRecords(target.barangayName);
    const olderRecords = allRecords.filter(
      r => r.docType === target.docType && r.yearOrPeriod !== target.yearOrPeriod
    );

    olderRecords.forEach(oldRec => {
      autoArchivePreviousDocument({
        barangayName: oldRec.barangayName,
        docType: oldRec.docType as any,
        previousYearOrPeriod: oldRec.yearOrPeriod,
        title: oldRec.title,
        approvedBy: oldRec.approvedBy,
        totalBudget: oldRec.totalBudget,
        remarks: `Archived automatically upon approval of new document cycle (${target.yearOrPeriod}).`
      });
    });

    // Also auto-archive in general archives list
    if (target.docType === "CBYDP" || target.docType === "ABYIP" || target.docType === "Annual Budget") {
      archiveDocument({
        barangayName: target.barangayName,
        docType: target.docType,
        yearOrPeriod: target.yearOrPeriod,
        title: target.title,
        status: "approved_historical",
        approvedBy: target.reviewedBy,
        totalBudget: target.totalBudget,
        remarks: "Approved by Municipal LYDO Officer and recorded into municipal historical archive."
      });
    }

    // 3. Notify the specific barangay
    addAppNotification({
      targetType: "private",
      targetBarangay: target.barangayName,
      title: `Document Approved: ${target.title}`,
      message: `Your ${target.docType} for ${target.yearOrPeriod} has been officially APPROVED by the Municipal LYDO Officer and certified into the barangay records.`,
      sender: "Municipal LYDO Officer",
      priority: "announcement"
    });
  } else {
    addAppNotification({
      targetType: "private",
      targetBarangay: target.barangayName,
      title: `Revision Requested: ${target.title}`,
      message: `The Municipal LYDO Officer has reviewed your ${target.docType} and requested revisions: "${finalRemarks}". Please update and re-submit.`,
      sender: "Municipal LYDO Officer",
      priority: "urgent"
    });
  }

  return true;
}
