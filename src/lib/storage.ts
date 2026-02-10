
"use client";

import { ClassSession } from "./types";

const STORAGE_KEY = 'classtrack_classes';

export const getClasses = (): ClassSession[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveClasses = (classes: ClassSession[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classes));
};

export const addClass = (newClass: ClassSession) => {
  const current = getClasses();
  saveClasses([...current, newClass]);
};

export const removeClass = (id: string) => {
  const current = getClasses();
  saveClasses(current.filter(c => c.id !== id));
};

export const updateClass = (updated: ClassSession) => {
  const current = getClasses();
  saveClasses(current.map(c => c.id === updated.id ? updated : c));
};
