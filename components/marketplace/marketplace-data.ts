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

export const workers: Worker[] = [];
export const projects: Project[] = [];
export const jobs: Job[] = [];
