import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Course, Announcement } from '../types';

interface AppContextType {
  currentUser: User | null;
  users: User[];
  courses: Course[];
  announcements: Announcement[];
  login: (email: string, password: string) => { success: boolean; message: string };
  register: (name: string, email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'downloads' | 'likes'>) => void;
  deleteCourse: (id: string) => void;
  likeCourse: (id: string) => void;
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'createdAt'>) => void;
  deleteAnnouncement: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@edu.umi.ac.ma';
const ADMIN_PASSWORD = 'admin2024';

const defaultAnnouncements: Announcement[] = [
  {
    id: '1',
    title: '🎓 Bienvenue sur la plateforme ESTM TM-FBA !',
    content: 'Bienvenue sur votre espace numérique de partage de cours. Vous pouvez télécharger et partager des cours, TD et TP. Bonne année universitaire 2024-2025 !',
    postedBy: 'admin',
    postedByName: 'Administration ESTM',
    createdAt: new Date().toISOString(),
    priority: 'high'
  },
  {
    id: '2',
    title: '📅 Emploi du temps S2 disponible',
    content: "L'emploi du temps du Semestre 2 (Section A) est maintenant disponible. Filière TM-FBA, date d'effet le 02/02/2026. Consultez l'onglet Emploi du temps pour plus de détails.",
    postedBy: 'admin',
    postedByName: 'Administration ESTM',
    createdAt: new Date().toISOString(),
    priority: 'medium'
  }
];

const defaultCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction au Droit Commercial',
    subject: 'Droit commercial et des affaires',
    type: 'cours',
    description: 'Cours complet sur les bases du droit commercial et des affaires - M. BELLAMIN',
    uploadedBy: 'admin',
    uploadedByName: 'Administration ESTM',
    createdAt: new Date().toISOString(),
    downloads: 12,
    likes: 8
  },
  {
    id: '2',
    title: 'TD Statistiques Descriptives - Série 1',
    subject: 'Statistiques descriptives',
    type: 'td',
    description: 'Première série de TD sur les statistiques descriptives - M. LAISSAOUI',
    uploadedBy: 'admin',
    uploadedByName: 'Administration ESTM',
    createdAt: new Date().toISOString(),
    downloads: 25,
    likes: 15
  },
  {
    id: '3',
    title: 'TP Travaux d\'inventaire - Exercices',
    subject: "Travaux d'inventaire",
    type: 'tp',
    description: 'Exercices pratiques sur les travaux d\'inventaire - M. ED-DAOU',
    uploadedBy: 'admin',
    uploadedByName: 'Administration ESTM',
    createdAt: new Date().toISOString(),
    downloads: 18,
    likes: 10
  },
  {
    id: '4',
    title: 'Communication Commerciale - Cours',
    subject: 'Communication commerciale',
    type: 'cours',
    description: 'Cours complet sur la communication commerciale - M. HANOUF',
    uploadedBy: 'admin',
    uploadedByName: 'Administration ESTM',
    createdAt: new Date().toISOString(),
    downloads: 20,
    likes: 12
  }
];

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('estm_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('estm_users');
    if (saved) return JSON.parse(saved);
    return [{
      id: 'admin',
      name: 'Administrateur ESTM',
      email: ADMIN_EMAIL,
      role: 'admin',
      createdAt: new Date().toISOString()
    }];
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('estm_courses');
    return saved ? JSON.parse(saved) : defaultCourses;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('estm_announcements');
    return saved ? JSON.parse(saved) : defaultAnnouncements;
  });

  useEffect(() => {
    localStorage.setItem('estm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('estm_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('estm_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('estm_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('estm_current_user');
    }
  }, [currentUser]);

  const login = (email: string, password: string) => {
    if (!email.endsWith('@edu.umi.ac.ma')) {
      return { success: false, message: 'Vous devez utiliser un email académique (@edu.umi.ac.ma)' };
    }

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser: User = {
        id: 'admin',
        name: 'Administrateur ESTM',
        email: ADMIN_EMAIL,
        role: 'admin',
        createdAt: new Date().toISOString()
      };
      setCurrentUser(adminUser);
      return { success: true, message: 'Connexion réussie' };
    }

    const savedPasswords = JSON.parse(localStorage.getItem('estm_passwords') || '{}');
    const user = users.find(u => u.email === email);

    if (!user) {
      return { success: false, message: 'Email non trouvé. Veuillez vous inscrire.' };
    }

    if (savedPasswords[email] !== password) {
      return { success: false, message: 'Mot de passe incorrect' };
    }

    setCurrentUser(user);
    return { success: true, message: 'Connexion réussie' };
  };

  const register = (name: string, email: string, password: string) => {
    if (!email.endsWith('@edu.umi.ac.ma')) {
      return { success: false, message: 'Vous devez utiliser un email académique (@edu.umi.ac.ma)' };
    }

    if (users.find(u => u.email === email)) {
      return { success: false, message: 'Cet email est déjà utilisé' };
    }

    if (password.length < 6) {
      return { success: false, message: 'Le mot de passe doit contenir au moins 6 caractères' };
    }

    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      role: 'student',
      createdAt: new Date().toISOString()
    };

    const savedPasswords = JSON.parse(localStorage.getItem('estm_passwords') || '{}');
    savedPasswords[email] = password;
    localStorage.setItem('estm_passwords', JSON.stringify(savedPasswords));

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true, message: 'Inscription réussie !' };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addCourse = (course: Omit<Course, 'id' | 'createdAt' | 'downloads' | 'likes'>) => {
    const newCourse: Course = {
      ...course,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      downloads: 0,
      likes: 0
    };
    setCourses(prev => [newCourse, ...prev]);
  };

  const deleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
  };

  const likeCourse = (id: string) => {
    setCourses(prev => prev.map(c => c.id === id ? { ...c, likes: c.likes + 1 } : c));
  };

  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'createdAt'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setAnnouncements(prev => [newAnn, ...prev]);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  return (
    <AppContext.Provider value={{
      currentUser, users, courses, announcements,
      login, register, logout,
      addCourse, deleteCourse, likeCourse,
      addAnnouncement, deleteAnnouncement
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
