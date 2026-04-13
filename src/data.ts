// =====================================================
// DONNÉES PRÉ-REMPLIES POUR L'ESTM - TM-FBA
// =====================================================

export interface Course {
  id: string;
  time: string;
  subject: string;
  prof: string;
  room: string;
  type: string;
  groupId?: string;
}

export interface DaySchedule {
  day: string;
  courses: Course[];
}

export interface Filiere {
  id: string;
  name: string;
  code: string;
  schedules: DaySchedule[];
}

// --- PROFESSEURS ---
export const PROFESSORS = [
  "M. TOUZANI",
  "M. HANOUF",
  "M. LAISSAOUI",
  "M. NAAMANE",
  "M. BELLAMIN",
  "M. SADIK",
  "M. ED-DAOU",
  "Mr OURAMMOU",
  "Mr MOUHCINE",
  "M. DAHMOUNI",
  "Mme BENNANI",
  "M. EL AMRANI",
  "Mme IDRISSI",
  "M. KHALIL",
  "Mme ZAHID",
  "M. TAHIRI",
  "Mme SOUSSI",
  "M. FASSI",
  "Mme CHAFIQ",
  "M. RACHIDI"
];

// --- MODULES / MATIÈRES ---
export const MODULES = [
  "Environnement bancaire et financier",
  "Communication commerciale",
  "Statistiques descriptives",
  "Droit commercial et des affaires",
  "Démarche marketing (Mark+Tech. Enquête)",
  "Travaux d'inventaire",
  "Culture digitale",
  "Comptabilité générale",
  "Mathématiques appliquées",
  "Économie générale",
  "Droit des obligations",
  "Management des organisations",
  "Techniques de communication",
  "Informatique de gestion",
  "Langue étrangère (Anglais)",
  "Langue étrangère (Français)",
  "Développement personnel",
  "Gestion de projet",
  "Marketing digital",
  "Finance d'entreprise"
];

// --- SALLES ---
export const ROOMS = ["Amphi A", "Amphi B", "Amphi C", "Salle 1", "Salle 2", "Salle 3", "Salle TP", "En ligne"];

// --- CRÉNEAUX HORAIRES ---
export const TIME_SLOTS = [
  "08:30 - 10:30",
  "10:40 - 12:40",
  "14:30 - 16:30",
  "16:40 - 18:40"
];

// --- JOURS ---
export const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

// --- EMPLOI DU TEMPS PAR DÉFAUT (TM-FBA Section A) ---
export const DEFAULT_SCHEDULE: DaySchedule[] = [
  {
    day: "Lundi",
    courses: [
      { id: "1", time: "08:30 - 10:30", subject: "Environnement bancaire et financier", prof: "M. TOUZANI", room: "Amphi B", type: "Cours" },
      { id: "2", time: "14:30 - 16:30", subject: "Communication commerciale", prof: "M. HANOUF", room: "Amphi A", type: "Cours" },
    ]
  },
  {
    day: "Mardi",
    courses: [
      { id: "3", time: "14:30 - 16:30", subject: "TD Statistiques descriptives", prof: "M. LAISSAOUI", room: "Amphi A", type: "TD GR1/GR2" },
      { id: "4", time: "16:40 - 18:40", subject: "TD Statistiques descriptives", prof: "M. LAISSAOUI", room: "Amphi A", type: "TD GR3/GR4" },
    ]
  },
  {
    day: "Mercredi",
    courses: [
      { id: "5", time: "08:30 - 10:30", subject: "Droit commercial et des affaires", prof: "M. BELLAMIN", room: "Amphi A", type: "Cours" },
      { id: "6", time: "10:40 - 12:40", subject: "Statistiques descriptives", prof: "M. NAAMANE", room: "Amphi A", type: "Cours" },
      { id: "7", time: "16:40 - 18:40", subject: "Travaux d'inventaire", prof: "M. ED-DAOU", room: "Amphi A", type: "Cours" },
    ]
  },
  {
    day: "Jeudi",
    courses: [
      { id: "8", time: "10:40 - 12:40", subject: "Démarche marketing (Mark+Tech. Enquête)", prof: "M. SADIK", room: "Amphi A", type: "Cours" },
      { id: "9", time: "14:30 - 16:30", subject: "Travaux d'inventaire", prof: "M. ED-DAOU", room: "Amphi A", type: "TD G3/G4" },
      { id: "10", time: "16:40 - 18:40", subject: "Travaux d'inventaire", prof: "M. ED-DAOU", room: "Amphi A", type: "TD G1/G2" },
    ]
  },
  {
    day: "Vendredi",
    courses: [
      { id: "11", time: "08:30 - 10:30", subject: "Culture digitale (G1)", prof: "Mr OURAMMOU", room: "-", type: "Cours", groupId: "G1" },
      { id: "12", time: "08:30 - 10:30", subject: "Culture digitale (G3)", prof: "Mr MOUHCINE", room: "-", type: "Cours", groupId: "G3" },
      { id: "13", time: "10:40 - 12:40", subject: "Culture digitale (G2)", prof: "Mr OURAMMOU", room: "-", type: "Cours", groupId: "G2" },
      { id: "14", time: "10:40 - 12:40", subject: "Culture digitale (G4)", prof: "Mr MOUHCINE", room: "-", type: "Cours", groupId: "G4" },
      { id: "15", time: "14:30 - 16:30", subject: "Culture digitale", prof: "M. DAHMOUNI", room: "Amphi A", type: "Cours" },
    ]
  },
  {
    day: "Samedi",
    courses: [
      { id: "16", time: "08:30 - 10:30", subject: "Culture digitale (G5)", prof: "Mr MOUHCINE", room: "-", type: "Cours", groupId: "G5" },
      { id: "17", time: "10:40 - 12:40", subject: "Culture digitale (G6)", prof: "Mr MOUHCINE", room: "-", type: "Cours", groupId: "G6" },
    ]
  }
];

// --- FILIÈRES PAR DÉFAUT ---
export const DEFAULT_FILIERES: Filiere[] = [
  {
    id: "tm-fba-a",
    name: "Techniques de Management - FBA (Section A)",
    code: "TM-FBA-A",
    schedules: DEFAULT_SCHEDULE
  },
  {
    id: "tm-fba-b",
    name: "Techniques de Management - FBA (Section B)",
    code: "TM-FBA-B",
    schedules: DEFAULT_SCHEDULE
  },
  {
    id: "tm-gestion",
    name: "Techniques de Management - Gestion",
    code: "TM-GEST",
    schedules: DEFAULT_SCHEDULE
  }
];

// Helper pour générer un ID unique
export const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
