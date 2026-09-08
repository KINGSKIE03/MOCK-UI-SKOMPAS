import { CbydpDocument, CbydpCenterSection, CbydpRowItem } from "../types";
import { saveDocumentSubmission } from "./barangayStore";

export const DEFAULT_CBYDP_SECTIONS: CbydpCenterSection[] = [
  {
    id: "sec-governance",
    centerName: "GOVERNANCE",
    agendaStatement: "For the youth to purchased administrative operations equipment/office supply, materials expenses, travelling expenses, training expenses and personal services.",
    items: [
      {
        id: "gov-1",
        concern: "Organizational capacity of the Sangguniang Kabataan",
        objectives: "Functional Sangguniang Kabataan data and continuous administrative capability",
        performanceIndicator: "Number of Sessions conducted; SK Office administrative operation equipment and other materials purchased",
        targetYear1: "12",
        targetYear2: "12",
        targetYear3: "12",
        targetYear4: "12",
        ppas: "GENERAL ADMINISTRATIVE PROGRAM: Logistical Support to the Sangguniang Kabataan (Office supplies, Representation, Repair & maintenance, Membership dues, Fidelity bond, Office equipment, Electricity)",
        budgetCategory: "MOOE",
        budgetAmount: 14000000,
        personResponsible: "SK OFFICIALS"
      },
      {
        id: "gov-2",
        concern: "Inadequate leadership capability-building",
        objectives: "To enhance the leadership skills of SK Officials and attend 30 number of different trainings and seminars by the end of 2027",
        performanceIndicator: "Number of trainings conducted / attended",
        targetYear1: "10",
        targetYear2: "10",
        targetYear3: "10",
        targetYear4: "10",
        ppas: "Attend various seminar and training for SK Officials conducted by different government agencies (Training Expenses, Travelling Expenses)",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK OFFICIALS, DILG, COA, BUDGET OFFICE AND OTHER GOVERNMENT AGENCIES"
      },
      {
        id: "gov-3",
        concern: "Sec. 4(6) RA 11768 regrant of honorarium to SK Officials",
        objectives: "Provision of honoraria to the incumbent SK Officials as mandated by law",
        performanceIndicator: "Number of SK Officials received honorarium",
        targetYear1: "9",
        targetYear2: "9",
        targetYear3: "9",
        targetYear4: "9",
        ppas: "Provision of Honorarium for SK Officials",
        budgetCategory: "PERSONNEL SERVICES",
        budgetAmount: 2000000,
        personResponsible: "SK Chairperson, SK Treasurer"
      },
      {
        id: "gov-4",
        concern: "Section 30 RA 10742 on the conduct of Linggo ng Kabataan",
        objectives: "To conduct Linggo ng Kabataan as mandated by law annually",
        performanceIndicator: "Number of youth participants attended",
        targetYear1: "300",
        targetYear2: "350",
        targetYear3: "400",
        targetYear4: "450",
        ppas: "Conduct of Linggo ng Kabataan (Prizes, Facilitators, Honorarium, Representation Expense, Other Supplies and Materials)",
        budgetCategory: "MOOE",
        budgetAmount: 10000000,
        personResponsible: "SK OFFICIALS, & KK Members"
      },
      {
        id: "gov-5",
        concern: "Memorandum Circular 2023-068 with the Subject 'SK Full Disclosure (FPD) Policy'",
        objectives: "To ensure the adoption and transparent implementation of the policy",
        performanceIndicator: "Number of SK Full Disclosure Boards installed and maintained",
        targetYear1: "2",
        targetYear2: "3",
        targetYear3: "4",
        targetYear4: "5",
        ppas: "Installation and Maintenance of SK Full Disclosure Board",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK OFFICIALS"
      },
      {
        id: "gov-6",
        concern: "New set of SK Officials CY 2025-2028",
        objectives: "To ensure all newly elected/appointed SK Officials assumed into office undergo mandatory orientation",
        performanceIndicator: "Number of SK Officials successfully completed mandatory governance training",
        targetYear1: "10",
        targetYear2: "10",
        targetYear3: "10",
        targetYear4: "10",
        ppas: "SK Mandatory Training (SKMT) and Continuing Leadership Modules",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK OFFICIALS"
      },
      {
        id: "gov-7",
        concern: "Section 6 RA 10742 on the conduct of Katipunan ng Kabataan (KK) Assembly",
        objectives: "To conduct KK Assembly at least twice a year as mandated by law",
        performanceIndicator: "Number of KK Assembly participants attended",
        targetYear1: "350",
        targetYear2: "400",
        targetYear3: "450",
        targetYear4: "500",
        ppas: "Conduct of Semi-Annual KK Assembly (Prizes, Facilitators, Honorarium, Representation, Other Supplies and Materials)",
        budgetCategory: "MOOE",
        budgetAmount: 10000000,
        personResponsible: "SK OFFICIALS, & KK MEMBERS"
      },
      {
        id: "gov-8",
        concern: "No accurate youth data at the barangay level",
        objectives: "To establish and maintain an accurate youth demographic and socio-economic database",
        performanceIndicator: "Number of youth surveyed and profiled",
        targetYear1: "200",
        targetYear2: "250",
        targetYear3: "300",
        targetYear4: "350",
        ppas: "Conduct of Comprehensive Youth Profiling and Needs Assessment (Representation & materials expenses)",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK OFFICIALS"
      }
    ]
  },
  {
    id: "sec-active-citizenship",
    centerName: "ACTIVE CITIZENSHIP",
    agendaStatement: "By 2028, more youth are represented in adult-dominated decision-making structures at local and national levels, and more young women assume leadership roles and responsibilities in youth and community-based organization.",
    items: [
      {
        id: "ac-1",
        concern: "Lack of budget for youth development and sports programs",
        objectives: "To distance Out-of-School Youth (OSY) and in-school youth from illegal engagement and vices through sports development",
        performanceIndicator: "Number of participants attended sports programs",
        targetYear1: "150",
        targetYear2: "150",
        targetYear3: "150",
        targetYear4: "150",
        ppas: "Rehabilitation of sports facilities, Installation of Basketball Fiber Glass & Solar Lights for Court",
        budgetCategory: "CO",
        budgetAmount: 4000000,
        personResponsible: "SK OFFICIALS & KK MEMBERS"
      },
      {
        id: "ac-2",
        concern: "Low-level of youth interest in sports, culture and arts",
        objectives: "To higher the level of youth interest in sports, culture and arts through grassroots community leagues",
        performanceIndicator: "Number of cultural/sports activities conducted; Number of participants attended",
        targetYear1: "2",
        targetYear2: "3",
        targetYear3: "4",
        targetYear4: "5",
        ppas: "Conduct of SK Festival of Talents (Prizes, Sports supplies and Equipment)",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK OFFICIALS, KK Members"
      },
      {
        id: "ac-3",
        concern: "Lack of platform for Sports Management and training",
        objectives: "To provide platform for sports refereeing, coaching, and athletic management training",
        performanceIndicator: "Number of Sports Clinics Conducted; Number of participants attended",
        targetYear1: "2",
        targetYear2: "3",
        targetYear3: "3",
        targetYear4: "3",
        ppas: "Conduct of SK Sports Clinic (Facilitators Honorarium, Representation Expenses)",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK OFFICIALS, KK Members"
      },
      {
        id: "ac-4",
        concern: "Lack of platform for fellowship and engagement among fellow youth",
        objectives: "To provide platform for youth engagement, fellowship, and year-end leadership recognition",
        performanceIndicator: "Number of activities conducted; Number of participants attended",
        targetYear1: "6",
        targetYear2: "6",
        targetYear3: "6",
        targetYear4: "6",
        ppas: "Conduct of SK Year End Youth Celebration (Facilitators, Honorarium, Representation, Prizes)",
        budgetCategory: "MOOE",
        budgetAmount: 6000000,
        personResponsible: "SK OFFICIALS & KK Members"
      },
      {
        id: "ac-5",
        concern: "Low voter registration and participation among youth",
        objectives: "Increase youth voter registration and active participation in local and national elections",
        performanceIndicator: "Percentage increase in registered youth voters; turnout rates in elections",
        targetYear1: "10% increase",
        targetYear2: "15% increase",
        targetYear3: "20% increase",
        targetYear4: "25% increase",
        ppas: "Project i-Vote: Barangay Youth Voter's Education and Electoral Engagement Campaign",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Officials & KK Members"
      },
      {
        id: "ac-6",
        concern: "Insufficient youth engagement in community decision-making",
        objectives: "Foster active youth participation in community governance, barangay sessions, and policy dialogue",
        performanceIndicator: "Number of youth participants attended the youth governance summit",
        targetYear1: "250",
        targetYear2: "300",
        targetYear3: "350",
        targetYear4: "400",
        ppas: "Katipunan ng Kabataan Barangay Leadership and Governance Summit",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Officials & KK Members"
      },
      {
        id: "ac-7",
        concern: "Lack of recognition for youth contributions in community development",
        objectives: "Increase visibility and appreciation of volunteer youth leaders to encourage sustained civic leadership",
        performanceIndicator: "Number of youth awards conferred",
        targetYear1: "10",
        targetYear2: "20",
        targetYear3: "30",
        targetYear4: "40",
        ppas: "Gawad Parangal for Outstanding KK Members and Youth Volunteers",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Officials & KK Members"
      }
    ]
  },
  {
    id: "sec-economic-empowerment",
    centerName: "ECONOMIC EMPOWERMENT",
    agendaStatement: "By 2028, young people are competent to engage in economic enterprises and in technology use, transformation, and innovation.",
    items: [
      {
        id: "ee-1",
        concern: "Less employed youth caused of inadequate skills training",
        objectives: "To gain technical knowledge, earn TESDA certifications, and optimize youth participation in labor markets",
        performanceIndicator: "Number of trainees certified; Number of training modules conducted",
        targetYear1: "100",
        targetYear2: "250",
        targetYear3: "350",
        targetYear4: "400",
        ppas: "Conduct of TESDA Technical-Vocational Skills Training (Facilitators Honorarium, Representation Expenses)",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK OFFICIALS, KK Members, TESDA"
      },
      {
        id: "ee-2",
        concern: "Less training for youth entrepreneurial skills",
        objectives: "To provide trainings in enhancing youth entrepreneurial capabilities and micro-business management",
        performanceIndicator: "Number of participants attended; Number of enterprise activities launched",
        targetYear1: "100",
        targetYear2: "250",
        targetYear3: "350",
        targetYear4: "400",
        ppas: "Conduct of SKPreneur Program (Supplies and materials, Representation Expenses, Facilitators Honorarium)",
        budgetCategory: "MOOE",
        budgetAmount: 6000000,
        personResponsible: "SK OFFICIALS, KK Members, DTI"
      },
      {
        id: "ee-3",
        concern: "Presence of unemployed and underemployed youth",
        objectives: "To decrease the percentage of unemployed youth by 50% through direct corporate and local employment linkages",
        performanceIndicator: "Percentage decrease of unemployed youth",
        targetYear1: "10%",
        targetYear2: "20%",
        targetYear3: "20%",
        targetYear4: "20%",
        ppas: "Annual Barangay Youth Job Fair & Career Matching Day",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Economic Empowerment, DOLE"
      },
      {
        id: "ee-4",
        concern: "Limited access to entrepreneurial skills and market opportunities",
        objectives: "To enhance entrepreneurial skills and create direct marketing venues for youth-made products",
        performanceIndicator: "Increased youth participation in entrepreneurial activities",
        targetYear1: "20",
        targetYear2: "40",
        targetYear3: "60",
        targetYear4: "60",
        ppas: "Entrepreneurship Skills 3-Day Intensive Workshop & Youth Trade Expo Day",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK Committee on Economic Empowerment"
      }
    ]
  },
  {
    id: "sec-global-mobility",
    centerName: "GLOBAL MOBILITY",
    agendaStatement: "By 2028, more Filipino youth participate in relevant national, ASEAN, global forums and activities related to education, training, employment and youth policy advocacy.",
    items: [
      {
        id: "gm-1",
        concern: "Lack of knowledge about global and national opportunities among local youth",
        objectives: "Increase awareness and accessibility of international scholarships, internships, and exchange programs",
        performanceIndicator: "Number of informational workshops held; Number of participants attended",
        targetYear1: "50",
        targetYear2: "100",
        targetYear3: "150",
        targetYear4: "200",
        ppas: "Youth Passport: Global and National Opportunities Expo",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Global Mobility, NYC"
      },
      {
        id: "gm-2",
        concern: "Financial barriers to regional and national youth engagement",
        objectives: "Provide financial support and resources to enable youth delegates to participate in external mobility programs",
        performanceIndicator: "Number of stipend recipients who successfully participate in accredited delegate programs",
        targetYear1: "5",
        targetYear2: "10",
        targetYear3: "15",
        targetYear4: "20",
        ppas: "Barangay Youth Travel and Delegation Stipend Fund",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Global Mobility"
      },
      {
        id: "gm-3",
        concern: "Limited access to modern digital literacy and remote economy skills",
        objectives: "Expand digital skills learning and freelancing opportunities among local youth",
        performanceIndicator: "Number of digital learning trainings conducted; Number of youths earning in digital economy",
        targetYear1: "15",
        targetYear2: "30",
        targetYear3: "45",
        targetYear4: "50",
        ppas: "Basic Digital Skills and Virtual Assistance Training Bootcamp",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Global Mobility, DICT"
      },
      {
        id: "gm-4",
        concern: "Language barriers affecting competitiveness and global engagement",
        objectives: "Enhance basic conversational proficiency in English and ASEAN foreign languages",
        performanceIndicator: "Number of participants achieving basic conversational proficiency",
        targetYear1: "20",
        targetYear2: "40",
        targetYear3: "60",
        targetYear4: "70",
        ppas: "Basic Multilingual Communication and Language Workshop",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Global Mobility, TESDA"
      },
      {
        id: "gm-5",
        concern: "Lack of community integration and psycho-social support for children of Overseas Filipino Workers (OFWs)",
        objectives: "Facilitate community integration and provide peer support network for OFW youth dependents",
        performanceIndicator: "Number of OFW dependents engaged in peer support",
        targetYear1: "30",
        targetYear2: "60",
        targetYear3: "90",
        targetYear4: "100",
        ppas: "OFW Youth Dependents Circle and Mentorship Program",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Global Mobility, MSWDO"
      }
    ]
  },
  {
    id: "sec-environment",
    centerName: "ENVIRONMENT",
    agendaStatement: "By 2028, more youth are engaged in advocacy, implementation and monitoring of environment-related legislations and policies and are champions of climate change adaptation and disaster risk reduction and management.",
    items: [
      {
        id: "env-1",
        concern: "Lack of awareness of RA 9003 (Ecological Solid Waste Management Act)",
        objectives: "To educate and foster community compliance on ecological solid waste segregation",
        performanceIndicator: "Number of youth participated in environmental symposia",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Conduct of Barangay Ecological Symposium about RA 9003",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Environment & MENRO"
      },
      {
        id: "env-2",
        concern: "Increasing number of youth lack of knowledge about basic life support and BDRRM",
        objectives: "Empower youth with disaster preparedness, rescue drills, and first-aid response skills",
        performanceIndicator: "Number of certified youth emergency responders",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Conduct of First Aid Training and Barangay Disaster Preparedness Drills",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Environment & MENRO, MDRRMO"
      },
      {
        id: "env-3",
        concern: "Increasing incidence of littering and improper trash disposal",
        objectives: "Foster civic discipline through regular clean-up drives across sitios and public plazas",
        performanceIndicator: "Number of youth volunteers mobilized",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Conduct of Regular 'Pulot Basura' Ecological Community Drives",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Environment & MENRO"
      },
      {
        id: "env-4",
        concern: "Soil erosion and cut trees along riparian buffer zones and riversides",
        objectives: "Protect local watershed and prevent riverbank erosion through native tree propagation",
        performanceIndicator: "Number of endemic tree seedlings planted along riverbanks",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Conduct of Riverbank Tree Planting Activity ('Luntian Para sa Kinabukasan')",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Environment & MENRO, DENR"
      },
      {
        id: "env-5",
        concern: "Lack of waste receptacle bins in public communal spaces",
        objectives: "Provide segregated waste receptacles across high-density youth gathering areas",
        performanceIndicator: "Number of public trash can sets installed",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Installation and Maintenance of Segregated Public Trash Bins",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Environment & MENRO"
      },
      {
        id: "env-6",
        concern: "Lack of youth climate change adaptation literacy",
        objectives: "Equip youth with scientific insights on climate risks and local mitigation actions",
        performanceIndicator: "Number of youth attendees in climate change orientations",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Orientation and Symposium on Localized Climate Change Adaptation",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Environment & MENRO"
      },
      {
        id: "env-7",
        concern: "Lack of fire prevention and mitigation readiness",
        objectives: "Equip youth with household fire safety protocols, fire extinguisher operation, and evacuation procedures",
        performanceIndicator: "Number of youth trained in basic fire fighting and safety",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Fire Fighting, Household Safety and Evacuation Skills Training",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Environment & MENRO, BFP"
      }
    ]
  },
  {
    id: "sec-agriculture",
    centerName: "AGRICULTURE",
    agendaStatement: "By 2028, young people are actively involved in food security efforts and in promoting agricultural development.",
    items: [
      {
        id: "ag-1",
        concern: "Inadequate knowledge about 'agri-entrepreneurial' skills among young people",
        objectives: "Enhance knowledge and application of agribusiness and value-adding processing among youth",
        performanceIndicator: "Number of youth trained in agri-entrepreneurship; Number of agribusiness startups incubated",
        targetYear1: "30",
        targetYear2: "60",
        targetYear3: "90",
        targetYear4: "100",
        ppas: "Agri-Entrepreneurship Workshops & Startup Incubation for Youth Agribusinesses",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK Committee on Agriculture, SK Chairperson, MAGRO"
      },
      {
        id: "ag-2",
        concern: "Limited exposure to advanced modern farming practices",
        objectives: "Broaden youth agricultural perspectives via benchmarking at model agrarian learning sites",
        performanceIndicator: "Number of benchmarking trips completed; Number of youth agri awards conferred",
        targetYear1: "1",
        targetYear2: "2",
        targetYear3: "2",
        targetYear4: "2",
        ppas: "Agri-Learn Benchmarking Educational Tours & Annual Youth Agri-preneur Awards",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK Committee on Agriculture, SK Chairperson, MAGRO, Farmers' Assns"
      },
      {
        id: "ag-3",
        concern: "Low level of youth involvement in local vegetable production and consumption",
        objectives: "Increase youth participation in backyard and container vegetable gardening for household nutrition",
        performanceIndicator: "Number of youth actively participating in vegetable competitions",
        targetYear1: "20",
        targetYear2: "40",
        targetYear3: "60",
        targetYear4: "70",
        ppas: "Basic Crop Production Seminars & Youth Gardening Competitions ('Tanum Kabataan Showdown')",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK Committee on Agriculture, SK Chairperson, MAGRO"
      },
      {
        id: "ag-4",
        concern: "Absence of an organized youth agricultural community group",
        objectives: "Form institutional 4H-affiliated youth agricultural clubs in the barangay",
        performanceIndicator: "Number of youth agricultural clubs established; Number of active certified youth growers",
        targetYear1: "1",
        targetYear2: "1",
        targetYear3: "1",
        targetYear4: "1",
        ppas: "Youth Agricultural Club Organization & 'Young Growers' Practical Skills Workshops",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK Committee on Agriculture, SK Chairperson, MAGRO"
      },
      {
        id: "ag-5",
        concern: "Lack of direct marketing outlets for young farmers' agricultural produce",
        objectives: "Establish recurring weekend pop-up farmers markets run by local youth producers",
        performanceIndicator: "Number of youth vendors participating",
        targetYear1: "15",
        targetYear2: "30",
        targetYear3: "45",
        targetYear4: "50",
        ppas: "'Barato Bazaar: Barangay Youth Agri Market'",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Agriculture, SK Chairperson, MAGRO"
      },
      {
        id: "ag-6",
        concern: "Limited access to smart and precision agricultural technologies",
        objectives: "Train young farmers in drone crop monitoring, drip irrigation, and organic soil formulation",
        performanceIndicator: "Number of youth trained in agri-tech tools",
        targetYear1: "25",
        targetYear2: "50",
        targetYear3: "75",
        targetYear4: "80",
        ppas: "Modern Agri-Tech and Smart Agriculture Workshops",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Agriculture, SK Chairperson, MAGRO"
      },
      {
        id: "ag-7",
        concern: "Declining interest in formal agricultural education and degrees among youth",
        objectives: "Promote agriculture and agribusiness as viable, lucrative, and prestigious career choices",
        performanceIndicator: "Number of enrollees in agricultural courses; Number of schools visited for career talks",
        targetYear1: "15",
        targetYear2: "30",
        targetYear3: "45",
        targetYear4: "50",
        ppas: "Agri-Education Fairs & Secondary School Agriculture Career Awareness Roadshows",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK Committee on Education & Agriculture, SK Chairperson, MAGRO, State Colleges"
      },
      {
        id: "ag-8",
        concern: "High cost of quality agricultural inputs for young starting farmers",
        objectives: "Subsidize hybrid seeds, organic fertilizers, and garden toolkits for youth agriculturists",
        performanceIndicator: "Number of young farmers receiving starter kits and inputs",
        targetYear1: "50",
        targetYear2: "100",
        targetYear3: "150",
        targetYear4: "200",
        ppas: "Youth Farm Input and Starter Seedling Distribution Program",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Agriculture, SK Chairperson, MAGRO"
      }
    ]
  },
  {
    id: "sec-peace-security",
    centerName: "PEACE BUILDING AND SECURITY",
    agendaStatement: "By 2028, more youth are able to live in safe and peaceful home and community environments and are not subject to any form of abuse and human rights violations.",
    items: [
      {
        id: "ps-1",
        concern: "Low level of interest on peace-related advocacy programs among youth",
        objectives: "Increase youth consciousness on community conflict resolution, human rights, and social cohesion",
        performanceIndicator: "Number of youth participants attended peace conventions; Number of forums held",
        targetYear1: "100",
        targetYear2: "200",
        targetYear3: "300",
        targetYear4: "400",
        ppas: "Barangay Youth Peace Symposium & Annual Youth Peace Summit",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK Committee on Peace-Building and Security, Youth for Peace Movement (YFPM)"
      },
      {
        id: "ps-2",
        concern: "Inadequate knowledge about the effects and consequences of using illegal drugs",
        objectives: "Increase awareness on legal penalties and health hazards of illicit drugs (Barkada Kontra Droga)",
        performanceIndicator: "Number of participants attended drug prevention symposium",
        targetYear1: "100",
        targetYear2: "200",
        targetYear3: "300",
        targetYear4: "400",
        ppas: "Conduct of Symposium on Anti-Drug Abuse Program (BADAC Youth Linkage)",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Peace-Building and Security, PNP"
      },
      {
        id: "ps-3",
        concern: "Inadequate knowledge and vulnerability of youth to violent extremism and insurgency recruitment",
        objectives: "Enhance critical thinking and counter-radicalization resilience among vulnerable youth",
        performanceIndicator: "Number of youth reached in peace awareness sessions",
        targetYear1: "100",
        targetYear2: "200",
        targetYear3: "300",
        targetYear4: "400",
        ppas: "Conduct of Symposium on Anti-Insurgency Awareness & National Security (ELCAC Youth Track)",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Peace-Building and Security, AFP"
      }
    ]
  },
  {
    id: "sec-social-inclusion",
    centerName: "SOCIAL INCLUSION AND EQUITY",
    agendaStatement: "By 2028, more youth are included in the design/planning, implementation, monitoring and evaluation of youth programs and services and are protected from discrimination, abuse and exploitation.",
    items: [
      {
        id: "sie-1",
        concern: "Lack of dedicated developmental programs for differently-abled (PWD) youth",
        objectives: "Provide tailored skills training, assistive aids, and inclusive sports for differently-abled youth",
        performanceIndicator: "Increased number of differently-abled youth engaged in customized activities",
        targetYear1: "15",
        targetYear2: "30",
        targetYear3: "50",
        targetYear4: "60",
        ppas: "Conduct of Inclusive Skills & Development Workshop for PWD Youth",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Social Inclusion and Equity"
      },
      {
        id: "sie-2",
        concern: "Lack of cultural integration and representation for Indigenous Peoples (IP) youth",
        objectives: "Protect cultural heritage and expand economic and educational access for tribal IP youth",
        performanceIndicator: "Number of IP-specific activities conducted; Number of IP youth engaged",
        targetYear1: "30",
        targetYear2: "60",
        targetYear3: "90",
        targetYear4: "100",
        ppas: "IP Youth Day Celebration & IP Youth Connect Cultural Forum",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Social Inclusion and Equity, NCIP"
      },
      {
        id: "sie-3",
        concern: "Presence of gender stereotyping, bullying, and discrimination regarding gender identity",
        objectives: "Provide education on SOGIESC, safe talk spaces, and gender sensitivity",
        performanceIndicator: "Number of gender awareness support sessions held",
        targetYear1: "1",
        targetYear2: "2",
        targetYear3: "2",
        targetYear4: "3",
        ppas: "Gender Harmony: Safe Talk Spaces Orientation, Gender Sensitivity Seminars & LGBTQ+ Pride Day",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Social Inclusion and Equity"
      }
    ]
  },
  {
    id: "sec-health",
    centerName: "HEALTH",
    agendaStatement: "By 2028, the youth are able to make healthy choices, to be safe from preventable illness, and to access quality and affordable health services.",
    items: [
      {
        id: "hl-1",
        concern: "Inadequate knowledge about basic emergency response and first aid among youth",
        objectives: "Train youth in cardiopulmonary resuscitation (CPR), basic life support, and wound dressing",
        performanceIndicator: "Number of youth trained and certified in BLS and first aid",
        targetYear1: "20",
        targetYear2: "40",
        targetYear3: "60",
        targetYear4: "70",
        ppas: "Basic Life Support with First Aid Training & Emergency Response Drills (ERD)",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK Committee on Health, Philippine Red Cross"
      },
      {
        id: "hl-2",
        concern: "Lack of personal hygiene and self-discipline among adolescent students",
        objectives: "Promote healthy hygiene routines and self-care practices in elementary and secondary schools",
        performanceIndicator: "Number of students benefited; Number of hygiene kits distributed",
        targetYear1: "20",
        targetYear2: "20",
        targetYear3: "20",
        targetYear4: "20",
        ppas: "Project G.A.N.D.A (Grooming and Neatness Development Assistance) & Mass Distribution of Personal Hygiene Kits",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK Committee on Health, Teachers, SK Chairperson"
      },
      {
        id: "hl-3",
        concern: "Increasing incidence of teenage pregnancy among secondary students and OSY",
        objectives: "Decrease the number of teenage pregnancy cases through age-appropriate reproductive health education",
        performanceIndicator: "Number of youth participated in reproductive health forums",
        targetYear1: "20",
        targetYear2: "20",
        targetYear3: "20",
        targetYear4: "20",
        ppas: "Conduct of Adolescent Reproductive Health & Anti-Teenage Pregnancy Symposium",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Health, MHO, Midwife, BHW, DOH, SK Chairperson"
      },
      {
        id: "hl-4",
        concern: "Low youth awareness on sexually transmitted infections (STIs) and HIV/AIDS",
        objectives: "Educate adolescents on prevention, destigmatization, and confidential testing options",
        performanceIndicator: "Number of youth reached in HIV/AIDS awareness workshops",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "HIV/AIDS and STI Prevention Awareness Symposium",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Health, MHO, Midwife, DOH, SK Chairperson"
      },
      {
        id: "hl-5",
        concern: "Lack of voluntary blood donors in times of barangay medical emergencies",
        objectives: "Mobilize healthy youth donors to maintain a reliable blood bank supply for the municipality",
        performanceIndicator: "Number of youth blood donors mobilized",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Annual Youth Mass Blood Letting Activity ('Dugong Kabataan, Dugong Buhay')",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Health, MHO, Red Cross, SK Chairperson"
      },
      {
        id: "hl-6",
        concern: "Absence of a safe adolescent teen center and youth counseling corner",
        objectives: "Establish a friendly, non-judgmental teen center for recreational, counseling, and wellness visits",
        performanceIndicator: "Number of adolescents utilizing teen center services",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Barangay Teen Center Operations & Youth Wellness Corner",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Health, MHO, Midwife, BHW, SK Chairperson"
      },
      {
        id: "hl-7",
        concern: "Rising cases of anxiety, depression, and mental health distress among youth",
        objectives: "Promote mental health literacy, peer counseling, and professional intervention hotlines",
        performanceIndicator: "Number of youth participated in mental wellness sessions",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Mental Health Awareness Symposium & Peer Counseling Network",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Health, MHO, SK Chairperson"
      },
      {
        id: "hl-8",
        concern: "Sedentary lifestyle and lack of regular preventive medical screenings",
        objectives: "Foster physical wellness and provide free basic health check-ups and vitamins for youth",
        performanceIndicator: "Number of youth screened in medical missions and active in fitness",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Weekly Community Zumba Fitness Sessions & Free Medical/Dental Mission for Youth",
        budgetCategory: "MOOE",
        budgetAmount: 4000000,
        personResponsible: "SK Committee on Health, MHO, SK Chairperson"
      }
    ]
  },
  {
    id: "sec-education",
    centerName: "EDUCATION",
    agendaStatement: "By 2028, more youth have reached the next level of education and have enhanced their practice of profession.",
    items: [
      {
        id: "ed-1",
        concern: "Increasing number of high school and college students disheartened to go to school due to financial hardship",
        objectives: "Provide timely educational assistance and book stipends to impoverished youth scholars",
        performanceIndicator: "Number of students received financial/cash assistance",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Project S.K.W.E.L.A (Sangguniang Kabataan Working for Education & Learner's Assistance)",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Education, SK Chairperson, DepEd"
      },
      {
        id: "ed-2",
        concern: "Shortage of basic school supplies for indigent elementary and high school learners",
        objectives: "Distribute complete bags, notebooks, and writing materials to students at the opening of classes",
        performanceIndicator: "Number of students received school supplies packages",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Brigada Skwela Support & Mass Distribution of School Supplies",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Education, SK Chairperson, DepEd"
      },
      {
        id: "ed-3",
        concern: "Need for recognition and incentive for academic excellence and board exam achievers",
        objectives: "Boost the number of graduates and professional board passers by 20% through merit incentives",
        performanceIndicator: "Number of honor graduates and board passers awarded",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Gawad sa Mag-aaral Academic Excellence Incentive Program",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Education, SK Chairperson, DepEd"
      },
      {
        id: "ed-4",
        concern: "Out-of-school youth needing secondary completion credentials",
        objectives: "Support OSY enrollment in DepEd Alternative Learning System (ALS) modular programs",
        performanceIndicator: "Number of OSY learners completing ALS modules and certification",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Alternative Learning System (ALS) Study and Module Support Program",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Education, SK Chairperson, DepEd"
      },
      {
        id: "ed-5",
        concern: "Increasing number of youth unable to connect to internet for educational activities and research",
        objectives: "Provide free high-speed community Wi-Fi and student e-learning computer terminals",
        performanceIndicator: "Number of students utilizing barangay e-learning study hall",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "Provision and Maintenance of Barangay E-Learning Study Facility",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Education, SK Chairperson, DepEd"
      },
      {
        id: "ed-6",
        concern: "Lack of printing materials and equipment for students' modular assignments and projects",
        objectives: "Provide free printing, photocopying, and paper supplies for students and youth organizations",
        performanceIndicator: "Number of students/youths served by free printing program",
        targetYear1: "50",
        targetYear2: "50",
        targetYear3: "50",
        targetYear4: "50",
        ppas: "P.R.I.M.E.S (Printing Materials and Equipment Support for Students)",
        budgetCategory: "MOOE",
        budgetAmount: 2000000,
        personResponsible: "SK Committee on Education, SK Chairperson, DepEd"
      }
    ]
  }
];

export function calculateCbydpSectionTotal(section: CbydpCenterSection): number {
  return section.items.reduce((acc, item) => acc + (Number(item.budgetAmount) || 0), 0);
}

export function calculateCbydpGrandTotal(doc: CbydpDocument): number {
  return doc.sections.reduce((acc, sec) => acc + calculateCbydpSectionTotal(sec), 0);
}

export function getInitialCbydpTemplate(barangayName = "Kapatagan", chairperson?: string, treasurer?: string): CbydpDocument {
  const doc: CbydpDocument = {
    id: `cbydp-${barangayName.toLowerCase().replace(/\s+/g, '-')}-2026-2028`,
    barangayName,
    municipality: "LAAK",
    province: "DAVAO DE ORO",
    calendarYears: "2026-2028",
    targetYearLabels: ["2026", "2027", "2028"],
    preparedByName: treasurer || "FLORY ANN A. JAKOSALEM",
    preparedByTitle: "SK Treasurer",
    approvedByName: chairperson || "HON. JAMES JOHN G. CATUBAY",
    approvedByTitle: "SK Chairperson",
    attestedByName: "HON. SK SECRETARY",
    attestedByTitle: "SK Secretary",
    sections: JSON.parse(JSON.stringify(DEFAULT_CBYDP_SECTIONS)),
    totalAppropriation: 184000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: "Draft"
  };

  doc.totalAppropriation = calculateCbydpGrandTotal(doc);
  return doc;
}

export function loadCbydpDocument(barangayName = "Kapatagan", chairperson?: string, treasurer?: string): CbydpDocument {
  const storageKey = `skompas_cbydp_doc_${barangayName.toLowerCase().replace(/\s+/g, '_')}`;
  const saved = localStorage.getItem(storageKey);
  if (saved) {
    try {
      const parsed = JSON.parse(saved) as CbydpDocument;
      parsed.totalAppropriation = calculateCbydpGrandTotal(parsed);
      return parsed;
    } catch (e) {
      console.error("Failed to parse saved CBYDP, loading standard template", e);
    }
  }

  // Also check general key
  const generalSaved = localStorage.getItem("skompas_cbydp_current_doc");
  if (generalSaved) {
    try {
      const parsed = JSON.parse(generalSaved) as CbydpDocument;
      if (parsed.barangayName.toLowerCase() === barangayName.toLowerCase()) {
        parsed.totalAppropriation = calculateCbydpGrandTotal(parsed);
        return parsed;
      }
    } catch (e) {
      // ignore
    }
  }

  return getInitialCbydpTemplate(barangayName, chairperson, treasurer);
}

export function saveCbydpDocument(doc: CbydpDocument): void {
  const updatedDoc: CbydpDocument = {
    ...doc,
    updatedAt: new Date().toISOString(),
    totalAppropriation: calculateCbydpGrandTotal(doc)
  };

  const storageKey = `skompas_cbydp_doc_${updatedDoc.barangayName.toLowerCase().replace(/\s+/g, '_')}`;
  localStorage.setItem(storageKey, JSON.stringify(updatedDoc));
  localStorage.setItem("skompas_cbydp_current_doc", JSON.stringify(updatedDoc));
  localStorage.setItem("skompas_status_cbydp", "submitted");

  // Record submission into shared barangay system
  saveDocumentSubmission({
    barangayName: updatedDoc.barangayName,
    docCode: "CBYDP",
    docType: "CBYDP",
    title: `CBYDP ${updatedDoc.calendarYears} - Barangay ${updatedDoc.barangayName}`,
    yearOrPeriod: updatedDoc.calendarYears,
    submittedBy: updatedDoc.approvedByName,
    officerRole: "Chairman",
    totalBudget: updatedDoc.totalAppropriation,
    contentSnapshot: {
      sectionsCount: updatedDoc.sections.length,
      totalAppropriation: updatedDoc.totalAppropriation,
      calendarYears: updatedDoc.calendarYears
    }
  });

  // Dispatch custom event for real-time reactivity across components
  window.dispatchEvent(new CustomEvent("skompas_cbydp_updated", { detail: updatedDoc }));
}

export function resetCbydpToDefault(barangayName: string, chairperson?: string, treasurer?: string): CbydpDocument {
  const fresh = getInitialCbydpTemplate(barangayName, chairperson, treasurer);
  saveCbydpDocument(fresh);
  return fresh;
}

export function exportCbydpJson(doc: CbydpDocument): string {
  return JSON.stringify(doc, null, 2);
}

export function importCbydpFromJson(jsonStr: string): CbydpDocument {
  const parsed = JSON.parse(jsonStr) as CbydpDocument;
  if (!parsed.sections || !Array.isArray(parsed.sections)) {
    throw new Error("Invalid CBYDP JSON format: missing sections array.");
  }
  parsed.totalAppropriation = calculateCbydpGrandTotal(parsed);
  return parsed;
}
