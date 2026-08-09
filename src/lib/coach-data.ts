// V2 content layer for Mainframe Coach.
// NOTE: all evaluation, transcription and question generation below is LOCAL MOCK
// logic for prototyping. No AI backend is connected yet.

export type Difficulty = "Warm-up" | "Core" | "Deep" | "Senior";

export const difficultyOrder: Difficulty[] = ["Warm-up", "Core", "Deep", "Senior"];

export interface BankQuestion {
  id: string;
  topic: string;
  category: string;
  difficulty: Difficulty;
  prompt: string;
  /** Concepts a strong answer should touch — drives the mock evaluation. */
  expects: string[];
  /** Follow-up asked when the answer was strong. */
  deeper: string;
  /** Follow-up asked when the answer was weak. */
  simpler: string;
  modelAnswer: string;
}

export const questionBank: BankQuestion[] = [
  {
    id: "q-s0c7",
    topic: "Abends",
    category: "Debugging Scenario",
    difficulty: "Core",
    prompt:
      "A COBOL batch program that has run cleanly for months suddenly starts abending with S0C7 in production. How would you investigate it?",
    expects: ["sysudump", "ceedump", "offset", "comp-3", "packed", "pmap", "numeric", "input file"],
    deeper:
      "Good. Now go deeper — how would you identify the exact field responsible for the data exception, and prove it from the dump rather than guessing?",
    simpler:
      "Let's take a step back. What does the S0C7 completion code actually mean, and which dataset would you look at first?",
    modelAnswer:
      "Start from the SYSOUT and SYSUDUMP/CEEDUMP: S0C7 is a data exception, so the failing instruction is arithmetic on invalid packed-decimal. Take the failing offset, map it through the PMAP or compiler listing to the exact COBOL statement, then inspect the receiving field's PIC/USAGE. Confirm the bad data by checking the input record layout and the producing job's most recent GDG generation, then add a NUMERIC/INSPECT validation and restart with RD=R.",
  },
  {
    id: "q-db2-lock",
    topic: "DB2",
    category: "Concurrency",
    difficulty: "Deep",
    prompt:
      "Your online CICS transaction starts receiving -911 SQLCODEs during the nightly batch window. Walk me through your diagnosis.",
    expects: ["deadlock", "timeout", "isolation", "cursor stability", "commit", "lock escalation", "-911", "unit of work"],
    deeper:
      "Right. If you could not change the batch schedule, how would you reduce lock contention at the application level?",
    simpler: "Simpler first: what is the difference between a -911 and a -913, and who resolves each?",
    modelAnswer:
      "-911 means the unit of work was rolled back after a deadlock or timeout. Check the DB2 statistics / IFCID deadlock trace to see the contending threads and the resources. Typically batch is holding page or table-space locks too long — shorten commit frequency, use cursor stability instead of repeatable read, avoid lock escalation by tuning LOCKMAX, and access tables in a consistent order across programs to break the deadlock cycle.",
  },
  {
    id: "q-cics-pseudo",
    topic: "CICS",
    category: "Transaction Design",
    difficulty: "Core",
    prompt:
      "Explain pseudo-conversational design in CICS and why it matters for a high-volume transaction.",
    expects: ["commarea", "return transid", "resources", "task", "state", "tsq", "scalability"],
    deeper:
      "Good. Where would you keep state that is too large for a COMMAREA, and what are the trade-offs of each option?",
    simpler: "Let's simplify — what happens to a CICS task between the SEND MAP and the user pressing Enter?",
    modelAnswer:
      "In a pseudo-conversational transaction the task ends after sending the map and issues RETURN TRANSID with a COMMAREA, so no resources are held while the user thinks. State travels in the COMMAREA, a channel/container, or a TSQ keyed by terminal. This keeps task count and storage low, which is what makes the region scale to thousands of concurrent users.",
  },
  {
    id: "q-jcl-restart",
    topic: "JCL",
    category: "Production Control",
    difficulty: "Core",
    prompt:
      "A multi-step production job failed at step 4 of 7. How do you restart it safely?",
    expects: ["restart", "rd=r", "checkpoint", "gdg", "catalog", "cond", "idcams", "delete"],
    deeper: "How would you handle a GDG that was already rolled forward by the failing step?",
    simpler: "First — how do you tell which step failed and with what condition code?",
    modelAnswer:
      "Read the SYSOUT job log to find the failing step and completion/condition code. Before restarting, undo side effects: uncatalog or delete datasets created by the failed step, and check whether the GDG generation was rolled. Then restart with RESTART=stepname (or checkpoint restart via RD=R) after confirming with production control, and verify downstream COND codes still evaluate correctly.",
  },
  {
    id: "q-vsam",
    topic: "VSAM",
    category: "File Handling",
    difficulty: "Core",
    prompt:
      "A batch job opening a KSDS is returning file status 93. What is happening and how do you resolve it?",
    expects: ["status 93", "resource unavailable", "share options", "cics", "open", "close", "verify", "allocation"],
    deeper: "How would you design the job so this contention cannot happen again?",
    simpler: "Where in your COBOL program would you actually see that file status, and what should the program do with it?",
    modelAnswer:
      "File status 93 means the resource is unavailable — usually the KSDS is still open to CICS or another job with incompatible SHAREOPTIONS. Confirm with the CICS file inventory, close the file in the region or schedule the batch outside the online window. Longer term use a shared VSAM RLS setup or an extract copy so batch never contends with the online region.",
  },
  {
    id: "q-cobol-tables",
    topic: "COBOL",
    category: "Language Depth",
    difficulty: "Warm-up",
    prompt:
      "Explain the difference between OCCURS DEPENDING ON and a fixed OCCURS table, and when each is appropriate.",
    expects: ["variable length", "depending on", "record length", "subscript", "index", "performance"],
    deeper: "How does ODO affect the record length written to a variable-blocked dataset?",
    simpler: "Start simple — what does OCCURS actually do in the data division?",
    modelAnswer:
      "A fixed OCCURS reserves storage for the maximum entries every time; OCCURS DEPENDING ON sizes the group from a control field so variable-length records only carry the occurrences present. ODO saves I/O on variable-blocked datasets, but the control field must be set before any reference and subscript ranges must be validated to avoid S0C4.",
  },
  {
    id: "q-arch",
    topic: "Architecture",
    category: "Modernization",
    difficulty: "Senior",
    prompt:
      "You are asked to expose an existing CICS transaction as a REST API without rewriting the COBOL. How would you approach it?",
    expects: ["z/os connect", "commarea", "channel", "api", "json", "security", "throttling", "regression"],
    deeper: "How would you protect the region from an API client that suddenly sends 10x the traffic?",
    simpler: "What are the ways a CICS program can be invoked from outside the mainframe today?",
    modelAnswer:
      "Front the transaction with z/OS Connect (or a CICS web service) mapping JSON to the COMMAREA or channel/container structure, keeping the COBOL untouched. Handle security with the API gateway plus RACF surrogate identity, add throttling and MAXTASK protection so external traffic cannot starve the region, and build a regression harness that replays real COMMAREA payloads.",
  },
  {
    id: "q-mq",
    topic: "MQ",
    category: "Messaging",
    difficulty: "Deep",
    prompt:
      "A queue is filling up and the consuming batch job appears to be running. How do you diagnose it?",
    expects: ["queue depth", "syncpoint", "commit", "backout", "getwait", "dead letter", "poison message"],
    deeper: "How would you make the consumer resilient to a poison message without stopping the flow?",
    simpler: "What do IPPROCS and OPPROCS on a queue tell you?",
    modelAnswer:
      "Check IPPROCS/OPPROCS and the current depth to confirm a consumer is really attached. If the consumer is looping on a backed-out message, the backout count will climb — route it to a backout requeue or dead-letter queue after a threshold. Also verify the GET is inside syncpoint with a sensible commit interval so throughput is not one message per unit of work.",
  },
];

// ---- Interview modes ----

export type ModeId = "realistic" | "coaching" | "practice";

export interface InterviewMode {
  id: ModeId;
  name: string;
  tagline: string;
  description: string;
  bullets: string[];
}

export const interviewModes: InterviewMode[] = [
  {
    id: "realistic",
    name: "Realistic",
    tagline: "Simulates an actual interview",
    description:
      "The interviewer stays professional and neutral. No corrections during the interview — you receive the full evaluation at the end.",
    bullets: ["Spoken questions", "Natural follow-ups", "Adaptive difficulty", "Evaluation at the end"],
  },
  {
    id: "coaching",
    name: "Coaching",
    tagline: "Learn as you go",
    description:
      "After every answer you get a concise score, what you did well, what you missed and the technical correction — then the interview continues.",
    bullets: ["Score after each answer", "Technical corrections", "Model answer guidance", "Live panel updates"],
  },
  {
    id: "practice",
    name: "Practice",
    tagline: "Fast repetition",
    description: "Short one-line feedback after each answer, then straight on to the next question.",
    bullets: ["Short feedback", "Fast pace", "Lower pressure", "Great for warm-ups"],
  },
];

export const interviewTracks = [
  { id: "full", name: "Full Mainframe", topics: ["COBOL", "JCL", "DB2", "CICS", "VSAM", "Abends"] },
  { id: "cobol", name: "COBOL Focus", topics: ["COBOL", "Abends"] },
  { id: "db2", name: "DB2 Focus", topics: ["DB2"] },
  { id: "cics", name: "CICS Focus", topics: ["CICS"] },
  { id: "support", name: "Production Support", topics: ["Abends", "JCL", "VSAM", "MQ"] },
  { id: "senior", name: "Senior Developer", topics: ["Architecture", "DB2", "CICS", "COBOL"] },
];

// ---- Interview memory (conceptual — derived from past sessions) ----

export const interviewMemory = {
  headline:
    "In your last two interviews, DB2 locking and CICS error handling were your weakest areas. This session will revisit both.",
  notes: [
    "DB2 locking — scored 58 and 61 in your last two sessions.",
    "CICS transaction flow — you skipped the follow-up on Aug 5.",
    "S0C7 debugging — improving: 64 → 79 over three sessions.",
  ],
  revisitTopics: ["DB2", "CICS"],
};

// ---- Candidate experience profile ----

export interface ProfileSkill {
  name: string;
  level: "Strong" | "Developing" | "Needs improvement";
  score: number;
  source: string;
}

export const experienceProfile: ProfileSkill[] = [
  { name: "COBOL", level: "Strong", score: 88, source: "Resume · 6 AI interviews" },
  { name: "JCL", level: "Strong", score: 84, source: "Practice history" },
  { name: "DB2", level: "Developing", score: 66, source: "AI interviews" },
  { name: "CICS", level: "Needs improvement", score: 55, source: "AI interviews · scenario lab" },
  { name: "Production Debugging", level: "Developing", score: 70, source: "Scenario lab" },
  { name: "Communication", level: "Strong", score: 82, source: "AI interviews" },
];

// ---- 14-day personalized roadmap ----

export interface RoadmapDay {
  day: number;
  title: string;
  kind: "Learn" | "Practice" | "AI Interview" | "Scenario" | "Expert";
  detail: string;
  done: boolean;
}

export const roadmap: RoadmapDay[] = [
  { day: 1, title: "CICS fundamentals", kind: "Learn", detail: "Task lifecycle, COMMAREA, pseudo-conversational", done: true },
  { day: 2, title: "CICS scenarios", kind: "Practice", detail: "Transaction abends and error handling", done: true },
  { day: 3, title: "DB2 locking", kind: "Learn", detail: "Isolation levels, -911/-913, lock escalation", done: true },
  { day: 4, title: "COBOL debugging", kind: "Practice", detail: "S0C7 / S0C4 dump reading", done: false },
  { day: 5, title: "AI Mock Interview", kind: "AI Interview", detail: "Realistic mode · full mainframe", done: false },
  { day: 6, title: "DB2 performance", kind: "Learn", detail: "Access paths, EXPLAIN, index design", done: false },
  { day: 7, title: "Production scenario: DB2 -911", kind: "Scenario", detail: "On-call incident simulation", done: false },
  { day: 8, title: "JCL restart & GDGs", kind: "Practice", detail: "Restart procedures and condition codes", done: false },
  { day: 9, title: "CICS deep dive", kind: "Learn", detail: "Channels, containers, BTS", done: false },
  { day: 10, title: "AI Mock Interview", kind: "AI Interview", detail: "Coaching mode · CICS + DB2", done: false },
  { day: 11, title: "VSAM & file status", kind: "Practice", detail: "KSDS contention, status codes", done: false },
  { day: 12, title: "Production scenario: S0C7", kind: "Scenario", detail: "Payroll batch failure", done: false },
  { day: 13, title: "Full mock interview", kind: "AI Interview", detail: "Senior track · realistic mode", done: false },
  { day: 14, title: "Live Expert Interview", kind: "Expert", detail: "Book a senior mainframe professional", done: false },
];

// ---- Resume → personalized interview (MOCK extraction) ----

export const resumeExtract = {
  fileName: "Sahanth_Kumar_Mainframe.pdf",
  years: 8,
  roles: [
    { title: "Senior Mainframe Developer", company: "Global Banking Services", period: "2021 — Present" },
    { title: "Mainframe Developer", company: "Insurance Systems Ltd", period: "2018 — 2021" },
  ],
  technologies: ["COBOL", "JCL", "DB2", "CICS", "VSAM", "MQ", "Endevor", "File-AID", "Control-M"],
  domains: ["Retail Banking", "Payments", "Insurance Claims"],
  projects: [
    "DB2 performance optimization for the nightly settlement batch",
    "CICS transaction migration to channels and containers",
    "Payroll batch redesign reducing runtime by 40%",
  ],
  responsibilities: [
    "Level-3 production support and on-call rotation",
    "Abend analysis and root-cause documentation",
    "Code reviews and junior developer mentoring",
  ],
};

export interface ResumeQuestion {
  source: string;
  prompt: string;
  followUp: string;
}

export const resumeQuestions: ResumeQuestion[] = [
  {
    source: "DB2 performance optimization for the nightly settlement batch",
    prompt:
      "You mentioned DB2 performance optimization on your resume. What was the performance problem, how did you identify the bottleneck, and what change did you actually make?",
    followUp: "How did you prove the improvement — what did you measure before and after?",
  },
  {
    source: "CICS transaction migration to channels and containers",
    prompt:
      "Your resume says you migrated CICS transactions to channels and containers. What drove that decision over staying with COMMAREA?",
    followUp: "How did you regression-test the migrated transactions without a full production replay?",
  },
  {
    source: "Level-3 production support and on-call rotation",
    prompt:
      "You've been on an on-call rotation for several years. Tell me about the most difficult production abend you resolved at 2 AM and how you approached it.",
    followUp: "What did you change afterwards so that incident could not repeat?",
  },
  {
    source: "Payroll batch redesign reducing runtime by 40%",
    prompt:
      "You claim a 40% runtime reduction on a payroll batch. Where did the time actually go before, and which change gave you the biggest win?",
    followUp: "What risk did that redesign introduce, and how did you mitigate it?",
  },
];

// ---- Production Scenario Lab ----

export interface ScenarioStep {
  id: string;
  label: string;
  /** What the AI reveals when the candidate asks for this evidence. */
  evidenceTitle: string;
  evidence: string;
  isCode?: boolean;
  insight: string;
}

export interface Scenario {
  id: string;
  code: string;
  title: string;
  category: "Abend" | "DB2" | "CICS" | "VSAM" | "JCL";
  difficulty: "Intermediate" | "Advanced" | "Senior";
  minutes: number;
  summary: string;
  incident: { job: string; step: string; abend: string; rc: string; time: string; system: string };
  brief: string;
  steps: ScenarioStep[];
  rootCause: string;
  evaluates: string[];
}

export const scenarios: Scenario[] = [
  {
    id: "payroll-s0c7",
    code: "S0C7",
    title: "PAYROLL01 fails at 02:14 AM",
    category: "Abend",
    difficulty: "Intermediate",
    minutes: 20,
    summary: "The nightly payroll calculation step abends with a data exception hours before the payment cut-off.",
    incident: { job: "PAYROLL01", step: "PAYCALC", abend: "S0C7", rc: "12", time: "02:14", system: "PRODA" },
    brief:
      "You are the on-call developer. PAYROLL01 abended in step PAYCALC. Payments must be released by 06:00. Decide what you want to look at first and explain why.",
    steps: [
      {
        id: "joblog",
        label: "Request the job log (SYSOUT)",
        evidenceTitle: "SYSOUT — PAYROLL01 / PAYCALC",
        evidence:
          "IEF450I PAYROLL01 PAYCALC - ABEND=S0C7 U0000 REASON=00000000\nIGZ0035S There was an unsuccessful attempt in program PAYCALC to convert a field.\nTIME=02.14.37  COND CODE 12",
        isCode: true,
        insight: "Confirms a data exception in PAYCALC, not a JCL or allocation failure.",
      },
      {
        id: "dump",
        label: "Pull the CEEDUMP / SYSUDUMP",
        evidenceTitle: "CEEDUMP extract",
        evidence:
          "Program Unit: PAYCALC   Offset: +0004A2\nStatement: 000472\nMachine State: PSW 078D1000 8A34C4A2\nGPR 5: 4040404040404040",
        isCode: true,
        insight: "Offset +0004A2 maps to statement 472; register content is all X'40' (spaces) where packed data was expected.",
      },
      {
        id: "cobol",
        label: "Inspect the COBOL around statement 472",
        evidenceTitle: "PAYCALC — source extract",
        evidence:
          "000468  01 WS-EMP-REC.\n000469     05 WS-EMP-ID      PIC X(08).\n000470     05 WS-GROSS-PAY   PIC S9(7)V99 COMP-3.\n000471\n000472  COMPUTE WS-NET-PAY = WS-GROSS-PAY - WS-DEDUCTIONS",
        isCode: true,
        insight: "WS-GROSS-PAY is COMP-3 but was loaded with spaces — the arithmetic on statement 472 is the failing instruction.",
      },
      {
        id: "input",
        label: "Check the input dataset and producing job",
        evidenceTitle: "Input GDG",
        evidence:
          "PROD.PAYROLL.EMPMAST(+0) created 02:02 by EMPEXTR\nEMPEXTR ended RC=04 — 'WARNING: 118 RECORDS WITH MISSING PAY DATA'",
        isCode: true,
        insight: "The upstream extract wrote blank pay fields for 118 employees — the true source of the corrupt data.",
      },
    ],
    rootCause:
      "EMPEXTR completed RC=04 after writing 118 records with blank (X'40') gross-pay fields. PAYCALC has no numeric validation before the COMPUTE on statement 472, so the first blank field raises S0C7. Correct fix: treat EMPEXTR RC=04 as a failure condition, and add a NUMERIC test plus a reject file in PAYCALC before restarting with RD=R.",
    evaluates: ["Troubleshooting approach", "Prioritization", "Technical correctness", "Reasoning", "Communication"],
  },
  {
    id: "db2-911",
    code: "-911",
    title: "Online transactions rolling back during batch window",
    category: "DB2",
    difficulty: "Advanced",
    minutes: 25,
    summary: "CICS transactions receive -911 SQLCODEs every night between 01:00 and 03:00.",
    incident: { job: "SETTLE04", step: "POSTTRAN", abend: "SQL -911", rc: "00", time: "01:20", system: "PRODB" },
    brief:
      "Customer-facing transactions are rolling back nightly. Batch must still finish by 04:00. Work out where the contention comes from.",
    steps: [
      {
        id: "sqlca",
        label: "Read the SQLCA from the failing transaction",
        evidenceTitle: "SQLCA",
        evidence: "SQLCODE = -911  SQLERRMC = 00C90088 / DSNDB06.TRANHIST\nREASON 00C90088 = DEADLOCK",
        isCode: true,
        insight: "Deadlock (not timeout) on TRANHIST — two units of work are taking locks in opposite order.",
      },
      {
        id: "trace",
        label: "Request the DB2 deadlock trace",
        evidenceTitle: "IFCID 172 extract",
        evidence:
          "HOLDER: PLAN=SETTLE04 CORRID=POSTTRAN  LOCK=PAGE  RES=TRANHIST\nWAITER: PLAN=CICSPROD CORRID=TX41      LOCK=PAGE  RES=TRANHIST\nHOLDER: PLAN=CICSPROD CORRID=TX41      LOCK=PAGE  RES=ACCTBAL",
        isCode: true,
        insight: "Classic cycle: batch takes TRANHIST then ACCTBAL, online takes them in the reverse order.",
      },
      {
        id: "commit",
        label: "Check the batch commit strategy",
        evidenceTitle: "SETTLE04 parameters",
        evidence: "COMMIT FREQUENCY = 50000 rows\nISOLATION = RR\nLOCKMAX = SYSTEM",
        isCode: true,
        insight: "Repeatable read plus a 50,000-row commit interval holds locks for minutes at a time.",
      },
    ],
    rootCause:
      "Batch runs with RR isolation and a 50,000-row commit interval while accessing TRANHIST before ACCTBAL; the online transaction takes them in the opposite order, producing a deadlock cycle. Fix: drop batch to cursor stability, commit every 1,000–2,000 rows, and standardise table access order across both programs.",
    evaluates: ["Concurrency reasoning", "Evidence gathering", "Technical correctness", "Prioritization", "Communication"],
  },
  {
    id: "cics-aeiz",
    code: "AEI0",
    title: "CICS transaction abending after a region restart",
    category: "CICS",
    difficulty: "Intermediate",
    minutes: 18,
    summary: "Transaction TX70 abends for every user after the weekend region recycle.",
    incident: { job: "CICSPRD1", step: "TX70", abend: "AEI0", rc: "—", time: "08:05", system: "PRODA" },
    brief: "First working day after a region recycle, TX70 fails immediately. Users are blocked. Investigate.",
    steps: [
      {
        id: "cics-log",
        label: "Check the CICS message log",
        evidenceTitle: "CSMT log",
        evidence: "DFHAC2206 Transaction TX70 failed with abend AEI0.\nDFHFC0951 File CUSTMAST is not open.",
        isCode: true,
        insight: "AEI0 is PGMIDERR/handle condition — here the underlying file is simply closed.",
      },
      {
        id: "fileinv",
        label: "Query the file inventory",
        evidenceTitle: "CEMT INQ FILE(CUSTMAST)",
        evidence: "FILE(CUSTMAST) VSAM CLOSED DISABLED\nBASEDSNAME(PROD.CUST.MASTER)",
        isCode: true,
        insight: "The file was left closed/disabled — the restart did not re-enable it.",
      },
      {
        id: "csd",
        label: "Review the CSD definition",
        evidenceTitle: "CSD FILE definition",
        evidence: "STATUS(DISABLED)  OPENTIME(FIRSTREF)  ADD(NO)",
        isCode: true,
        insight: "The definition itself ships DISABLED, so every cold start reproduces the outage.",
      },
    ],
    rootCause:
      "The CSD definition for CUSTMAST is STATUS(DISABLED), so the file never opens after a cold start and TX70 gets AEI0 on the first read. Immediate fix: CEMT SET FILE(CUSTMAST) OPEN ENABLED. Permanent fix: correct the CSD definition and add a post-restart health check.",
    evaluates: ["Triage speed", "Tool knowledge", "Technical correctness", "Permanent-fix thinking", "Communication"],
  },
  {
    id: "vsam-alloc",
    code: "IEF212I",
    title: "Nightly extract fails on dataset allocation",
    category: "VSAM",
    difficulty: "Intermediate",
    minutes: 15,
    summary: "A previously stable extract job fails before any step executes.",
    incident: { job: "EXTRCT02", step: "ALLOC", abend: "JCL ERROR", rc: "—", time: "23:40", system: "PRODA" },
    brief: "The job never reaches the program. Work out why the allocation is failing and what to do about it.",
    steps: [
      {
        id: "joblog2",
        label: "Read the allocation messages",
        evidenceTitle: "SYSOUT",
        evidence: "IEF212I EXTRCT02 ALLOC EXTFILE - DATA SET NOT FOUND\nIGD17101I DATA SET PROD.EXTRACT.DAILY(+1) NOT ALLOCATED",
        isCode: true,
        insight: "The GDG generation the step expects does not exist.",
      },
      {
        id: "gdg",
        label: "List the GDG base",
        evidenceTitle: "LISTCAT extract",
        evidence: "GDG BASE PROD.EXTRACT.DAILY  LIMIT(5)  SCRATCH\nGENERATIONS: 5 (oldest G0041V00 ... newest G0045V00)",
        isCode: true,
        insight: "The base is at its limit of 5 with SCRATCH — a prior rerun rolled generations unexpectedly.",
      },
    ],
    rootCause:
      "A manual rerun earlier in the evening rolled the GDG forward, so the (+1) reference collided with an already-rolled generation and the limit of 5. Fix: correct the generation reference for the rerun, or raise the GDG limit and re-drive the job with the intended relative generation.",
    evaluates: ["JCL knowledge", "Catalog reasoning", "Prioritization", "Communication"],
  },
];

// ---- Live Expert Interview ----

export interface Expert {
  id: string;
  name: string;
  initials: string;
  years: number;
  specialties: string[];
  rating: number;
  interviews: number;
  bio: string;
  slots: string[];
}

export const experts: Expert[] = [
  {
    id: "e-ravi",
    name: "Ravi Menon",
    initials: "RM",
    years: 22,
    specialties: ["COBOL", "CICS", "Production Support"],
    rating: 4.9,
    interviews: 340,
    bio: "Former lead mainframe engineer at a tier-1 bank. Runs technical panels for senior COBOL/CICS hires.",
    slots: ["Sat, Aug 15 · 10:00 AM", "Sat, Aug 15 · 4:30 PM", "Sun, Aug 16 · 11:00 AM"],
  },
  {
    id: "e-anita",
    name: "Anita Sharma",
    initials: "AS",
    years: 17,
    specialties: ["DB2", "Performance", "Architecture"],
    rating: 4.8,
    interviews: 212,
    bio: "DB2 systems specialist. Focuses on locking, access paths and batch performance interviews.",
    slots: ["Fri, Aug 14 · 7:00 PM", "Sat, Aug 15 · 9:00 AM", "Mon, Aug 17 · 6:00 PM"],
  },
  {
    id: "e-david",
    name: "David Okafor",
    initials: "DO",
    years: 25,
    specialties: ["JCL", "VSAM", "Modernization"],
    rating: 4.9,
    interviews: 415,
    bio: "Production control and modernization consultant. Known for realistic on-call scenario interviews.",
    slots: ["Sat, Aug 15 · 1:00 PM", "Sun, Aug 16 · 3:00 PM"],
  },
];

export const expertInterviewTypes = [
  "Full Mainframe",
  "COBOL",
  "JCL",
  "DB2",
  "CICS",
  "Production Support",
  "Senior Mainframe Developer",
];

export const expertLevels = ["Junior", "Mid-level", "Senior"];

export const expertFeedbackSample = {
  expert: "Ravi Menon",
  date: "Aug 2, 2026",
  ratings: [
    { name: "Technical Knowledge", score: 4 },
    { name: "Problem Solving", score: 4 },
    { name: "Communication", score: 3 },
    { name: "Mainframe Depth", score: 5 },
    { name: "Interview Readiness", score: 4 },
  ],
  didWell: [
    "Structured abend investigation — started from evidence, not assumptions.",
    "Excellent depth on VSAM organisation trade-offs.",
  ],
  improve: [
    "Answers ran long; lead with the conclusion then support it.",
    "Be precise about DB2 isolation levels rather than describing them loosely.",
  ],
  topics: ["DB2 locking", "CICS error handling", "Answer structuring"],
};

// ---- AI → Human progression ----

export const progression = {
  aiInterviews: 6,
  readiness: 87,
  breakdown: [
    { name: "COBOL", value: 91 },
    { name: "JCL", value: 88 },
    { name: "DB2", value: 84 },
    { name: "CICS", value: 79 },
    { name: "Communication", value: 86 },
  ],
  recommendation: "You're ready to experience a real interview.",
};
