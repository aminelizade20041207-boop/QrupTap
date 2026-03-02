
export type ClassDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type SubgroupType = 'yuxari' | 'asagi' | 'hamisi';
export type WeekType = 'ust' | 'alt' | 'hamisi';

export interface ClassSession {
  id: string;
  name: string;
  teacher?: string;
  startTime: string; 
  endTime: string;   
  day: ClassDay;
  room?: string;
  subgroup: SubgroupType;
  week: WeekType;
}

export const DAYS_OF_WEEK = [
  'Bazar',
  'Bazar ertəsi',
  'Çərşənbə axşamı',
  'Çərşənbə',
  'Cümə axşamı',
  'Cümə',
  'Şənbə',
] as const;

export interface GradeDetails {
  attendance: string;
  independentWork: string;
  colloquiums: string[];
  seminars: string[];
  completedLabs: number;
  total: number;
}

export interface UserNote {
  id: string;
  text: string;
  createdAt: string;
}

export interface UserMaterial {
  id: string;
  subject: string;
  title: string;
  fileName: string;
  fileData: string; // base64 string
  fileType: string;
  createdAt: string;
}

export interface NotificationChannel {
  enabled: boolean;
  firstClassMinutes: number;
  otherClassesMinutes: number;
}

export interface NotificationSettings {
  firstChannel: NotificationChannel;
  secondChannel: NotificationChannel;
}

export interface UserProfile {
  id: string; // Bazadakı UID ilə eyni olmalıdır
  name: string;
  subgroup: 'yuxari' | 'asagi';
  photo?: string;
  savedGrades?: Record<string, number>;
  savedDetails?: Record<string, GradeDetails>;
  savedAbsences?: Record<string, number>;
  notesList?: UserNote[];
  materialsList?: UserMaterial[];
  notificationSettings?: NotificationSettings;
}
