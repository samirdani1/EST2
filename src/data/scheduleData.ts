import { ScheduleSlot } from '../types';

export const scheduleData: ScheduleSlot[] = [
  // LUNDI
  {
    day: 'Lundi',
    timeStart: '08:30',
    timeEnd: '10:30',
    subject: 'Environnement bancaire et financier',
    teacher: 'M. TOUZANI',
    room: 'Amphi B',
    type: 'cours',
    groups: 'Tous'
  },
  {
    day: 'Lundi',
    timeStart: '14:30',
    timeEnd: '16:30',
    subject: 'Communication commerciale',
    teacher: 'M. HANOUF',
    room: 'Amphi A',
    type: 'cours',
    groups: 'Tous'
  },

  // MARDI
  {
    day: 'Mardi',
    timeStart: '14:30',
    timeEnd: '16:30',
    subject: 'Statistiques descriptives (TD)',
    teacher: 'M. LAISSAOUI',
    room: 'Amphi A',
    type: 'td',
    groups: 'GR1 et GR2'
  },
  {
    day: 'Mardi',
    timeStart: '16:40',
    timeEnd: '18:40',
    subject: 'Statistiques descriptives (TD)',
    teacher: 'M. LAISSAOUI',
    room: 'Amphi A',
    type: 'td',
    groups: 'GR3 et GR4'
  },

  // MERCREDI
  {
    day: 'Mercredi',
    timeStart: '08:30',
    timeEnd: '10:30',
    subject: 'Droit commercial et des affaires',
    teacher: 'M. BELLAMIN',
    room: 'Amphi A',
    type: 'cours',
    groups: 'Tous'
  },
  {
    day: 'Mercredi',
    timeStart: '10:40',
    timeEnd: '12:40',
    subject: 'Statistiques descriptives',
    teacher: 'M. NAAMANE',
    room: 'Amphi A',
    type: 'cours',
    groups: 'Tous'
  },
  {
    day: 'Mercredi',
    timeStart: '16:40',
    timeEnd: '18:40',
    subject: "Travaux d'inventaire",
    teacher: 'M. ED-DAOU',
    room: 'Amphi A',
    type: 'tp',
    groups: 'Tous'
  },

  // JEUDI
  {
    day: 'Jeudi',
    timeStart: '10:40',
    timeEnd: '12:40',
    subject: 'Démarche marketing (Mark+Tech.Enquête)',
    teacher: 'M. SADIK',
    room: 'Amphi A',
    type: 'cours',
    groups: 'Tous'
  },
  {
    day: 'Jeudi',
    timeStart: '14:30',
    timeEnd: '16:30',
    subject: "Travaux d'inventaire",
    teacher: 'M. ED-DAOU',
    room: 'Amphi A',
    type: 'tp',
    groups: 'G3 et G4'
  },
  {
    day: 'Jeudi',
    timeStart: '16:40',
    timeEnd: '18:40',
    subject: "Travaux d'inventaire",
    teacher: 'M. ED-DAOU',
    room: 'Amphi A',
    type: 'tp',
    groups: 'G1 et G2'
  },

  // VENDREDI
  {
    day: 'Vendredi',
    timeStart: '08:30',
    timeEnd: '10:30',
    subject: 'Culture digitale',
    teacher: 'Mr. OURAMMOU',
    room: '',
    type: 'cours',
    groups: 'G1'
  },
  {
    day: 'Vendredi',
    timeStart: '08:30',
    timeEnd: '10:30',
    subject: 'Culture digitale',
    teacher: 'Mr. MOUHCINE',
    room: '',
    type: 'cours',
    groups: 'G3'
  },
  {
    day: 'Vendredi',
    timeStart: '10:40',
    timeEnd: '12:40',
    subject: 'Culture digitale',
    teacher: 'Mr. OURAMMOU',
    room: '',
    type: 'cours',
    groups: 'G2'
  },
  {
    day: 'Vendredi',
    timeStart: '10:40',
    timeEnd: '12:40',
    subject: 'Culture digitale',
    teacher: 'Mr. MOUHCINE',
    room: '',
    type: 'cours',
    groups: 'G4'
  },
  {
    day: 'Vendredi',
    timeStart: '14:30',
    timeEnd: '16:30',
    subject: 'Culture digitale',
    teacher: 'M. DAHMOUNI',
    room: 'Amphi A',
    type: 'cours',
    groups: 'Tous'
  },

  // SAMEDI
  {
    day: 'Samedi',
    timeStart: '08:30',
    timeEnd: '10:30',
    subject: 'Culture digitale',
    teacher: 'Mr. MOUHCINE',
    room: '',
    type: 'cours',
    groups: 'G5'
  },
  {
    day: 'Samedi',
    timeStart: '10:40',
    timeEnd: '12:40',
    subject: 'Culture digitale',
    teacher: 'Mr. MOUHCINE',
    room: '',
    type: 'cours',
    groups: 'G6'
  },
];

export const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

export const timeSlots = [
  { label: '08:30 - 10:30', start: '08:30', end: '10:30' },
  { label: '10:40 - 12:40', start: '10:40', end: '12:40' },
  { label: '14:30 - 16:30', start: '14:30', end: '16:30' },
  { label: '16:40 - 18:40', start: '16:40', end: '18:40' },
];

export const getTodaySchedule = (): ScheduleSlot[] => {
  const today = new Date();
  const dayIndex = today.getDay(); // 0=Sunday, 1=Monday...
  const dayMap: { [key: number]: string } = {
    1: 'Lundi',
    2: 'Mardi',
    3: 'Mercredi',
    4: 'Jeudi',
    5: 'Vendredi',
    6: 'Samedi',
  };
  const todayName = dayMap[dayIndex];
  if (!todayName) return [];
  return scheduleData.filter(slot => slot.day === todayName);
};

export const getCurrentSlot = (): ScheduleSlot | null => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  
  const todaySlots = getTodaySchedule();
  return todaySlots.find(slot => slot.timeStart <= currentTime && slot.timeEnd >= currentTime) || null;
};
