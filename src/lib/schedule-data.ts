
import { ClassSession } from "./types";

export const FIXED_SCHEDULE: ClassSession[] = [
  // --- TEST DƏRSİ (Bazar 23:50) ---
  {
    id: 'test-2350',
    name: 'Test Dərsi (Məşğələ)',
    teacher: 'Sınaq Müəllimi',
    day: 0, 
    startTime: '23:50',
    endTime: '00:30',
    subgroup: 'hamisi',
    week: 'hamisi',
    room: '302'
  },
  // --- BAZAR ERTƏSİ ---
  {
    id: 'ks-1',
    name: 'Kompüter Şəbəkələri (Mühazirə)',
    teacher: 'A. Müəllim',
    day: 1,
    startTime: '09:00',
    endTime: '10:30',
    subgroup: 'hamisi',
    week: 'hamisi',
    room: '402'
  },
  {
    id: 'es-1',
    name: 'Əməliyyat sistemləri (Məşğələ)',
    teacher: 'B. Müəllim',
    day: 1,
    startTime: '10:40',
    endTime: '12:10',
    subgroup: 'yuxari',
    week: 'hamisi',
    room: '205'
  },
  // --- ÇƏRŞƏNBƏ AXŞAMI ---
  {
    id: 'vbs-1',
    name: 'Verilənlər bazası sistemləri (Mühazirə)',
    teacher: 'C. Müəllim',
    day: 2,
    startTime: '09:00',
    endTime: '10:30',
    subgroup: 'hamisi',
    week: 'hamisi',
    room: '301'
  },
  {
    id: 'dr-1',
    name: 'Diskret riyaziyyat (Məşğələ)',
    teacher: 'D. Müəllim',
    day: 2,
    startTime: '10:40',
    endTime: '12:10',
    subgroup: 'asagi',
    week: 'hamisi',
    room: '102'
  },
  // --- ÇƏRŞƏNBƏ ---
  {
    id: 'oyp-1',
    name: 'Obyekt-yönümlü proqramlaşdırma (Laboratoriya)',
    teacher: 'E. Müəllim',
    day: 3,
    startTime: '12:20',
    endTime: '13:50',
    subgroup: 'hamisi',
    week: 'ust',
    room: 'Lab 3'
  },
  // --- CÜMƏ AXŞAMI ---
  {
    id: 'ks-2',
    name: 'Kompüter Şəbəkələri (Laboratoriya)',
    teacher: 'A. Müəllim',
    day: 4,
    startTime: '09:00',
    endTime: '10:30',
    subgroup: 'yuxari',
    week: 'alt',
    room: 'Lab 1'
  },
  // --- CÜMƏ ---
  {
    id: 'es-2',
    name: 'Əməliyyat sistemləri (Mühazirə)',
    teacher: 'B. Müəllim',
    day: 5,
    startTime: '14:00',
    endTime: '15:30',
    subgroup: 'hamisi',
    week: 'hamisi',
    room: '202'
  }
];
