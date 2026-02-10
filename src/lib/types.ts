
export type ClassDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type SubgroupType = 'yuxari' | 'asagi' | 'hamisi';

export interface ClassSession {
  id: string;
  name: string;
  startTime: string; 
  endTime: string;   
  day: ClassDay;
  room: string;
  subgroup: SubgroupType;
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

export interface UserProfile {
  name: string;
  subgroup: 'yuxari' | 'asagi';
}
