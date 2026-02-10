
export type ClassDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 is Sunday, 1 is Monday...

export interface ClassSession {
  id: string;
  name: string;
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  day: ClassDay;
  room: string;
  color?: string;
}

export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;
