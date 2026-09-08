// Official Sangguniang Kabataan Compliance Templates
// Source: Document Preparation Monitoring Table, SK Office, Municipality of Laak, Davao de Oro.

export type DocumentFrequency =
  | "3-year rolling plan"
  | "Yearly"
  | "Every 6 months"
  | "Every 3 months"
  | "Every 3 months and yearly"
  | "Every month"
  | "Every transaction";

export interface ComplianceDocument {
  id: string;
  code: string;
  title: string;
  frequency: DocumentFrequency;
  officerResponsible: string;
  assignedTo: "Secretary" | "Treasurer" | "Both";
  status: "Draft" | "In Progress" | "Submitted" | "Approved";
  lastUpdated: string;
  updatedBy: string;
  contentDraft: string;
  templateFields: Record<string, string>;
  history: Array<{
    timestamp: string;
    action: string;
    user: string;
    details: string;
  }>;
}

export interface ComplianceMetadata {
  code: string;
  title: string;
  frequency: DocumentFrequency;
  officerResponsible: string;
  assignedTo: "Secretary" | "Treasurer" | "Both";
  description: string;
}

export const TABLE_SOURCE_CITATION = "Document Preparation Monitoring Table, SK Office, Municipality of Laak, Davao de Oro";

// The 18 official documents from Table 1, strictly segregated by officer responsibility
export const ALL_REQUIRED_METADATA: ComplianceMetadata[] = [
  {
    code: "CBYDP",
    title: "Comprehensive Barangay Youth Development Plan (CBYDP)",
    frequency: "3-year rolling plan",
    officerResponsible: "SK Council with KK / SK Secretary",
    assignedTo: "Secretary",
    description: "Multi-year rolling blueprint outlining priorities, youth development goals, and Katipunan ng Kabataan assembly consultations."
  },
  {
    code: "ABYIP",
    title: "Annual Barangay Youth Investment Program (ABYIP)",
    frequency: "Yearly",
    officerResponsible: "SK Secretary / SK Treasurer",
    assignedTo: "Both",
    description: "Annual priority programming detailing programs, projects, and activities (PPAs) aligned with the approved CBYDP."
  },
  {
    code: "ANNUAL-BUDGET",
    title: "SK Annual Budget",
    frequency: "Yearly",
    officerResponsible: "SK Secretary / SK Treasurer",
    assignedTo: "Both",
    description: "Statutory fiscal plan authorizing itemized expenditures from the 10% Barangay youth allocation for Personal Services, MOOE, and Capital Outlay."
  },
  {
    code: "ACCOMP-REP",
    title: "Accomplishment Report",
    frequency: "Yearly",
    officerResponsible: "SK Secretary",
    assignedTo: "Secretary",
    description: "Annual narrative and statistical documentation of all executed youth programs, beneficiary reach, and physical performance indicators."
  },
  {
    code: "ANNUAL-LIQ",
    title: "Annual Liquidation Report",
    frequency: "Yearly",
    officerResponsible: "SK Treasurer",
    assignedTo: "Treasurer",
    description: "Consolidated year-end accounting statement verifying liquidation of all cash advances, program disbursements, and fund utilization."
  },
  {
    code: "SCBAA",
    title: "Statement of Comparison of Budget and Actual Amounts",
    frequency: "Yearly",
    officerResponsible: "SK Budget Monitoring Officer",
    assignedTo: "Treasurer",
    description: "Fiscal analysis contrasting annual budget appropriations against actual utilization with variance justifications."
  },
  {
    code: "RIPPE",
    title: "Inventory of Purchased Property and Equipment",
    frequency: "Yearly",
    officerResponsible: "SK Inventory Head / Treasurer",
    assignedTo: "Treasurer",
    description: "Annual physical verification and custody logging of all capital outlay assets, electronic gears, audio-visual, and public equipment."
  },
  {
    code: "NOTES-FS",
    title: "Notes to Financial Statements",
    frequency: "Yearly",
    officerResponsible: "SK Treasurer",
    assignedTo: "Treasurer",
    description: "Explanatory disclosures detailing accounting bases, depository accounts, and material operational occurrences accompanying year-end statements."
  },
  {
    code: "RIPSM",
    title: "Inventory of Purchased Supplies and Materials",
    frequency: "Every 6 months",
    officerResponsible: "SK Inventory Head / Treasurer",
    assignedTo: "Treasurer",
    description: "Semi-annual inventory tally of consumable office goods, program supplies, sporting kits, and medical items on hand."
  },
  {
    code: "RBCPB",
    title: "Registry of Budget, Commitments, Payments and Balances",
    frequency: "Every 3 months",
    officerResponsible: "SK Budget Monitoring Officer",
    assignedTo: "Treasurer",
    description: "Quarterly ledger recording appropriations, commitments, check issuances, and available balances per expense class."
  },
  {
    code: "RCRDOT",
    title: "Register of Cash Receipts, Deposits and Other Transactions",
    frequency: "Every 3 months",
    officerResponsible: "SK Treasurer",
    assignedTo: "Treasurer",
    description: "Quarterly chronological record of all cash receipts, internal revenue remittances, deposits to bank, and miscellaneous collections."
  },
  {
    code: "RCIB",
    title: "Registry of Cash in Bank",
    frequency: "Every 3 months",
    officerResponsible: "SK Treasurer",
    assignedTo: "Treasurer",
    description: "Quarterly ledger tracking all deposits made and checks drawn against the authorized government depository bank account."
  },
  {
    code: "RAAF",
    title: "Report of Accountability for Accountable Forms",
    frequency: "Every 3 months",
    officerResponsible: "SK Treasurer",
    assignedTo: "Treasurer",
    description: "Quarterly custodian accounting of official commercial checks, official receipts, and accountable documents showing issued, cancelled, and on-hand balances."
  },
  {
    code: "SBCPB",
    title: "Summary of Budget, Commitments, Payments and Balances",
    frequency: "Every 3 months",
    officerResponsible: "SK Budget Monitoring Officer",
    assignedTo: "Treasurer",
    description: "Executive quarterly summary synthesizing commitment percentages, disbursement velocity, and uncommitted youth funds."
  },
  {
    code: "SRP",
    title: "Statement of Receipts and Payments",
    frequency: "Every 3 months and yearly",
    officerResponsible: "SK Treasurer",
    assignedTo: "Treasurer",
    description: "Quarterly and year-end statement showing all cash inflows received and actual cash payments released with verified ending cash balance."
  },
  {
    code: "BRS",
    title: "Bank Reconciliation Statement (BRS)",
    frequency: "Every month",
    officerResponsible: "SK Treasurer",
    assignedTo: "Treasurer",
    description: "Monthly reconciliation identifying outstanding checks, deposits in transit, and bank charges to prove zero variance between bank and books."
  },
  {
    code: "DV",
    title: "Disbursement Voucher (DV)",
    frequency: "Every transaction",
    officerResponsible: "SK BMO / SK Treasurer",
    assignedTo: "Treasurer",
    description: "Official voucher required for every single financial outlay, verifying claimant, budgetary legality, treasurer certification, and chairman approval."
  },
  {
    code: "LIQ-REP",
    title: "Liquidation Report",
    frequency: "Every transaction",
    officerResponsible: "SK Treasurer",
    assignedTo: "Treasurer",
    description: "Transaction-level liquidation substantiating specific cash advances with attached official receipts, attendance sheets, and refund deposit slips."
  }
];

export const DEFAULT_TEMPLATES: Record<string, { fields: Record<string, string>; content: string }> = {
  "CBYDP": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      coverageYears: "2026-2029",
      youthPopulation: "1,420",
      assemblyDate: "January 24, 2026",
      secretary: "Hon. Maria Santos",
      chairperson: "Hon. Juan dela Cruz",
      priorityPillars: "Education & Tech Skills, Sports & Health, Disaster Preparedness, Environmental Stewardship"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

COMPREHENSIVE BARANGAY YOUTH DEVELOPMENT PLAN (CBYDP)
Planning Horizon: [coverageYears] (3-Year Rolling Plan)

I. EXECUTIVE SUMMARY & JURISDICTION PROFILE
Barangay: [barangay], Municipality of [municipality], Province of [province]
Total Registered Katipunan ng Kabataan (KK) Youth Population: [youthPopulation]
Katipunan ng Kabataan General Assembly Ratification Date: [assemblyDate]

II. STRATEGIC DEVELOPMENT PILLARS & CORE OBJECTIVES
The Sangguniang Kabataan Council, in joint assembly with the Katipunan ng Kabataan, has established the following 3-year strategic pillars:
[priorityPillars]

1. Equitable Quality Education, Digital Literacy, and Technical Training
2. Physical Health, Mental Wellness, and Community Sports Development
3. Community Disaster Risk Reduction, Climate Resilience & Environmental Stewardship
4. Leadership Development, Active Citizenship, and Anti-Illegal Drug Advocacy

III. ACTION PLAN & PROGRAM TARGETS
The 3-Year rolling target matrices and performance indicators shall serve as the sole legal basis for the annual formulation of the Annual Barangay Youth Investment Program (ABYIP).

Prepared and Documented by:
__________________________________
[secretary]
SK Secretary

Approved and Ratified by the SK Council:
__________________________________
[chairperson]
SK Chairperson`
  },

  "ABYIP": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      fiscalYear: "2026",
      totalAllocation: "1,450,000",
      secretary: "Hon. Maria Santos",
      treasurer: "Hon. Ricardo Dalisay",
      chairperson: "Hon. Juan dela Cruz",
      majorPPAs: "Youth Leadership Summit, Linggo ng Kabataan Sportsfest, Educational Assistance, Tree-Growing Initiative"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

ANNUAL BARANGAY YOUTH INVESTMENT PROGRAM (ABYIP)
Fiscal Year: [fiscalYear] (Yearly Mandated Document)

I. INVESTMENT PROGRAM OVERVIEW
Barangay: [barangay], Municipality of [municipality], Province of [province]
Total Estimated Youth Development Fund (10% SK Allocation): PHP [totalAllocation].00

II. SCHEDULE OF PRIORITY PROGRAMS, PROJECTS, AND ACTIVITIES (PPAs)
All PPAs listed herein are strictly derived from the approved 3-Year CBYDP:
[majorPPAs]

1. Linggo ng Kabataan & Youth Sports Development Program - Budget: PHP 350,000.00
2. Educational Support, Tech Grants & School Supplies Assistance - Budget: PHP 420,000.00
3. Disaster Preparedness & Youth Volunteer Emergency Response Training - Budget: PHP 280,000.00
4. Environmental Green Youth Action & Tree-Growing Project - Budget: PHP 180,000.00
5. SK Capability Building, Governance Training & Administrative MOOE - Budget: PHP 220,000.00

Prepared jointly by:

__________________________________        __________________________________
[secretary]                               [treasurer]
SK Secretary                              SK Treasurer

Attested and Approved by:
__________________________________
[chairperson]
SK Chairperson`
  },

  "ANNUAL-BUDGET": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      fiscalYear: "2026",
      totalBudget: "1,450,000",
      psAmount: "0.00",
      mooeAmount: "450,000",
      coAmount: "1,000,000",
      resolutionNo: "SK-RES-2026-004",
      secretary: "Hon. Maria Santos",
      treasurer: "Hon. Ricardo Dalisay",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

SANGGUNIANG KABATAAN ANNUAL BUDGET
Calendar Year: [fiscalYear] (Yearly Mandated Document)
Enacted pursuant to SK Resolution No.: [resolutionNo]

I. SOURCE OF FUNDS:
10% Share of the General Fund of Barangay [barangay]: PHP [totalBudget].00
Total Available Financial Resources: PHP [totalBudget].00

II. EXPENDITURE PROGRAM:
1. Personal Services (PS): PHP [psAmount] (Voluntary / In accordance with RA 11768)
2. Maintenance and Other Operating Expenses (MOOE): PHP [mooeAmount].00
   - Supplies & Materials Expenses: PHP 120,000.00
   - Training & Seminar Expenses: PHP 180,000.00
   - Rent & Utilities Expenses: PHP 50,000.00
   - Other Maintenance Expenses: PHP 100,000.00
3. Capital Outlay (CO) / Youth Development PPAs: PHP [coAmount].00
   - Disaster Rescue Equipment & First Aid Kits: PHP 250,000.00
   - IT Equipment & Audio-Visual Systems: PHP 300,000.00
   - Youth Multi-Purpose Activity Facilities Enhancement: PHP 450,000.00

TOTAL APPROPRIATIONS: PHP [totalBudget].00

Prepared by:
__________________________________        __________________________________
[secretary]                               [treasurer]
SK Secretary                              SK Treasurer

Approved by the SK Council:
__________________________________
[chairperson]
SK Chairperson`
  },

  "ACCOMP-REP": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      fiscalYear: "2026",
      projectsCompleted: "14 Programs and Projects",
      totalBeneficiaries: "1,180 Youth Residents",
      budgetUtilized: "1,380,000",
      secretary: "Hon. Maria Santos",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

ANNUAL ACCOMPLISHMENT REPORT
Calendar Year: [fiscalYear] (Yearly Mandated Document)

I. PERFORMANCE HIGHLIGHTS
Barangay: [barangay], Municipality of [municipality]
Total Programs and Projects Implemented: [projectsCompleted]
Total Youth Directly Impacted / Beneficiaries: [totalBeneficiaries]
Total Budget Expended for PPAs: PHP [budgetUtilized].00

II. MATRIX OF PROGRAM IMPLEMENTATION:
1. Annual Youth Sports League & Anti-Drug Campaign: 450 Participants reached
2. Free IT Literacy Workshop & Digital Empowerment: 220 Youths trained
3. Community River Clean-Up & Tree Planting Activity: 1,500 Seedlings planted
4. Disaster Emergency Response Simulation & First Aid Course: 85 Responders certified
5. Educational Assistance & School Supply Grant: 340 Student recipients

III. IMPACT ASSESSMENT & CITIZEN FEEDBACK
The youth development agenda resulted in zero youth delinquency incidents during major municipal festivals, 98% positive participant satisfaction rating, and compliant transparency posting on the Barangay Full Disclosure Board.

Prepared and Certified by:
__________________________________
[secretary]
SK Secretary

Noted and Attested by:
__________________________________
[chairperson]
SK Chairperson`
  },

  "ANNUAL-LIQ": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      fiscalYear: "2026",
      totalCashAdvances: "1,380,000",
      totalLiquidated: "1,380,000",
      unliquidatedBalance: "0.00",
      treasurer: "Hon. Ricardo Dalisay",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

ANNUAL LIQUIDATION REPORT
Calendar Year: [fiscalYear] (Yearly Mandated Document)

I. LIQUIDATION SUMMARY STATEMENT
Barangay: [barangay], Municipality: [municipality]
Total Cash Advances Received for the Year: PHP [totalCashAdvances].00
Total Legally Liquidated Expenses: PHP [totalLiquidated].00
Unliquidated Outstanding Cash Advance Balance: PHP [unliquidatedBalance]

II. BREAKDOWN BY TRANCHE / PROGRAM:
- Tranche 1: Youth Sports Festival - PHP 350,000.00 (Liquidated / Complete)
- Tranche 2: Educational & Academic Grants - PHP 420,000.00 (Liquidated / Complete)
- Tranche 3: Disaster Readiness Gear Procurement - PHP 280,000.00 (Liquidated / Complete)
- Tranche 4: Tree-Growing & Environmental PPA - PHP 180,000.00 (Liquidated / Complete)
- Tranche 5: Capability Building Seminar - PHP 150,000.00 (Liquidated / Complete)

III. CERTIFICATION:
I hereby certify under the penalties of perjury that the expenditures summarized above were fully verified against legitimate original invoices, official receipts, delivery receipts, and inspection reports on file.

Prepared by:
__________________________________
[treasurer]
SK Treasurer

Verified and Concurred by:
__________________________________
[chairperson]
SK Chairperson`
  },

  "SCBAA": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      fiscalYear: "2026",
      totalApprovedBudget: "1,450,000",
      actualPayments: "1,380,000",
      varianceAmount: "70,000",
      bmoOfficer: "Hon. Ricardo Dalisay (SK BMO)",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

STATEMENT OF COMPARISON OF BUDGET AND ACTUAL AMOUNTS (SCBAA)
Calendar Year: [fiscalYear] (Yearly Mandated Document)

I. BUDGET VS ACTUAL VARIANCE STATEMENT
Barangay: [barangay], Municipality: [municipality]
Officer Responsible: SK Budget Monitoring Officer (BMO)

Total Approved Annual Budget: PHP [totalApprovedBudget].00
Actual Cash Payments and Commitments: PHP [actualPayments].00
Favorable Budget Savings / Variance: PHP [varianceAmount].00

II. PARTICULARS BY EXPENSE CATEGORY:
1. Personal Services (PS):
   - Approved Budget: PHP 0.00 | Actual: PHP 0.00 | Variance: PHP 0.00
2. Maintenance and Other Operating Expenses (MOOE):
   - Approved Budget: PHP 450,000.00 | Actual: PHP 425,000.00 | Variance: PHP 25,000.00 (Savings)
3. Capital Outlay (CO):
   - Approved Budget: PHP 1,000,000.00 | Actual: PHP 955,000.00 | Variance: PHP 45,000.00 (Savings)

III. REMARKS:
All commitments remained strictly within approved budget caps. No deficit incurred. Unexpended savings reverted to the unappropriated surplus pursuant to COA guidelines.

Prepared by:
__________________________________
[bmoOfficer]
SK Budget Monitoring Officer

Approved by:
__________________________________
[chairperson]
SK Chairperson`
  },

  "RIPPE": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      asOfDate: "December 31, 2026",
      totalPropertyValue: "465,000",
      inventoryHead: "Hon. Ricardo Dalisay",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

REPORT ON THE INVENTORY OF PURCHASED PROPERTY AND EQUIPMENT (RIPPE)
As of: [asOfDate] (Yearly Mandated Document)

I. CUSTODY & PHYSICAL ASSET INVENTORY
Barangay: [barangay], Municipality: [municipality]
Officer Responsible: SK Inventory Head / Treasurer
Total Book Value of Equipment on Record: PHP [totalPropertyValue].00

II. VERIFIED PHYSICAL ASSETS SCHEDULE:
1. Portable Public Address & Sound System Unit (SN: PAS-2026-01) - PHP 65,000.00 (Good Condition)
2. Heavy-Duty Laptop Computer with Productivity Suite (SN: LPT-2026-08) - PHP 55,000.00 (Good Condition)
3. Multi-Function Network Color Laser Printer/Scanner - PHP 35,000.00 (Good Condition)
4. Collapsible Event Canopies & Aluminum Tents (4 units) - PHP 90,000.00 (Serviceable)
5. Disaster Response Rescue Boat & Outboard Motor - PHP 150,000.00 (Serviceable)
6. Community Sports Scoreboard and Digital Timer System - PHP 70,000.00 (Serviceable)

III. PHYSICAL COUNT VERIFICATION:
Conducted in the presence of the SK Council members. All property tags are affixed and recorded in the Property Card Registry.

Conducted and Prepared by:
__________________________________
[inventoryHead]
SK Inventory Head / Treasurer

Noted by:
__________________________________
[chairperson]
SK Chairperson`
  },

  "NOTES-FS": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      fiscalYear: "2026",
      depositoryBank: "Land Bank of the Philippines - Montevista/Laak Branch",
      accountNo: "CA-0982-1204-55",
      accountingMethod: "Modified Cash Basis (COA Circular 2020-003)",
      treasurer: "Hon. Ricardo Dalisay",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

NOTES TO FINANCIAL STATEMENTS
Calendar Year: [fiscalYear] (Yearly Mandated Document)

NOTE 1 - GENERAL INFORMATION
The Sangguniang Kabataan of Barangay [barangay], Municipality of [municipality], Province of [province] is a youth governing council established under RA 10742, as amended by RA 11768.

NOTE 2 - BASIS OF FINANCIAL STATEMENT PREPARATION
These financial statements have been prepared in accordance with the [accountingMethod] prescribed in the COA Handbook for Financial Transactions of the Sangguniang Kabataan.

NOTE 3 - CASH AND CASH EQUIVALENTS
All youth funds are maintained in an official government depository checking account:
- Bank Name: [depositoryBank]
- Account Number: [accountNo]
- Authorized Signatories: SK Chairperson and SK Treasurer

NOTE 4 - 10% BARANGAY YOUTH ALLOCATION
During the fiscal year, the council received 100% of its statutory allocation from the General Fund of the Barangay.

Certified Correct:
__________________________________
[treasurer]
SK Treasurer

Concurred by:
__________________________________
[chairperson]
SK Chairperson`
  },

  "RIPSM": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      semesterPeriod: "First Semester (January - June 2026)",
      suppliesAcquired: "95,000",
      suppliesIssued: "82,000",
      balanceOnHand: "13,000",
      inventoryHead: "Hon. Ricardo Dalisay",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

REPORT ON THE INVENTORY OF PURCHASED SUPPLIES AND MATERIALS (RIPSM)
Period: [semesterPeriod] (Every 6 Months Mandated Document)

I. SUMMARY STATEMENT OF SUPPLIES & MATERIALS
Barangay: [barangay], Municipality: [municipality]
Officer Responsible: SK Inventory Head / Treasurer

Total Supplies Acquired During Semester: PHP [suppliesAcquired].00
Total Supplies Issued for Activities: PHP [suppliesIssued].00
Physical Ending Balance on Hand: PHP [balanceOnHand].00

II. SUPPLIES CATEGORY INVENTORY:
1. Office & Administrative Stationery Supplies: Balance PHP 4,200.00
2. Youth Health & First-Aid Medical Kits: Balance PHP 3,800.00
3. Sports Tournament Consumables (Whistles, Netting, Medals): Balance PHP 5,000.00

III. CUSTODY CERTIFICATION:
All items were inspected upon arrival and issued exclusively pursuant to signed Requisition and Issue Slips (RIS).

Prepared by:
__________________________________
[inventoryHead]
SK Inventory Head / Treasurer

Attested by:
__________________________________
[chairperson]
SK Chairperson`
  },

  "RBCPB": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      quarterPeriod: "Second Quarter (Ending June 30, 2026)",
      totalAppropriations: "1,450,000",
      commitmentsQ2: "720,000",
      paymentsQ2: "680,000",
      balanceAvailable: "730,000",
      bmoOfficer: "Hon. Ricardo Dalisay (SK BMO)"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

REGISTRY OF BUDGET, COMMITMENTS, PAYMENTS AND BALANCES (RBCPB)
Quarter: [quarterPeriod] (Every 3 Months Mandated Document)

I. BUDGET MONITORING REGISTRY
Barangay: [barangay], Municipality: [municipality]
Officer Responsible: SK Budget Monitoring Officer (BMO)

Total Annual Budget Appropriations: PHP [totalAppropriations].00
Cumulative Commitments to Date: PHP [commitmentsQ2].00
Cumulative Payments to Date: PHP [paymentsQ2].00
Uncommitted Budget Balance Remaining: PHP [balanceAvailable].00

II. ENTRIES BY CLASS FOR THE QUARTER:
- MOOE Supplies: Commitments PHP 45,000 | Payments PHP 45,000 | Balance PHP 75,000
- MOOE Capability Training: Commitments PHP 85,000 | Payments PHP 80,000 | Balance PHP 95,000
- Capital Outlay PPAs: Commitments PHP 590,000 | Payments PHP 555,000 | Balance PHP 410,000

All disbursements were pre-checked against this registry before voucher certification.

Maintained and Certified by:
__________________________________
[bmoOfficer]
SK Budget Monitoring Officer`
  },

  "RCRDOT": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      quarterPeriod: "Second Quarter 2026",
      totalReceiptsQ2: "362,500",
      totalDepositedQ2: "362,500",
      undepositedBalance: "0.00",
      treasurer: "Hon. Ricardo Dalisay"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

REGISTER OF CASH RECEIPTS, DEPOSITS AND OTHER TRANSACTIONS (RCRDOT)
Quarter: [quarterPeriod] (Every 3 Months Mandated Document)

I. QUARTERLY CASH RECEIPTS REGISTER
Barangay: [barangay], Municipality: [municipality]
Officer Responsible: SK Treasurer

Total Collections & Receipts for the Quarter: PHP [totalReceiptsQ2].00
Total Deposited with Authorized Bank Depository: PHP [totalDepositedQ2].00
Undeposited Cash Collections: PHP [undepositedBalance]

II. CHRONOLOGICAL LOG:
- April 10, 2026 | OR-00451 | 10% Q2 Barangay Allocation Share | PHP 362,500.00 | Deposited April 11, 2026 (LBP Slip #89104)

All collections were deposited intact within the prescribed statutory period.

Recorded and Certified Correct:
__________________________________
[treasurer]
SK Treasurer`
  },

  "RCIB": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      quarterPeriod: "Second Quarter 2026",
      bankAccountNo: "LBP Checking CA-0982-1204-55",
      totalDeposited: "725,000",
      totalChecksDrawn: "580,000",
      bookBalance: "145,000",
      treasurer: "Hon. Ricardo Dalisay"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

REGISTRY OF CASH IN BANK (RCIB)
Quarter: [quarterPeriod] (Every 3 Months Mandated Document)

I. CASH IN BANK REGISTRY
Barangay: [barangay], Municipality: [municipality]
Bank Account: [bankAccountNo]
Officer Responsible: SK Treasurer

Total Deposits Credited to Date: PHP [totalDeposited].00
Total Checks Issued / Drawn to Date: PHP [totalChecksDrawn].00
Net Available Book Balance: PHP [bookBalance].00

II. RECENT CHECK TRANSACTIONS:
- June 12, 2026 | Check #0041221 | Mindanao Youth Sports Supply | PHP 48,500.00
- June 20, 2026 | Check #0041222 | Laak Printing & Graphic Hub | PHP 16,800.00
- June 25, 2026 | Check #0041223 | Fresh Life Youth Catering | PHP 25,000.00

Maintained and Reconciled by:
__________________________________
[treasurer]
SK Treasurer`
  },

  "RAAF": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      quarterPeriod: "Second Quarter 2026",
      checkSeriesBeg: "0041201",
      checkSeriesEnd: "0041300",
      checksIssued: "24",
      checksCancelled: "1",
      checksRemaining: "75",
      treasurer: "Hon. Ricardo Dalisay"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

REPORT OF ACCOUNTABILITY FOR ACCOUNTABLE FORMS (RAAF)
Period: [quarterPeriod] (Every 3 Months Mandated Document)

I. ACCOUNTABLE FORMS INVENTORY
Barangay: [barangay], Municipality: [municipality]
Officer Responsible: SK Treasurer

Accountable Form: Land Bank of the Philippines Commercial Checks
Booklet Series: [checkSeriesBeg] to [checkSeriesEnd] (Total 100 Checks)

II. ACCOUNTABILITY SUMMARY:
- Checks Issued During the Period: [checksIssued] Checks
- Checks Spoiled / Cancelled: [checksCancelled] Check (Attached intact to booklet)
- Unissued Checks on Hand: [checksRemaining] Checks

I certify that the accountable forms listed above are safely kept under my official custody inside the locked fireproof safe box.

Submitted by:
__________________________________
[treasurer]
SK Treasurer`
  },

  "SBCPB": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      quarterPeriod: "Second Quarter 2026",
      totalBudget: "1,450,000",
      totalCommitments: "720,000",
      totalPayments: "680,000",
      uncommittedBalance: "730,000",
      bmoOfficer: "Hon. Ricardo Dalisay (SK BMO)"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

SUMMARY OF BUDGET, COMMITMENTS, PAYMENTS AND BALANCES (SBCPB)
Quarter: [quarterPeriod] (Every 3 Months Mandated Document)

I. EXECUTIVE FISCAL SUMMARY
Barangay: [barangay], Municipality: [municipality]
Officer Responsible: SK Budget Monitoring Officer (BMO)

Total Approved Annual Budget: PHP [totalBudget].00
Total Commitments Obligated: PHP [totalCommitments].00 (49.66%)
Total Disbursed Cash Payments: PHP [totalPayments].00 (46.90%)
Uncommitted Balance for H2: PHP [uncommittedBalance].00 (50.34%)

II. SUMMARY ASSESSMENT:
Disbursement pace aligns with scheduled timeline. No overdraft commitments occurred. All checks were supported by prior obligation allotments.

Prepared and Certified by:
__________________________________
[bmoOfficer]
SK Budget Monitoring Officer`
  },

  "SRP": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      periodCovered: "Quarter Ending June 30, 2026 and Year-to-Date",
      totalCashInflows: "725,000",
      totalCashOutflows: "580,000",
      cashEndingBalance: "145,000",
      treasurer: "Hon. Ricardo Dalisay",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

STATEMENT OF RECEIPTS AND PAYMENTS (SRP)
Coverage: [periodCovered] (Every 3 Months and Yearly Mandated Document)

I. CASH RECEIPTS AND PAYMENTS STATEMENT
Barangay: [barangay], Municipality: [municipality]
Officer Responsible: SK Treasurer

RECEIPTS:
Barangay 10% Youth Fund Allocation Received: PHP [totalCashInflows].00
Total Cash Inflows: PHP [totalCashInflows].00

PAYMENTS:
Maintenance and Other Operating Expenses: PHP 185,000.00
Capital Outlays & Youth Programs: PHP 395,000.00
Total Cash Outflows: PHP [totalCashOutflows].00

ENDING CASH BALANCE:
Net Cash Balance Available at Quarter End: PHP [cashEndingBalance].00

Certified Correct:
__________________________________
[treasurer]
SK Treasurer

Approved by:
__________________________________
[chairperson]
SK Chairperson`
  },

  "BRS": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      monthPeriod: "June 2026",
      bankBalance: "162,500",
      outstandingChecks: "17,500",
      bookBalance: "145,000",
      treasurer: "Hon. Ricardo Dalisay",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

BANK RECONCILIATION STATEMENT (BRS)
Month: [monthPeriod] (Every Month Mandated Document)

I. RECONCILIATION SCHEDULE
Barangay: [barangay], Municipality: [municipality]
Officer Responsible: SK Treasurer
Depository Bank: Land Bank of the Philippines

Balance per Bank Statement as of Month End: PHP [bankBalance].00
Less: Outstanding Checks (Not yet cleared by Bank):
  - Check #0041223 (June 25, 2026): PHP 17,500.00
Adjusted Bank Balance: PHP [bookBalance].00

Balance per SK Cash Book: PHP [bookBalance].00
Discrepancy / Unreconciled Variance: PHP 0.00 (Fully Reconciled)

Prepared by:
__________________________________
[treasurer]
SK Treasurer

Reviewed and Attested by:
__________________________________
[chairperson]
SK Chairperson`
  },

  "DV": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      dvNumber: "DV-2026-06-021",
      date: "June 26, 2026",
      payee: "Mindanao Youth Sports & Educational Supply",
      particulars: "Payment for sports tournament medals, balls, whistles, and hydration kits for the Linggo ng Kabataan 2026",
      amount: "48,500",
      fundingSource: "YDEP - Sports Development Fund",
      bmoOfficer: "Hon. Ricardo Dalisay",
      treasurer: "Hon. Ricardo Dalisay",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

DISBURSEMENT VOUCHER (DV)
DV No: [dvNumber] (Every Transaction Mandated Document)
Date: [date]

PAYEE: [payee]
FUND SOURCE: [fundingSource]

PARTICULARS:
[particulars]

TOTAL AMOUNT TO BE DISBURSED: PHP [amount].00

CERTIFICATION A - BUDGET MONITORING OFFICER:
I certify that appropriation exists and allotment is obligated for this expenditure.
__________________________________
[bmoOfficer]
SK Budget Monitoring Officer

CERTIFICATION B - SK TREASURER:
I certify that funds are available in the bank depository and supporting documents are complete and legal.
__________________________________
[treasurer]
SK Treasurer

APPROVAL - SK CHAIRPERSON:
Approved for check preparation and payment release.
__________________________________
[chairperson]
SK Chairperson`
  },

  "LIQ-REP": {
    fields: {
      barangay: "San Jose",
      municipality: "Laak",
      province: "Davao de Oro",
      liquidationNo: "LR-2026-06-009",
      transactionDate: "June 27, 2026",
      cashAdvanceDV: "DV-2026-06-015",
      advanceAmount: "25,000",
      totalExpenses: "25,000",
      refundAmount: "0.00",
      purpose: "Youth Leadership Summit and Disaster Preparedness Training Logistics",
      treasurer: "Hon. Ricardo Dalisay",
      chairperson: "Hon. Juan dela Cruz"
    },
    content: `REPUBLIC OF THE PHILIPPINES
PROVINCE OF [province]
MUNICIPALITY OF [municipality]
BARANGAY [barangay]
OFFICE OF THE SANGGUNIANG KABATAAN

LIQUIDATION REPORT
Liquidation No: [liquidationNo] (Every Transaction Mandated Document)
Date: [transactionDate]

Reference Cash Advance Voucher: [cashAdvanceDV]
Purpose of Advance: [purpose]

I. FINANCIAL ACCOUNTABILITY STATEMENT:
Total Cash Advance Received: PHP [advanceAmount].00
Less: Total Actual Authorized Expenses: PHP [totalExpenses].00
Amount to be Refunded / (Reimbursed): PHP [refundAmount]

II. ATTACHED SUPPORTING DOCUMENTS:
1. Official Receipts / Sales Invoices (Original copies attached)
2. Training Attendance Sheets and Certificate of Completion
3. Post-Activity Documentation Photos and Liquidation Certificate

I certify that the expenses reported above were incurred in direct furtherance of official SK activities and in strict compliance with government accounting and auditing standards.

Submitted by:
__________________________________
[treasurer]
SK Treasurer

Concurred and Approved by:
__________________________________
[chairperson]
SK Chairperson`
  }
};
