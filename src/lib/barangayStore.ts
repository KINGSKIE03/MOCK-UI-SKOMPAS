import { BarangayAccount, DocumentArchiveItem, AppNotification, UserRole } from "../types";

export const MUNICIPAL_BARANGAYS_40 = [
  "Poblacion", "San Jose", "Santa Maria", "San Vicente", "San Pedro", 
  "Santo Domingo", "Concepcion", "San Juan", "Santa Ana", "San Andres", 
  "San Mateo", "San Isidro", "Magsaysay", "Quezon", "Rizal", 
  "Baler", "Maligno", "San Francisco", "San Roque", "Santa Catalina", 
  "Santa Rosa", "Santiago", "San Agustin", "Santo Tomas", "Lucban", 
  "San Miguel", "Del Pilar", "Caloocan", "San Antonio", "Malabon", 
  "San Lorenzo", "Balantay", "San Rafael", "San Gabriel", "Santa Clara", 
  "San Felipe", "San Nicolas", "Pandan", "Cabanas", "San Simon"
] as const;

export type MunicipalBarangay = typeof MUNICIPAL_BARANGAYS_40[number];

// Initial seeded accounts for immediate testing
const INITIAL_ACCOUNTS: BarangayAccount[] = [
  {
    id: "acct-poblacion-chair",
    barangayName: "Poblacion",
    officerName: "Hon. Juan Dela Cruz",
    role: "Chairman",
    email: "chairman@sk.gov.ph",
    password: "chair123",
    contactNumber: "0917-555-0101",
    status: "approved",
    registeredAt: "2026-01-15T08:30:00Z",
    approvedAt: "2026-01-15T10:00:00Z",
    approvedBy: "Municipal LYDO Officer"
  },
  {
    id: "acct-poblacion-sec",
    barangayName: "Poblacion",
    officerName: "Maria Santos",
    role: "Secretary",
    email: "secretary@sk.gov.ph",
    password: "sec123",
    contactNumber: "0918-555-0102",
    status: "approved",
    registeredAt: "2026-01-15T09:00:00Z",
    approvedAt: "2026-01-15T10:15:00Z",
    approvedBy: "Municipal LYDO Officer"
  },
  {
    id: "acct-poblacion-treas",
    barangayName: "Poblacion",
    officerName: "Pedro Penduko",
    role: "Treasurer",
    email: "treasurer@sk.gov.ph",
    password: "treas123",
    contactNumber: "0919-555-0103",
    status: "approved",
    registeredAt: "2026-01-15T09:30:00Z",
    approvedAt: "2026-01-15T10:30:00Z",
    approvedBy: "Municipal LYDO Officer"
  },
  {
    id: "acct-sanjose-chair",
    barangayName: "San Jose",
    officerName: "Hon. Gabriel Reyes",
    role: "Chairman",
    email: "sanjose.chair@sk.gov.ph",
    password: "sanjose123",
    contactNumber: "0920-555-0201",
    status: "pending",
    registeredAt: "2026-09-07T14:20:00Z"
  },
  {
    id: "acct-santamaria-sec",
    barangayName: "Santa Maria",
    officerName: "Clara Garcia",
    role: "Secretary",
    email: "santamaria.sec@sk.gov.ph",
    password: "maria123",
    contactNumber: "0921-555-0301",
    status: "pending",
    registeredAt: "2026-09-08T08:10:00Z"
  }
];

// Initial seeded archives for Annual Budget, ABYIP, and CBYDP
const INITIAL_ARCHIVES: DocumentArchiveItem[] = [
  {
    id: "arch-cbydp-2023-2026-pob",
    docType: "CBYDP",
    barangayName: "Poblacion",
    yearOrPeriod: "2023-2026",
    title: "Comprehensive Barangay Youth Development Plan (2023-2026 Cycle)",
    status: "archived",
    archivedAt: "2026-01-10T12:00:00Z",
    approvedBy: "Municipal LYDO Officer & DILG",
    totalBudget: 1200000,
    remarks: "Superseded by 2026-2029 3-year rolling plan upon term turnover.",
    summaryData: {
      cycles: "3-Year Mandatory",
      keyPillars: "Education grants, anti-drug sports clinics, ecological solid waste"
    }
  },
  {
    id: "arch-abyip-2025-pob",
    docType: "ABYIP",
    barangayName: "Poblacion",
    yearOrPeriod: "2025",
    title: "Annual Barangay Youth Investment Program FY 2025",
    status: "approved_historical",
    archivedAt: "2025-12-31T23:59:59Z",
    approvedBy: "Municipal LYDO Officer",
    totalBudget: 850000,
    remarks: "Fully executed and audited. 98% fund utilization rate.",
    summaryData: {
      activitiesCount: 14,
      primaryFocus: "Youth Skills & Livelihood Training"
    }
  },
  {
    id: "arch-budget-2025-pob",
    docType: "Annual Budget",
    barangayName: "Poblacion",
    yearOrPeriod: "2025",
    title: "SK Annual Budget FY 2025 (P.S., MOOE & CO Allocation)",
    status: "approved_historical",
    archivedAt: "2025-12-31T23:59:59Z",
    approvedBy: "Sangguniang Bayan & Municipal LYDO",
    totalBudget: 850000,
    remarks: "Official COA post-audit passed with zero Notice of Disallowance.",
    summaryData: {
      generalAdmin: 210000,
      ydepPrograms: 640000
    }
  },
  {
    id: "arch-cbydp-2023-2026-sj",
    docType: "CBYDP",
    barangayName: "San Jose",
    yearOrPeriod: "2023-2026",
    title: "Comprehensive Barangay Youth Development Plan (2023-2026 Cycle)",
    status: "archived",
    archivedAt: "2026-01-08T09:00:00Z",
    approvedBy: "Municipal LYDO Officer",
    totalBudget: 980000,
    remarks: "Archived during midterm alignment review."
  },
  {
    id: "arch-budget-2025-sj",
    docType: "Annual Budget",
    barangayName: "San Jose",
    yearOrPeriod: "2025",
    title: "SK Annual Budget FY 2025",
    status: "approved_historical",
    archivedAt: "2025-12-28T16:00:00Z",
    approvedBy: "Municipal LYDO Officer",
    totalBudget: 740000,
    remarks: "Year-end financial reconciliation approved."
  }
];

// Initial seeded notifications
const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-gen-1",
    targetType: "broadcast",
    targetBarangay: "All",
    title: "Mandatory Submission of FY 2027 ABYIP Drafts",
    message: "Greetings to all 40 Barangay SK Councils. Please be reminded that the draft of the Annual Barangay Youth Investment Program (ABYIP) must be submitted through SKOMPAS on or before the upcoming statutory deadline for LYDO compliance verification.",
    sender: "Municipal LYDO Officer",
    priority: "announcement",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    readBy: []
  },
  {
    id: "notif-priv-1",
    targetType: "private",
    targetBarangay: "San Jose",
    title: "Action Required: Clarification on CBYDP Health Cluster Budget",
    message: "Barangay San Jose SK Officials: Please review the Health and Wellness cluster allocation in your CBYDP submission. Additional justification is requested under DILG MC 2019-151 before final stamp approval.",
    sender: "Municipal LYDO Officer",
    priority: "urgent",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    readBy: []
  }
];

// Keys for local persistence
const STORAGE_KEYS = {
  ACCOUNTS: "skompas_barangay_accounts_v2",
  ARCHIVES: "skompas_document_archives_v2",
  NOTIFICATIONS: "skompas_notifications_v2",
  DOC_SUBMISSIONS: "skompas_document_submissions_v2"
};

// --- Accounts Management ---
export function getBarangayAccounts(): BarangayAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(INITIAL_ACCOUNTS));
      return INITIAL_ACCOUNTS;
    }
    return JSON.parse(raw);
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

const INITIAL_SUBMISSIONS: DocumentSubmission[] = [
  {
    id: "sub-1",
    barangayName: "Poblacion",
    docCode: "CBYDP",
    docType: "CBYDP",
    title: "Comprehensive Barangay Youth Development Plan (2026-2029)",
    yearOrPeriod: "2026-2029",
    submittedBy: "Maria Santos (SK Secretary)",
    officerRole: "Secretary",
    submittedAt: "2026-05-10T11:00:00Z",
    status: "approved",
    reviewedAt: "2026-05-12T14:30:00Z",
    reviewedBy: "Municipal LYDO Officer",
    reviewNotes: "Aligned with municipal youth development priority pillars.",
    totalBudget: 400000
  },
  {
    id: "sub-2",
    barangayName: "Poblacion",
    docCode: "ABYIP",
    docType: "ABYIP",
    title: "Annual Barangay Youth Investment Program FY 2026",
    yearOrPeriod: "2026",
    submittedBy: "Maria Santos & Pedro Penduko",
    officerRole: "Secretary",
    submittedAt: "2026-05-12T15:00:00Z",
    status: "approved",
    reviewedAt: "2026-05-13T09:00:00Z",
    reviewedBy: "Municipal LYDO Officer",
    reviewNotes: "Formally endorsed to Sangguniang Bayan.",
    totalBudget: 400000
  },
  {
    id: "sub-3",
    barangayName: "San Jose",
    docCode: "ANNUAL-BUDGET",
    docType: "Annual Budget",
    title: "SK Annual Budget FY 2026",
    yearOrPeriod: "2026",
    submittedBy: "Hon. Gabriel Reyes (Chairman)",
    officerRole: "Chairman",
    submittedAt: "2026-09-07T16:00:00Z",
    status: "pending_review",
    totalBudget: 954653.30,
    reviewNotes: "Awaiting final verification of MOOE budget ceiling."
  },
  {
    id: "sub-4",
    barangayName: "Santa Maria",
    docCode: "ABYIP",
    docType: "ABYIP",
    title: "Annual Barangay Youth Investment Program FY 2026",
    yearOrPeriod: "2026",
    submittedBy: "Clara Garcia (Secretary)",
    officerRole: "Secretary",
    submittedAt: "2026-09-08T09:15:00Z",
    status: "pending_review",
    totalBudget: 620000
  }
];

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
    const raw = localStorage.getItem("skompas_barangay_records");
    let all: BarangayRecord[] = raw ? JSON.parse(raw) : [];
    if (!raw) {
      // Seed default approved records for demo barangays
      all = [
        {
          id: "rec-pob-1",
          barangayName: "Poblacion",
          docType: "CBYDP",
          title: "Comprehensive Barangay Youth Development Plan (2026-2029)",
          yearOrPeriod: "2026-2029",
          approvedAt: "2026-05-12T14:30:00Z",
          approvedBy: "Municipal LYDO Officer",
          totalBudget: 400000
        },
        {
          id: "rec-pob-2",
          barangayName: "Poblacion",
          docType: "ABYIP",
          title: "Annual Barangay Youth Investment Program FY 2026",
          yearOrPeriod: "2026",
          approvedAt: "2026-05-13T09:00:00Z",
          approvedBy: "Municipal LYDO Officer",
          totalBudget: 400000
        }
      ];
      localStorage.setItem("skompas_barangay_records", JSON.stringify(all));
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
    localStorage.setItem("skompas_barangay_records", JSON.stringify(updated));
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
