export type Worker = {
  initials: string;
  name: string;
  wallet: string;
  x: string;
  score: number;
  skills: string[];
  availability: string;
  rate: string;
  completed: number;
  activity: string;
};

export type Project = {
  mark: string;
  name: string;
  stage: string;
  roles: number;
  budget: string;
  stack: string[];
  description: string;
};

export type Job = {
  title: string;
  project: string;
  reward: string;
  type: string;
  skills: string[];
};

export const workers: Worker[] = [
  {
    initials: "AK",
    name: "Alex Kim",
    wallet: "9vJ4...m2Pq",
    x: "@alexbuilds",
    score: 984,
    skills: ["Growth", "Content", "Strategy"],
    availability: "Available",
    rate: "12 SOL / week",
    completed: 28,
    activity: "Published a launch thread reaching 184K views"
  },
  {
    initials: "MJ",
    name: "Maya Jones",
    wallet: "7dKe...x91L",
    x: "@mayamakes",
    score: 947,
    skills: ["Design", "Motion", "Brand"],
    availability: "Available",
    rate: "8 SOL / project",
    completed: 34,
    activity: "Completed a visual identity sprint"
  },
  {
    initials: "RL",
    name: "Ravi Lal",
    wallet: "3Qsw...7aVn",
    x: "@ravilabs",
    score: 921,
    skills: ["Solana", "Rust", "Security"],
    availability: "2 weeks",
    rate: "18 SOL / week",
    completed: 19,
    activity: "Verified a program upgrade review"
  },
  {
    initials: "SC",
    name: "Sofia Chen",
    wallet: "B8tr...p4Kx",
    x: "@sofiaonchain",
    score: 896,
    skills: ["Research", "Writing", "DeFi"],
    availability: "Available",
    rate: "6 SOL / brief",
    completed: 42,
    activity: "Published a protocol research memo"
  },
  {
    initials: "DN",
    name: "Drew Nolan",
    wallet: "5Lmk...c2Rz",
    x: "@drewcuts",
    score: 871,
    skills: ["Video", "Editing", "Social"],
    availability: "Available",
    rate: "4 SOL / video",
    completed: 57,
    activity: "Delivered three product launch edits"
  },
  {
    initials: "ZO",
    name: "Zane Okafor",
    wallet: "Ee71...w9Sa",
    x: "@zanegrows",
    score: 844,
    skills: ["Community", "Ops", "Analytics"],
    availability: "1 week",
    rate: "10 SOL / week",
    completed: 25,
    activity: "Built a contributor reporting system"
  }
];

export const projects: Project[] = [
  {
    mark: "N",
    name: "Northstar Protocol",
    stage: "Series A",
    roles: 4,
    budget: "40-80 SOL",
    stack: ["Solana", "Rust", "React"],
    description: "On-chain markets for real-time internet culture."
  },
  {
    mark: "V",
    name: "Vector Labs",
    stage: "Seed",
    roles: 7,
    budget: "25-60 SOL",
    stack: ["DeFi", "TypeScript", "Growth"],
    description: "Liquidity infrastructure for emerging assets."
  },
  {
    mark: "A",
    name: "Arc Network",
    stage: "DAO",
    roles: 3,
    budget: "15-35 SOL",
    stack: ["Community", "Design", "Content"],
    description: "A contributor-owned network for crypto creatives."
  },
  {
    mark: "P",
    name: "Prism Exchange",
    stage: "Growth",
    roles: 5,
    budget: "50-100 SOL",
    stack: ["Trading", "Data", "Security"],
    description: "Fast execution and transparent markets on Solana."
  }
];

export const jobs: Job[] = [
  { title: "Community Manager", project: "Arc Network", reward: "10 SOL / week", type: "Full time", skills: ["Community", "Ops"] },
  { title: "Protocol Researcher", project: "Northstar", reward: "18 SOL", type: "Contract", skills: ["Research", "DeFi"] },
  { title: "Frontend Engineer", project: "Vector Labs", reward: "24 SOL / week", type: "Full time", skills: ["React", "TypeScript"] },
  { title: "Product Designer", project: "Prism Exchange", reward: "16 SOL", type: "Contract", skills: ["Product", "Design"] },
  { title: "Motion Graphics", project: "Arc Network", reward: "5 SOL / video", type: "Part time", skills: ["Motion", "Video"] },
  { title: "Solana Developer", project: "Northstar", reward: "30 SOL / week", type: "Full time", skills: ["Solana", "Rust"] },
  { title: "Growth Lead", project: "Vector Labs", reward: "20 SOL / week", type: "Full time", skills: ["Growth", "Strategy"] },
  { title: "Video Editor", project: "Prism Exchange", reward: "4 SOL / edit", type: "Contract", skills: ["Video", "Social"] },
  { title: "Smart Contract Engineer", project: "Northstar", reward: "36 SOL / week", type: "Full time", skills: ["Rust", "Security"] }
];
