// Realistic mainframe interview content shared across the app.
// All data is sample/prototyping data — no backend.

export type TopicId =
  | "COBOL"
  | "JCL"
  | "DB2"
  | "CICS"
  | "VSAM"
  | "IMS"
  | "MQ"
  | "Abends"
  | "Debugging"
  | "Architecture";

export interface TopicMastery {
  id: TopicId;
  name: string;
  mastery: number;
  completed: number;
  total: number;
  accuracy: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  strength: "Strong" | "Proficient" | "Developing" | "Needs work";
  note: string;
}

export const user = {
  name: "Sahanth",
  fullName: "Sahanth Kumar",
  role: "Senior Mainframe Developer",
  plan: "Pro",
  initials: "SK",
};

export const readiness = {
  overall: 68,
  technical: 74,
  communication: 82,
  problemSolving: 64,
  trend: 4, // % change this week
  streakDays: 12,
  level: "Approaching benchmark",
};

export const topics: TopicMastery[] = [
  { id: "COBOL", name: "COBOL", mastery: 82, completed: 41, total: 50, accuracy: 88, difficulty: "Intermediate", strength: "Strong", note: "Solid grasp of PERFORM, OCCURS and File I/O." },
  { id: "JCL", name: "JCL", mastery: 74, completed: 28, total: 40, accuracy: 79, difficulty: "Intermediate", strength: "Proficient", note: "Comfortable with GDGs and PROC overrides." },
  { id: "DB2", name: "DB2", mastery: 61, completed: 34, total: 50, accuracy: 66, difficulty: "Advanced", strength: "Developing", note: "Needs work on locking and -811 handling." },
  { id: "CICS", name: "CICS", mastery: 55, completed: 18, total: 40, accuracy: 58, difficulty: "Advanced", strength: "Needs work", note: "Weak on pseudo-conversational design." },
  { id: "VSAM", name: "VSAM", mastery: 70, completed: 22, total: 35, accuracy: 75, difficulty: "Intermediate", strength: "Proficient", note: "Good on KSDS vs ESDS trade-offs." },
  { id: "IMS", name: "IMS", mastery: 63, completed: 14, total: 30, accuracy: 68, difficulty: "Advanced", strength: "Developing", note: "Review DL/I calls and DBD/PSB." },
  { id: "MQ", name: "MQ", mastery: 58, completed: 9, total: 25, accuracy: 60, difficulty: "Advanced", strength: "Developing", note: "Queue depth and syncpoint concepts shaky." },
  { id: "Abends", name: "Abends", mastery: 67, completed: 20, total: 35, accuracy: 72, difficulty: "Intermediate", strength: "Proficient", note: "Good on S0C7, review S0C4/S0C5." },
  { id: "Debugging", name: "Debugging", mastery: 72, completed: 26, total: 38, accuracy: 77, difficulty: "Advanced", strength: "Proficient", note: "Strong dump analysis workflow." },
  { id: "Architecture", name: "Architecture", mastery: 65, completed: 12, total: 28, accuracy: 70, difficulty: "Advanced", strength: "Developing", note: "Modernization patterns need depth." },
];

export const weakestTopic = topics.reduce((min, t) => (t.mastery < min.mastery ? t : min));

export interface NavItem {
  title: string;
  to: string;
  icon: string; // lucide icon name
  badge?: string;
}

export const navItems: NavItem[] = [
  { title: "Dashboard", to: "/dashboard", icon: "LayoutDashboard" },
  { title: "Mock Interview", to: "/interview", icon: "MessageSquareText" },
  { title: "Practice", to: "/practice", icon: "Dumbbell" },
  { title: "Learn", to: "/learn", icon: "GraduationCap" },
  { title: "Progress", to: "/progress", icon: "TrendingUp" },
  { title: "Interview History", to: "/history", icon: "History" },
  { title: "Settings", to: "/settings", icon: "Settings" },
];

export const interviewMeta = {
  title: "Senior Mainframe Developer",
  type: "Technical Interview",
  questionNumber: 4,
  totalQuestions: 15,
  minutesRemaining: 32,
  difficulty: "Intermediate" as const,
  topic: "Abend Recovery",
  sessionId: "MF-9042",
};

export interface InterviewTurn {
  role: "ai" | "candidate";
  text: string;
  code?: { lang: string; body: string };
  timeAgo?: string;
}

export const interviewTurns: InterviewTurn[] = [
  {
    role: "ai",
    text: "Let's start with a scenario-based question. You have a COBOL batch program that suddenly starts abending with S0C7 in production. How would you investigate the issue?",
    timeAgo: "3m ago",
  },
  {
    role: "candidate",
    text: "First I'd pull the SYSUDUMP and check the CEEDUMP for the failing instruction offset. I'd map the offset back through the PMAP to find the COBOL statement, then inspect the data definition for any COMP-3 packed-decimal field receiving non-numeric or low-values data.",
    timeAgo: "2m ago",
  },
  {
    role: "ai",
    text: "Good. Walk me through what specifically you'd look for in the data division, and how you'd confirm the source of the bad data.",
    timeAgo: "1m ago",
  },
];

// The current (4th) question the candidate is answering.
export const currentQuestion = {
  category: "Debugging Scenario",
  prompt:
    "You have a COBOL batch program that suddenly starts abending with S0C7 in production. How would you investigate the issue and what specific COBOL/JCL details would you look for?",
  hint: "Think about SYSUDUMP analysis, packed-decimal validation and OFFSET calculation.",
};

export const interviewExpectations = [
  "SYSUDUMP / CEEDUMP analysis",
  "Packed-decimal (COMP-3) field validation",
  "OFFSET → COBOL statement mapping",
  "Identifying the source of corrupt data",
];

// ---- Feedback (post-interview) ----

export const feedback = {
  overall: 78,
  date: "Aug 8, 2026",
  dimensions: [
    { name: "Technical Knowledge", score: 84, note: "Strong handle on abend recovery and DB2 deadlock basics." },
    { name: "Problem Solving", score: 76, note: "Practical approach to dataset corruption scenarios in VSAM." },
    { name: "Communication", score: 72, note: "Clear structure; could be more concise on follow-ups." },
    { name: "Mainframe Depth", score: 81, note: "Deep understanding of SYSPLEX and LPAR constraints." },
    { name: "Interview Confidence", score: 68, note: "Hesitated on CICS pseudo-conversational follow-up." },
  ],
  didWell: [
    "Correctly identified the impact of packed-decimal definitions in COMP-3 data.",
    "Excellent explanation of JCL restart procedures via RD=R.",
    "Strong production debugging approach — started from the dump, not the symptom.",
  ],
  missed: [
    "Did not mention S0C7 data exception investigation steps around inspecting the specific register contents in the dump.",
    "Could explain DB2 locking (CS vs RR) and -811/-911 retry logic more precisely.",
    "Missed validating numeric fields against the input file layout before the compute.",
  ],
  improvedAnswer: {
    intro:
      "A strong answer would chain the investigation from symptom to root cause and show awareness of both the COBOL and JCL evidence:",
    points: [
      "Pull the SYSOUT and SYSUDUMP; note the S0C7 (data exception) completion code and the failing instruction offset.",
      "Map the offset through the PMAP/Compiler listing to the exact COBOL statement — usually a COMPUTE or arithmetic on a COMP-3 field.",
      "Inspect the field's PIC clause and verify the incoming data is valid packed-decimal (not low-values, spaces, or non-numeric).",
      "Trace the source: check the input file's record layout, GDG generation, and any recent change to the producing program.",
      "Add a quick fix with INSPECT/NUMERIC test and a data-validation routine; coordinate a production restart with RD=R.",
    ],
  },
  interviewerNote:
    "A senior interviewer expects you to reason from the abend code to a concrete, reproducible root cause — not just list generic debugging steps. Naming the completion code semantics and tying the offset back to a data-division field is what separates a mid-level answer from a senior one.",
  practiceNext: [
    { topic: "DB2 Locking", count: 5 },
    { topic: "CICS Transactions", count: 3 },
    { topic: "S0C7 Debugging", count: 5 },
  ],
};

// ---- History ----

export interface InterviewRecord {
  id: string;
  title: string;
  score: number;
  date: string;
  type: string;
  questions: number;
  focus: string;
}

export const interviewHistory: InterviewRecord[] = [
  { id: "MF-9042", title: "Senior Mainframe Mock Interview", score: 78, date: "Aug 8, 2026", type: "Technical Interview", questions: 15, focus: "COBOL File Status & CICS Transactions" },
  { id: "MF-8811", title: "COBOL + DB2 Interview", score: 71, date: "Aug 5, 2026", type: "Technical Interview", questions: 12, focus: "DB2 Locking & JCL Restart" },
  { id: "MF-8604", title: "Production Support Scenario", score: 74, date: "Aug 1, 2026", type: "Scenario Interview", questions: 10, focus: "Abends & Debugging Workflow" },
  { id: "MF-8420", title: "CICS & VSAM Deep Dive", score: 66, date: "Jul 28, 2026", type: "Technical Interview", questions: 14, focus: "Pseudo-conversational Design" },
  { id: "MF-8201", title: "Architecture & Modernization", score: 70, date: "Jul 22, 2026", type: "System Design", questions: 9, focus: "Mainframe Modernization Patterns" },
];

// ---- Learning paths ----

export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  modules: { name: string; done: boolean }[];
  level: "Fundamentals" | "Intermediate" | "Advanced";
}

export const learningPaths: LearningPath[] = [
  {
    id: "cobol",
    title: "COBOL Interview Mastery",
    subtitle: "From data types to production scenarios",
    progress: 72,
    level: "Intermediate",
    modules: [
      { name: "COBOL fundamentals", done: true },
      { name: "Data types & COMP/COMP-3", done: true },
      { name: "PERFORM & control flow", done: true },
      { name: "Tables / OCCURS", done: true },
      { name: "File handling", done: true },
      { name: "Error handling", done: false },
      { name: "Production scenarios", done: false },
      { name: "Interview questions", done: false },
    ],
  },
  {
    id: "db2",
    title: "DB2 for Mainframe Developers",
    subtitle: "Locking, cursors and performance",
    progress: 40,
    level: "Intermediate",
    modules: [
      { name: "DB2 architecture", done: true },
      { name: "SQL & joins", done: true },
      { name: "Cursors & concurrency", done: false },
      { name: "Locking & isolation", done: false },
      { name: "Performance tuning", done: false },
      { name: "Interview questions", done: false },
    ],
  },
  {
    id: "cics",
    title: "CICS Transaction Mastery",
    subtitle: "Pseudo-conversational design & performance",
    progress: 25,
    level: "Advanced",
    modules: [
      { name: "CICS concepts", done: true },
      { name: "COMMAREA vs TSQ", done: false },
      { name: "Pseudo-conversational", done: false },
      { name: "Channels & containers", done: false },
      { name: "Performance & BTS", done: false },
      { name: "Interview questions", done: false },
    ],
  },
  {
    id: "jcl",
    title: "JCL & Production Control",
    subtitle: "Job control, GDGs and restart",
    progress: 58,
    level: "Fundamentals",
    modules: [
      { name: "JCL fundamentals", done: true },
      { name: "PROC & overrides", done: true },
      { name: "GDG management", done: true },
      { name: "Restart & checkpoint", done: false },
      { name: "Condition codes & abends", done: false },
      { name: "Interview questions", done: false },
    ],
  },
];

// ---- Progress trend ----

export const readinessTrend = [
  { date: "Jul 22", value: 58 },
  { date: "Jul 28", value: 60 },
  { date: "Aug 1", value: 63 },
  { date: "Aug 5", value: 66 },
  { date: "Aug 8", value: 68 },
];

export const scoreTrend = [
  { date: "Jul 22", score: 70 },
  { date: "Jul 28", score: 66 },
  { date: "Aug 1", score: 74 },
  { date: "Aug 5", score: 71 },
  { date: "Aug 8", score: 78 },
];
