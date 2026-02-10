
import { ClassSession } from "./types";

export const FIXED_SCHEDULE: ClassSession[] = [
  // 1-ci gün (Bazar ertəsi - 1)
  {
    id: '1-1',
    name: 'Əməliyyat sistemləri (Labaratoriya)',
    teacher: 'Elnur Xəlilov',
    day: 1,
    startTime: '12:30',
    endTime: '13:50',
    subgroup: 'asagi',
    week: 'hamisi'
  },
  {
    id: '1-2',
    name: 'Kompüter Şəbəkələri (Labaratoriya)',
    teacher: 'Ceyhun Əlizadə',
    day: 1,
    startTime: '14:05',
    endTime: '15:25',
    subgroup: 'asagi',
    week: 'hamisi'
  },
  {
    id: '1-3',
    name: 'Verilənlər bazası sistemləri (Mühazirə)',
    teacher: 'Rəsmiyyə Əmiraslanova',
    day: 1,
    startTime: '15:35',
    endTime: '16:55',
    subgroup: 'asagi',
    week: 'hamisi'
  },
  // 2-ci gün (Çərşənbə axşamı - 2)
  {
    id: '2-1',
    name: 'Diskret riyaziyyat (Mühazirə)',
    teacher: 'Lalə Rzayeva',
    day: 2,
    startTime: '12:30',
    endTime: '13:50',
    subgroup: 'asagi',
    week: 'hamisi'
  },
  {
    id: '2-2',
    name: 'Kompüter Şəbəkələri (Mühazirə)',
    teacher: 'Ceyhun Əlizadə',
    day: 2,
    startTime: '14:05',
    endTime: '15:25',
    subgroup: 'asagi',
    week: 'hamisi'
  },
  {
    id: '2-3-ust',
    name: 'Obyekt yönümlü proqramlaşdırma (Laboratoriya)',
    teacher: 'Məleykə Heydərova',
    day: 2,
    startTime: '15:35',
    endTime: '16:55',
    subgroup: 'asagi',
    week: 'ust'
  },
  {
    id: '2-3-alt',
    name: 'Verilənlər bazası sistemləri (Laboratoriya)',
    teacher: 'Rəsmiyyə Əmiraslanova',
    day: 2,
    startTime: '15:35',
    endTime: '16:55',
    subgroup: 'asagi',
    week: 'alt'
  },
  // 3-cü gün (Çərşənbə - 3)
  {
    id: '3-1',
    name: 'Əməliyyat sistemləri (Mühazirə)',
    teacher: 'Elnur Xəlilov',
    day: 3,
    startTime: '14:05',
    endTime: '15:25',
    subgroup: 'asagi',
    week: 'hamisi'
  },
  {
    id: '3-2',
    name: 'Obyekt-yönümlü proqramlaşdırma (Mühazirə)',
    teacher: 'Validə Nuriyeva',
    day: 3,
    startTime: '15:35',
    endTime: '16:55',
    subgroup: 'asagi',
    week: 'hamisi'
  },
  // 4-cü gün (Cümə axşamı - 4)
  // Üst həftə
  {
    id: '4-1-ust',
    name: 'Kompüter Şəbəkələri (Mühazirə)',
    teacher: 'Ceyhun Əlizadə',
    day: 4,
    startTime: '14:05',
    endTime: '15:25',
    subgroup: 'asagi',
    week: 'ust'
  },
  {
    id: '4-2-ust',
    name: 'Obyekt-yönümlü proqramlaşdırma (Məşğələ)',
    teacher: 'Validə Nuriyeva',
    day: 4,
    startTime: '15:35',
    endTime: '16:55',
    subgroup: 'asagi',
    week: 'ust'
  },
  {
    id: '4-3-ust',
    name: 'Verilənlər bazası sistemləri (Məşğələ)',
    teacher: 'Rəsmiyyə Əmiraslanova',
    day: 4,
    startTime: '17:05',
    endTime: '18:25',
    subgroup: 'asagi',
    week: 'ust'
  },
  // Alt həftə
  {
    id: '4-1-alt',
    name: 'Verilənlər bazası sistemləri (Mühazirə)',
    teacher: 'Rəsmiyyə Əmiraslanova',
    day: 4,
    startTime: '14:05',
    endTime: '15:25',
    subgroup: 'asagi',
    week: 'alt'
  },
  {
    id: '4-2-alt',
    name: 'Diskret riyaziyyat (Məşğələ)',
    teacher: 'Lalə Rzayeva',
    day: 4,
    startTime: '15:35',
    endTime: '16:55',
    subgroup: 'asagi',
    week: 'alt'
  },
  {
    id: '4-3-alt',
    name: 'Kompüter Şəbəkələri (Labaratoriya)',
    teacher: 'Ceyhun Əlizadə',
    day: 4,
    startTime: '17:05',
    endTime: '18:25',
    subgroup: 'asagi',
    week: 'alt'
  }
];
