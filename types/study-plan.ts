export interface Subject {
  id: string;
  name: string;
  difficulty: number; // 1-5
  desiredHoursPerWeek: number;
}

export interface Availability {
  days: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
  timeBlocks: {
    start: string; // HH:MM
    end: string; // HH:MM
  }[];
  breakDuration: number; // minutes
  breakInterval: number; // minutes (e.g., 10 min break every 50 min)
}

export interface Constraints {
  maxSessionsPerDay: number;
  avoidLateHours: boolean;
  lateHourThreshold: string; // HH:MM
}

export interface StudySession {
  id: string;
  subjectId: string;
  day: number; // 0-6
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  locked: boolean;
}

export interface StudyPlanState {
  subjects: Subject[];
  availability: Availability;
  constraints: Constraints;
  sessions: StudySession[];
}

