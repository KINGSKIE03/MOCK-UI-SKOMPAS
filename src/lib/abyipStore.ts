import { 
  AbyipDocument, 
  AbyipCenterSection, 
  AbyipRowItem, 
  AbyipReceiptItem, 
  AbyipExpenditureItem 
} from "../types";

export const DEFAULT_ABYIP_YEAR = "2026";

/**
 * Generates the standard official ABYIP Document modeled exactly after the
 * Department of Budget & Management (DBM), NYC, and Republic Act 10742/11768 
 * sample provided in the official reference PDF.
 */
export function createDefaultAbyipDocument(
  barangayName: string = "Kapatagan",
  secretaryName?: string,
  chairpersonName?: string,
  treasurerName?: string
): AbyipDocument {
  const sections: AbyipCenterSection[] = [
    {
      id: "sec-abyip-gov-admin",
      centerName: "GOVERNANCE",
      programHeader: "GENERAL ADMINISTRATIVE PROGRAM",
      items: [
        {
          id: "ppa-gov-01",
          referenceCode: "5-01-02-050",
          ppaName: "PROVISION OF HONORARIUM FOR SK OFFICIALS",
          description: "Members of the SK are paid for serving on the council. Under the Local Government Code, only the SK chairperson receives an honorarium but in some areas the practice is that the chairman shares his payment with other members of the SK council.",
          expectedResults: "9 members of SK Council provided with honorarium",
          performanceIndicator: "SK Councilors, SK Treasurer, and SK Secretary",
          periodImplementation: "January-December",
          mooe: 0,
          co: 0,
          ps: 100000,
          total: 100000,
          personResponsible: "SK Officials and Members",
        },
        {
          id: "ppa-gov-02",
          referenceCode: "5-02-03-010",
          ppaName: "OFFICE SUPPLIES AND EXPENSES",
          description: "Logistical Support to the Sangguniang Kabataan officials",
          expectedResults: "Extended quality service for the youth in the barangay who are requesting for assistance on time of submission of various reports.",
          performanceIndicator: "SK Officials",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials and Members",
        },
        {
          id: "ppa-gov-03",
          referenceCode: "5-02-99-020",
          ppaName: "REPRESENTATION EXPENSES",
          description: "Logistical Support to the Sangguniang Kabataan officials",
          expectedResults: "Extended quality service for the youth in the barangay who are requesting for assistance on time of submission of various reports.",
          performanceIndicator: "SK Officials and KK Members",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials and KK Members",
        },
        {
          id: "ppa-gov-04",
          referenceCode: "5-02-09-040",
          ppaName: "REPAIR AND MAINTENANCE (MACHINERY EQUIPMENT)",
          description: "Logistical Support to the Sangguniang Kabataan officials",
          expectedResults: "Extended quality service for the youth in the barangay who are requesting for assistance on time of submission of various reports.",
          performanceIndicator: "SK Officials",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials and Members",
        },
        {
          id: "ppa-gov-05",
          referenceCode: "5-02-99-050",
          ppaName: "MEMBERSHIP DUES & CONTRIBUTION ORGANIZATION",
          description: "Logistical Support to the Sangguniang Kabataan officials",
          expectedResults: "To contribute to the municipal and provincial federation.",
          performanceIndicator: "SK Officials",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials and Members",
        },
        {
          id: "ppa-gov-06",
          referenceCode: "5-02-03-990",
          ppaName: "OTHER SUPPLIES & MATERIALS EXPENSES",
          description: "Logistical Support to the Sangguniang Kabataan officials",
          expectedResults: "Extended quality service for the youth in the barangay who are requesting for assistance on time of submission of various reports.",
          performanceIndicator: "SK Officials",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials and Members",
        },
        {
          id: "ppa-gov-07",
          referenceCode: "5-02-09-040",
          ppaName: "OFFICE EQUIPMENT",
          description: "Logistical Support to the Sangguniang Kabataan officials",
          expectedResults: "Extended quality service for the youth in the barangay who are requesting for assistance on time of submission of various reports.",
          performanceIndicator: "SK Officials",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials and Members",
        },
        {
          id: "ppa-gov-08",
          referenceCode: "5-02-11-010",
          ppaName: "FIDELITY BOND",
          description: "For the preparation of SK Chairman and appointed SK Treasurer on the separation of account of Sangguniang Kabataan from the Sangguniang Barangay account",
          expectedResults: "Separated account of the Sangguniang Kabataan",
          performanceIndicator: "SK Officials",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials and Members",
        },
      ],
    },
    {
      id: "sec-abyip-gov-prog",
      centerName: "GOVERNANCE",
      programHeader: "GOVERNANCE PROGRAM",
      items: [
        {
          id: "ppa-gov-prog-01",
          referenceCode: "5-02-01-010",
          ppaName: "TRAVELLING EXPENSES",
          description: "Engage technical skills to gain knowledge of sk officials and key leaders from the other youth sector",
          expectedResults: "To give allowance and educating the SK officials and other youth volunteers to become effective leaders through trainings and seminars.",
          performanceIndicator: "SK Officials",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials and Members",
        },
        {
          id: "ppa-gov-prog-02",
          referenceCode: "5-02-02-011",
          ppaName: "TRAINING & SEMINAR EXPENSES",
          description: "Engage technical skills to gain knowledge of sk officials and key leaders from the other youth sector",
          expectedResults: "Educating the SK officials and other youth volunteers to become effective leaders through trainings and seminars.",
          performanceIndicator: "SK Officials",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials and Members",
        },
        {
          id: "ppa-gov-prog-03",
          referenceCode: "5-02-06-020",
          ppaName: "LINGGO NG KABATAAN\n*PRIZES",
          subItems: ["*PRIZES"],
          description: "A project that promote camaraderie among youth leaders and organization",
          expectedResults: "Youth are aware about their role in the community",
          performanceIndicator: "Number of KK members to barangay.",
          periodImplementation: "August",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials and KK Members",
        },
        {
          id: "ppa-gov-prog-04",
          referenceCode: "5-02-99-020",
          ppaName: "KK ASSEMBLY\n*REPRESENTATION EXPENSES",
          subItems: ["*REPRESENTATION EXPENSES"],
          description: "Intends to promote the transparency and participation of youth in the barangay activities",
          expectedResults: "To formulate plan and project for the barangay and also consulting the funds to all kk member",
          performanceIndicator: "Number of kk attended the assembly",
          periodImplementation: "January-December",
          mooe: 60000,
          co: 0,
          ps: 0,
          total: 60000,
          personResponsible: "SK Officials and KK Members",
        },
      ],
    },
    {
      id: "sec-abyip-active-cit",
      centerName: "ACTIVE CITIZENSHIP",
      programHeader: "ACTIVE CITIZENSHIP PROGRAM",
      items: [
        {
          id: "ppa-act-01",
          referenceCode: "5-02-03-990 / 5-02-06-020 / 5-02-99-990 / 5-02-99-020",
          ppaName: "BOLA-TA-SOY! SPORTS DEV'T PROG.\n*SPORTS SUPPLIES (100k)\n*PRIZES (200k)\n*HONORARIUM (100k)\n*REPRESENTATION EXPENSES (100k)",
          subItems: ["*SPORTS SUPPLIES", "*PRIZES", "*HONORARIUM", "*REPRESENTATION EXPENSES"],
          description: "This is to showcase the talents of youth and to build sportsmanship and camaraderie. And to increase the interest in culture and arts.",
          expectedResults: "Healthier and more active youth increase better capacitated youth.",
          performanceIndicator: "Number of youth participated in the activities.",
          periodImplementation: "January-December",
          mooe: 500000,
          co: 0,
          ps: 0,
          total: 500000,
          personResponsible: "SK Officials and KK Members",
        },
        {
          id: "ppa-act-02",
          referenceCode: "5-02-99-020",
          ppaName: "SK YEAR END CELEBRATION\n*REPRESENTATION EXPENSES",
          subItems: ["*REPRESENTATION EXPENSES"],
          description: "This is to build a strong connections and to enhance leadership and to evaluate each officials.",
          expectedResults: "Sk Officials were Progressive and effective",
          performanceIndicator: "SK Officials",
          periodImplementation: "December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials",
        },
        {
          id: "ppa-act-03",
          referenceCode: "5-02-06-020",
          ppaName: "GAWAD PARANGAL FOR OUTSTANDING KK MEMBERS",
          description: "Increase visibility and appreciation of youth contributions to encourage continued participation and leadership",
          expectedResults: "Number of KK Members appreciated and given an awards",
          performanceIndicator: "Number of KK Members awarded",
          periodImplementation: "January-December",
          mooe: 19000,
          co: 0,
          ps: 0,
          total: 19000,
          personResponsible: "SK Officials and KK Members",
        },
      ],
    },
    {
      id: "sec-abyip-env",
      centerName: "ENVIRONMENT",
      programHeader: "ENVIRONMENT PROGRAM",
      items: [
        {
          id: "ppa-env-01",
          referenceCode: "5-02-99-020",
          ppaName: "PULOT BASURA\n*REPRESENTATION EXPENSES",
          subItems: ["*REPRESENTATION EXPENSES"],
          description: "This is to lessen the garbage in the community and to create a green environment, and decreasing the number of waste disposed improperly.",
          expectedResults: "Greener and Cleaner community",
          performanceIndicator: "Number of youth participated in the activity",
          periodImplementation: "January-December",
          mooe: 200000,
          co: 0,
          ps: 0,
          total: 200000,
          personResponsible: "SK Officials and KK Members",
        },
        {
          id: "ppa-env-02",
          referenceCode: "5-02-09-040",
          ppaName: "INSTALLATION OF PUBLIC TRASH CANS",
          description: "To decreasing the number of waste disposed improperly.",
          expectedResults: "Greener and Cleaner community",
          performanceIndicator: "Number of youth participated in the activity",
          periodImplementation: "January-December",
          mooe: 200000,
          co: 0,
          ps: 0,
          total: 200000,
          personResponsible: "SK Officials and KK Members",
        },
      ],
    },
    {
      id: "sec-abyip-agri",
      centerName: "AGRICULTURE",
      programHeader: "AGRICULTURE PROGRAM",
      items: [
        {
          id: "ppa-agri-01",
          referenceCode: "5-02-06-020",
          ppaName: 'YOUTH GARDENING COMPETITIONS ("TANUM TEENS: KAPATAGENYO SHOWDOWN")\n*PRIZES',
          subItems: ["*PRIZES"],
          description: "This is to increase the participation and leadership in local vegetable initiatives",
          expectedResults: "To decrease the unhealthy foods in the barangay",
          performanceIndicator: "Number of KK members participated in the competition.",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Officials & KK Members",
        },
      ],
    },
    {
      id: "sec-abyip-peace",
      centerName: "PEACE BUILDING & SECURITY",
      programHeader: "PEACE BUILDING & SECURITY PROGRAM",
      items: [
        {
          id: "ppa-peace-01",
          referenceCode: "5-02-99-020 / 5-02-99-990",
          ppaName: "SYMPOSIUM ON ANTI-DRUG ABUSE PROGRAM\n*REPRESENTATION EXPENSES (50k)\n*HONORARIUM (50k)",
          subItems: ["*REPRESENTATION EXPENSES", "*HONORARIUM"],
          description: "This to increase the knowledge about the effects and consequences of using illegal drugs.",
          expectedResults: "Youth were knowledgeable enough on illegal drugs",
          performanceIndicator: "Number of youth participated in the symposium",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "PDEA, PNP",
        },
      ],
    },
    {
      id: "sec-abyip-social",
      centerName: "SOCIAL INCLUSION AND EQUITY",
      programHeader: "SOCIAL INCLUSION AND EQUITY PROGRAM",
      items: [
        {
          id: "ppa-social-01",
          referenceCode: "5-02-06-020 / 5-02-99-020",
          ppaName: "LGBTQIA+ DAY\n*PRIZES (100k)\n*REPRESENTATION EXPENSES (100k)",
          subItems: ["*PRIZES", "*REPRESENTATION EXPENSES"],
          description: "To promote inclusivity and gender awareness program to reduce stereotyping",
          expectedResults: "To gain knowledge on Gender Awareness",
          performanceIndicator: "Number of youth Participated in the program",
          periodImplementation: "January-December",
          mooe: 200000,
          co: 0,
          ps: 0,
          total: 200000,
          personResponsible: "SK Committee on Social Inclusion and Equity",
        },
      ],
    },
    {
      id: "sec-abyip-health",
      centerName: "HEALTH",
      programHeader: "HEALTH PROGRAM",
      items: [
        {
          id: "ppa-health-01",
          referenceCode: "5-02-99-020 / 5-02-99-990",
          ppaName: "BASIC LIFE SUPPORT WITH FIRST AID TRAINING\n*REPRESENTATION EXPENSES (50k)\n*HONORARIUM (50k)",
          subItems: ["*REPRESENTATION EXPENSES", "*HONORARIUM"],
          description: "To educate and train the youth in the Basic life support and First Aid",
          expectedResults: "Knowledgeable on the basic life support and first aid",
          performanceIndicator: "Number of youth participated in the event",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Committee on health",
        },
        {
          id: "ppa-health-02",
          referenceCode: "5-02-99-020",
          ppaName: "MASS BLOOD LETTING\n*REPRESENTATION EXPENSES",
          subItems: ["*REPRESENTATION EXPENSES"],
          description: "This program aims to donate blood to the youth in needs.",
          expectedResults: "Youth participated in the said event",
          performanceIndicator: "Number of youth participated in the event",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Committee on health, and DOH",
        },
      ],
    },
    {
      id: "sec-abyip-edu",
      centerName: "EDUCATION",
      programHeader: "EDUCATION PROGRAM",
      items: [
        {
          id: "ppa-edu-01",
          referenceCode: "5-02-03-990",
          ppaName: "BRIGADA ESKWELA\n*SCHOOL SUPPLIES",
          subItems: ["*SCHOOL SUPPLIES"],
          description: "This program aims to distribute school supplies to the students who were financially challenged.",
          expectedResults: "Students received the school supplies.",
          performanceIndicator: "Number of students benefited",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Committee on Education",
        },
        {
          id: "ppa-edu-02",
          referenceCode: "5-02-06-020",
          ppaName: "GAWAD SA MAG-AARAL PROGRAM\n*PRIZES",
          subItems: ["*PRIZES"],
          description: "This program aims to boost and to challenge the students to do better in school activities",
          expectedResults: "Students received a recognition for their performance",
          performanceIndicator: "Number of students benefited",
          periodImplementation: "January-December",
          mooe: 100000,
          co: 0,
          ps: 0,
          total: 100000,
          personResponsible: "SK Committee on Education",
        },
      ],
    },
  ];

  // Part I: Receipts Program
  const receipts: AbyipReceiptItem[] = [
    {
      id: "rec-01",
      particular: "Ten percent (10%) of the General Fund of Barangay - Lumpsum",
      amount: 953464.90,
    },
    {
      id: "rec-02",
      particular: "2026 IRA Increase",
      amount: 0,
    },
  ];

  // Part II: Expenditures Program
  const expenditures: AbyipExpenditureItem[] = [
    {
      id: "exp-01",
      programGroup: "GENERAL ADMINISTRATION PROGRAM",
      category: "PERSONAL SERVICES (PS)",
      objective: "Honorarium",
      accountCode: "5-01-02-050",
      budgetAmount: 238366.00,
      expectedResult: "9 Members of SK Council provided with honorarium",
      performanceIndicator: "SK Councilors, SK Treasurer and SK Secretary",
    },
    {
      id: "exp-02",
      programGroup: "GENERAL ADMINISTRATION PROGRAM",
      category: "MOOE",
      objective: "Office supplies & Expenses",
      accountCode: "5-02-03-010",
      budgetAmount: 20000.00,
      expectedResult: "Logistical support of the Sangguniang Kabataan",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-03",
      programGroup: "GENERAL ADMINISTRATION PROGRAM",
      category: "MOOE",
      objective: "Representation Expenses",
      accountCode: "5-02-99-020",
      budgetAmount: 20000.00,
      expectedResult: "Logistical support of the Sangguniang Kabataan",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-04",
      programGroup: "GENERAL ADMINISTRATION PROGRAM",
      category: "MOOE",
      objective: "Repair & Maintenance (Machinery Equipment)",
      accountCode: "5-02-09-040",
      budgetAmount: 5000.00,
      expectedResult: "Logistical support of the Sangguniang Kabataan",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-05",
      programGroup: "GENERAL ADMINISTRATION PROGRAM",
      category: "MOOE",
      objective: "Membership dues & Contribution organization",
      accountCode: "5-02-99-050",
      budgetAmount: 5000.00,
      expectedResult: "Logistical support of the Sangguniang Kabataan",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-06",
      programGroup: "GENERAL ADMINISTRATION PROGRAM",
      category: "MOOE",
      objective: "Other supplies & Material expenses",
      accountCode: "5-02-03-990",
      budgetAmount: 5000.00,
      expectedResult: "Logistical support of the Sangguniang Kabataan",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-07",
      programGroup: "GENERAL ADMINISTRATION PROGRAM",
      category: "MOOE",
      objective: "Electricity Expenses",
      accountCode: "5-02-11-020",
      budgetAmount: 50000.00,
      expectedResult: "Logistical support of the Sangguniang Kabataan",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-08",
      programGroup: "GENERAL ADMINISTRATION PROGRAM",
      category: "MOOE",
      objective: "Office equipment",
      accountCode: "5-02-09-040",
      budgetAmount: 23098.90,
      expectedResult: "Logistical support of the Sangguniang Kabataan",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-09",
      programGroup: "GENERAL ADMINISTRATION PROGRAM",
      category: "MOOE",
      objective: "Fidelity Bond",
      accountCode: "5-02-11-010",
      budgetAmount: 5000.00,
      expectedResult: "Logistical support of the Sangguniang Kabataan",
      performanceIndicator: "SK Officials & Members",
    },
    // Youth Development Programs
    {
      id: "exp-10",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "GOVERNANCE PROGRAM",
      objective: "Travelling expenses",
      accountCode: "5-02-01-010",
      budgetAmount: 70000.00,
      expectedResult: "To give allowance to the SK officials",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-11",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "GOVERNANCE PROGRAM",
      objective: "Training & Seminar expenses",
      accountCode: "5-02-02-010",
      budgetAmount: 80000.00,
      expectedResult: "To give allowance to the SK officials",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-12",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "LINGGO NG KABATAAN",
      objective: "Prizes",
      accountCode: "5-02-06-020",
      budgetAmount: 100000.00,
      expectedResult: "Youth are aware about their role in the community",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-13",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "KK ASSEMBLY",
      objective: "Representation Expenses",
      accountCode: "5-02-99-020",
      budgetAmount: 15000.00,
      expectedResult: "To formulate plan and project for the barangay also consulting the funds to all KK Members.",
      performanceIndicator: "SK Officials & Members",
    },
    {
      id: "exp-14",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "ACTIVE CITIZENSHIP PROGRAM - BOLA-TA-SOY!",
      objective: "Sports supplies",
      accountCode: "5-02-03-990",
      budgetAmount: 5000.00,
      expectedResult: "Healthier and more active youth increase better capacitated youth",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-15",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "ACTIVE CITIZENSHIP PROGRAM - BOLA-TA-SOY!",
      objective: "Prizes",
      accountCode: "5-02-06-020",
      budgetAmount: 100000.00,
      expectedResult: "Healthier and more active youth increase better capacitated youth",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-16",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "ACTIVE CITIZENSHIP PROGRAM - BOLA-TA-SOY!",
      objective: "Honorarium",
      accountCode: "5-02-99-990",
      budgetAmount: 50000.00,
      expectedResult: "Healthier and more active youth increase better capacitated youth",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-17",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "ACTIVE CITIZENSHIP PROGRAM",
      objective: "SK YEAR END CELEBRATION - Representation Expenses",
      accountCode: "5-02-99-020",
      budgetAmount: 30000.00,
      expectedResult: "SK Officials were progressive and effective",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-18",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "ACTIVE CITIZENSHIP PROGRAM",
      objective: "GAWAD PARANGAL KK MEMBERS - Prizes",
      accountCode: "5-02-06-020",
      budgetAmount: 19000.00,
      expectedResult: "Number of KK members appreciated and given an award",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-19",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "ENVIRONMENT PROGRAM",
      objective: "PULOT BASURA - Representation expenses",
      accountCode: "5-02-99-020",
      budgetAmount: 4000.00,
      expectedResult: "Greener and Cleaner community",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-20",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "ENVIRONMENT PROGRAM",
      objective: "INSTALLATION OF PUBLIC TRASH CANS",
      accountCode: "5-02-09-040",
      budgetAmount: 20000.00,
      expectedResult: "Greener and Cleaner community",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-21",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "AGRICULTURE PROGRAM",
      objective: 'YGC "TANUM TEENS: KAPATAGENYO SHOWDOWN" - Prizes',
      accountCode: "5-02-06-020",
      budgetAmount: 20000.00,
      expectedResult: "To decrease the unhealthy foods in the barangay",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-22",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "PEACE BUILDING & SECURITY PROGRAM",
      objective: "ANTI-ILLEGAL DRUGS SYMPOSIUM - Representation expenses",
      accountCode: "5-02-99-020",
      budgetAmount: 5000.00,
      expectedResult: "Youth were knowledgeable enough on illegal drugs",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-23",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "PEACE BUILDING & SECURITY PROGRAM",
      objective: "ANTI-ILLEGAL DRUGS SYMPOSIUM - Honorarium",
      accountCode: "5-02-99-990",
      budgetAmount: 2000.00,
      expectedResult: "Youth were knowledgeable enough on illegal drugs",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-24",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "SOCIAL INCLUSION & EQUITY PROGRAM",
      objective: "LGBTQIA+ DAY - Prizes",
      accountCode: "5-02-06-020",
      budgetAmount: 25000.00,
      expectedResult: "To gain knowledge on Gender awareness",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-25",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "SOCIAL INCLUSION & EQUITY PROGRAM",
      objective: "LGBTQIA+ DAY - Representation expenses",
      accountCode: "5-02-99-020",
      budgetAmount: 5000.00,
      expectedResult: "To gain knowledge on Gender awareness",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-26",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "HEALTH PROGRAM",
      objective: "BASIC LIFE SUPPORT WITH FIRST AID TRAINING - Honorarium",
      accountCode: "5-02-99-020",
      budgetAmount: 2000.00,
      expectedResult: "Knowledgeable enough on basic life support",
      performanceIndicator: "SK Officials & KK Members",
    },
    {
      id: "exp-27",
      programGroup: "SK YOUTH DEVELOPMENT PROGRAM",
      subCategory: "EDUCATION PROGRAM",
      objective: "BRIGADA ESKWELA - School supplies",
      accountCode: "5-02-03-990",
      budgetAmount: 30000.00,
      expectedResult: "Students received school supplies",
      performanceIndicator: "SK Officials & KK Members",
    },
  ];

  const totalCalculated = sections.reduce((sum, sec) => {
    return sum + sec.items.reduce((secSum, itm) => secSum + (itm.total || (itm.mooe + itm.co + itm.ps)), 0);
  }, 0);

  return {
    id: `abyip-${barangayName.toLowerCase().replace(/\s+/g, "-")}-2026`,
    barangayName: barangayName,
    municipality: "LAAK",
    province: "DAVAO DE ORO",
    calendarYear: DEFAULT_ABYIP_YEAR,
    preparedByName: secretaryName || "JOHN KIERBY A. ANCHETA",
    preparedByTitle: "SK SECRETARY",
    approvedByName: chairpersonName || "HON. JAMES JOHN G. CATUBAY",
    approvedByTitle: "SK CHAIRPERSON",
    treasurerName: treasurerName || "FLORY ANN A. JAKOSALEM",
    treasurerTitle: "SK TREASURER",
    sections: sections,
    receipts: receipts,
    expenditures: expenditures,
    grandTotal: totalCalculated,
    createdAt: new Date().toISOString(),
    status: "Draft",
  };
}

/**
 * Calculates section totals: MOOE, CO, PS, Total
 */
export function calculateAbyipSectionTotals(section: AbyipCenterSection) {
  return section.items.reduce(
    (acc, itm) => {
      const mooe = Number(itm.mooe) || 0;
      const co = Number(itm.co) || 0;
      const ps = Number(itm.ps) || 0;
      const total = Number(itm.total) || (mooe + co + ps);
      return {
        mooe: acc.mooe + mooe,
        co: acc.co + co,
        ps: acc.ps + ps,
        total: acc.total + total,
      };
    },
    { mooe: 0, co: 0, ps: 0, total: 0 }
  );
}

/**
 * Calculates grand total for the whole ABYIP document
 */
export function calculateAbyipGrandTotals(doc: AbyipDocument) {
  return doc.sections.reduce(
    (acc, sec) => {
      const secTotals = calculateAbyipSectionTotals(sec);
      return {
        mooe: acc.mooe + secTotals.mooe,
        co: acc.co + secTotals.co,
        ps: acc.ps + secTotals.ps,
        total: acc.total + secTotals.total,
      };
    },
    { mooe: 0, co: 0, ps: 0, total: 0 }
  );
}

/**
 * Loads an ABYIP document from localStorage, falling back to default
 */
export function loadAbyipDocument(
  barangayName: string = "Kapatagan",
  secretaryName?: string,
  chairpersonName?: string,
  treasurerName?: string
): AbyipDocument {
  const key = `skompas_abyip_${barangayName.toLowerCase().replace(/\s+/g, "_")}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.sections)) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Failed to load ABYIP from localStorage:", e);
  }

  // Create default and save
  const fresh = createDefaultAbyipDocument(
    barangayName,
    secretaryName,
    chairpersonName,
    treasurerName
  );
  try {
    localStorage.setItem(key, JSON.stringify(fresh));
  } catch {}
  return fresh;
}

/**
 * Saves an ABYIP document to localStorage
 */
export function saveAbyipDocument(doc: AbyipDocument): void {
  const key = `skompas_abyip_${doc.barangayName.toLowerCase().replace(/\s+/g, "_")}`;
  const grandTotals = calculateAbyipGrandTotals(doc);
  const updatedDoc: AbyipDocument = {
    ...doc,
    grandTotal: grandTotals.total,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(updatedDoc));
}

/**
 * Resets an ABYIP document to default
 */
export function resetAbyipToDefault(
  barangayName: string = "Kapatagan",
  secretaryName?: string,
  chairpersonName?: string,
  treasurerName?: string
): AbyipDocument {
  const key = `skompas_abyip_${barangayName.toLowerCase().replace(/\s+/g, "_")}`;
  localStorage.removeItem(key);
  const fresh = createDefaultAbyipDocument(
    barangayName,
    secretaryName,
    chairpersonName,
    treasurerName
  );
  saveAbyipDocument(fresh);
  return fresh;
}
