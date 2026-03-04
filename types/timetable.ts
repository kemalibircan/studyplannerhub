export interface TimetableClass {
  id: string;
  name: string;
  color: string;
  location?: string;
  teacher?: string;
  day: number; // 0 = Monday, 6 = Sunday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
}

export interface TimetableConfig {
  startTime: string;
  endTime: string;
  slotLength: 30 | 45 | 60;
  days: boolean[]; // [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
}

export interface TimetableState {
  classes: TimetableClass[];
  config: TimetableConfig;
}

