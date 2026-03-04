export interface Exam {
  id: string;
  name: string;
  date: string; // ISO date string
  time?: string; // HH:MM format
  tag?: string;
  priority: "low" | "medium" | "high";
}

