import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Calendar,
  Bell,
  ChevronRight,
  Clock,
  Download,
  Search,
  BookMarked,
  FileText,
  TrendingUp,
  Award,
  LogOut,
  Plus,
  Trash2,
  Settings,
  FileQuestion,
  Loader2,
  Wifi,
  WifiOff,
  CloudUpload,
  CheckCircle2,
  Image as ImageIcon,
  X,
  Edit2,
  Save,
  School,
  Eye
} from 'lucide-react';
import { PROFESSORS, MODULES, ROOMS, TIME_SLOTS, DAYS, DEFAULT_SCHEDULE, DEFAULT_FILIERES, generateId, type Course, type DaySchedule, type Filiere } from './data';

// Firebase imports
import { auth, db, storage, googleProvider } from './firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';

// --- Types ---
type ResourceType = 'Cours' | 'TD' | 'TP' | 'QCM' | 'Ancien Examen';
type Priority = 'Urgent' | 'Important' | 'Info';

interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  subject: string;
  professor: string;
  filiereId?: string;
  filiereName?: string;
  date: string;
  size: string;
  downloads: number;
  pdfUrl: string;
  storagePath?: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: Priority;
  author: string;
  imageUrl?: string;
  imageStoragePath?: string;
}

// --- Démo Data ---
const DEMO_RESOURCES: Resource[] = [
  // ===== SECTION A: Cours =====
];

const DEMO_ANNOUNCEMENTS: Announcement[] = [
  { id: '1', title: 'Report du cours de Droit', content: 'Le cours de Droit Commercial de M. BELLAMIN prévu ce mercredi est reporté à vendredi 14h.', date: '2024-03-12', priority: 'Urgent', author: 'Administration' },
  { id: '2', title: 'Rappel TP Culture digitale', content: "N'oubliez pas de préparer vos machines pour le TP avec Mr MOUHCINE cette semaine.", date: '2024-03-11', priority: 'Important', author: 'Département' }
];

// =======================================================
// LOGO COMPONENT
// =======================================================
function ESTLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const imgSizeMap = { sm: 'h-10', md: 'h-14', lg: 'h-20' };
  const textSizeMap = { sm: 'text-sm', md: 'text-lg', lg: 'text-2xl' };
  return (
    <div className="flex items-center gap-3">
      <img src="/images/est-logo.png" alt="EST Meknès" className={`${imgSizeMap[size]} w-auto object-contain`} />
      <div className="flex flex-col justify-center">
        <span className={`font-black text-gray-900 leading-tight tracking-tight ${textSizeMap[size]}`}>EST Meknès</span>
      </div>
    </div>
  );
}

// =======================================================
// TOAST COMPONENT
// =======================================================
const Toast = ({ message, type }: { message: string; type: 'success' | 'error' | 'info' }) => {
  const colors = { success: 'bg-emerald-500', error: 'bg-red-500', info: 'bg-blue-500' };
  const icons = {
    success: <CheckCircle2 className="w-4 h-4" />,
    error: <WifiOff className="w-4 h-4" />,
    info: <Bell className="w-4 h-4" />
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.3 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.5 }}
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-white shadow-2xl flex items-center gap-2 ${colors[type]} z-[100]`}
    >
      {icons[type]}
      <span className="font-medium text-sm">{message}</span>
    </motion.div>
  );
};

// =======================================================
// MAIN APP
// =======================================================
export default function App() {
  // --- Auth State ---
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [pendingAdminUser, setPendingAdminUser] = useState<FirebaseUser | null>(null);

  // --- App State ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'resources' | 'schedule' | 'announcements' | 'admin'>('dashboard');
  const [resources, setResources] = useState<Resource[]>(DEMO_RESOURCES);
  const [announcements, setAnnouncements] = useState<Announcement[]>(DEMO_ANNOUNCEMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [resourceFilter, setResourceFilter] = useState<'Tous' | ResourceType>('Tous');
  const [firebaseConnected, setFirebaseConnected] = useState(true);

  // --- Filière State ---
  const [filieres, setFilieres] = useState<Filiere[]>(DEFAULT_FILIERES);
  const [selectedFiliere, setSelectedFiliere] = useState<string>('');
  const [resourceFiliere, setResourceFiliere] = useState<string>('');
  const [publishFiliere, setPublishFiliere] = useState<string>('');
  const [scheduleByFiliere, setScheduleByFiliere] = useState<Record<string, DaySchedule[]>>({});

  // --- Admin Form ---
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState<ResourceType>('Cours');
  const [newSubject, setNewSubject] = useState('');
  const [newProfessor, setNewProfessor] = useState('');
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
  const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
  const [newAnnouncementPriority, setNewAnnouncementPriority] = useState<Priority>('Info');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // --- Admin Tabs ---
  const [adminTab, setAdminTab] = useState<'publish' | 'schedule' | 'filieres' | 'announcements'>('publish');

  // --- Schedule Edit State ---
  const [editingSchedule, setEditingSchedule] = useState<DaySchedule[]>(DEFAULT_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState<string>('Lundi');
  const [showAddCourse, setShowAddCourse] = useState(false);

  // --- New Course Form ---
  const [courseSubject, setCourseSubject] = useState('');
  const [courseProf, setCourseProf] = useState('');
  const [courseRoom, setCourseRoom] = useState('Amphi A');
  const [courseTime, setCourseTime] = useState('08:30 - 10:30');
  const [courseType, setCourseType] = useState('Cours');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // --- Filière Form ---
  const [newFiliereName, setNewFiliereName] = useState('');
  const [newFiliereCode, setNewFiliereCode] = useState('');

  const [toastMessage, setToastMessage] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // --- Toast Helper ---
  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // ===================================================
  // 🔥 FIREBASE AUTH
  // ===================================================
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        if (user.email && user.email.endsWith('@edu.umi.ac.ma')) {
          setFirebaseUser(user);
          const adminFlag = localStorage.getItem('estm_admin_verified');
          if (user.email === 'admin@edu.umi.ac.ma' && adminFlag === 'true') {
            setIsAdmin(true);
          }
        } else {
          signOut(auth);
          setAuthError('Seuls les emails @edu.umi.ac.ma sont autorisés');
        }
      } else {
        setFirebaseUser(null);
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ===================================================
  // 🔥 FIRESTORE - Resources
  // ===================================================
  useEffect(() => {
    try {
      const q = query(collection(db, 'resources'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          setFirebaseConnected(true);
          if (!snapshot.empty) {
            const docs: Resource[] = snapshot.docs.map(d => {
              const data = d.data();
              return {
                id: d.id,
                title: data.title || '',
                type: data.type || 'Cours',
                subject: data.subject || '',
                professor: data.professor || '',
                filiereId: data.filiereId || '',
                filiereName: data.filiereName || '',
                date: data.date || '',
                size: data.size || '',
                downloads: data.downloads || 0,
                pdfUrl: data.pdfUrl || '',
                storagePath: data.storagePath || ''
              };
            });
            setResources(docs);
          }
        },
      () => {}
    );
      return () => unsubscribe();
     } catch (error) {
  console.error("الخطأ الحقيقي ديال Firebase هو: ", error);
}
  }, []);

  // ===================================================
  // 🔥 FIRESTORE - Announcements
  // ===================================================
  useEffect(() => {
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          if (!snapshot.empty) {
            const docs: Announcement[] = snapshot.docs.map(d => {
              const data = d.data();
              return {
                id: d.id,
                title: data.title || '',
                content: data.content || '',
                date: data.date || '',
                priority: data.priority || 'Info',
                author: data.author || '',
                imageUrl: data.imageUrl || '',
                imageStoragePath: data.imageStoragePath || ''
              };
            });
            setAnnouncements(docs);
          }
        },
        () => { }
      );
      return () => unsubscribe();
    } catch { }
  }, []);

  // ===================================================
  // 🔥 FIRESTORE - Filières
  // ===================================================
  useEffect(() => {
    try {
      const q = query(collection(db, 'filieres'), orderBy('name', 'asc'));
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          if (!snapshot.empty) {
            const docs: Filiere[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Filiere));
            setFilieres(docs);
          }
        },
        () => { }
      );
      return () => unsubscribe();
    } catch { }
  }, []);

  // ===================================================
  // 🔥 FIRESTORE - Schedule
  // ===================================================
  useEffect(() => {
    try {
      const q = query(collection(db, 'schedules'));
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          if (!snapshot.empty) {
            const grouped: Record<string, DaySchedule[]> = {};
            snapshot.docs.forEach((docSnap) => {
              const data = docSnap.data();
              const filiereId = data.filiereId || 'tm-fba-a';
              const day = data.day || docSnap.id;
              if (!grouped[filiereId]) {
                grouped[filiereId] = DAYS.map((d) => ({ day: d, courses: [] }));
              }
              const dayIndex = grouped[filiereId].findIndex((entry) => entry.day === day);
              if (dayIndex >= 0) {
                grouped[filiereId][dayIndex] = { day, courses: data.courses || [] };
              }
            });
            setScheduleByFiliere(grouped);
          }
        },
        () => { }
      );
      return () => unsubscribe();
    } catch { }
  }, []);

  useEffect(() => {
    if (!selectedFiliere) {
      setEditingSchedule(DAYS.map((day) => ({ day, courses: [] })));
      return;
    }

    const filiereDefaultSchedule = filieres.find((f) => f.id === selectedFiliere)?.schedules || DEFAULT_SCHEDULE;
    setEditingSchedule(scheduleByFiliere[selectedFiliere] || filiereDefaultSchedule);
  }, [selectedFiliere, scheduleByFiliere, filieres]);

  // ===================================================
  // 🔐 GOOGLE LOGIN
  // ===================================================
  const handleGoogleLogin = async () => {
    setAuthError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email || '';

      if (!email.endsWith('@edu.umi.ac.ma')) {
        await signOut(auth);
        setAuthError('❌ Accès refusé. Utilisez votre email académique (@edu.umi.ac.ma)');
        return;
      }

      if (email === 'admin@edu.umi.ac.ma') {
        setPendingAdminUser(result.user);
        setShowAdminPassword(true);
        return;
      }

      setFirebaseUser(result.user);
      showToast(`Bienvenue ${result.user.displayName || email} !`);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') return;
      console.warn('Firebase Auth error:', err.message);
      setAuthError('Firebase non configuré. Mode démonstration.');
    }
  };

  // --- Demo Login ---
  const [demoEmail, setDemoEmail] = useState('');
  const [demoPassword, setDemoPassword] = useState('');

  const handleDemoLogin = (e: React.FormEvent) => {
  e.preventDefault();

  // 1. الإيميلات اللي مسموح ليهم يدخلو من هاد الخانة
  const adminEmail = 'admin@edu.umi.ac.ma';
  const samirEmail = 'samirdani1@edu.umi.ac.ma';
  const sanaeEmail = 'sanaedani@edu.umi.ac.ma'; // <-- بدل هادي بالإيميل اللي بغيتي تعطي لأختك

  // 2. الشروط ديال الدخول
  if (demoEmail === adminEmail && demoPassword === 'ESTM2026') {
    // دخول كإدارة
    setFirebaseUser({ email: adminEmail, displayName: 'Admin ESTM' } as any);
    setIsAdmin(true);
    localStorage.setItem('estm_admin_verified', 'true');
    showToast('Bienvenue Administrateur !');

  } else if (demoEmail === samirEmail ) { 
    // دخول ديالك نتا كأدمن
    setFirebaseUser({ email: samirEmail, displayName: 'Samir Dani' } as any);
    setIsAdmin(true); 
    localStorage.setItem('estm_admin_verified', 'true');
    showToast('Bienvenue Samir !');

  } else if (demoEmail === sanaeEmail ) {
    // دخول ديال أختك كطالبة عادية (بدون صلاحيات الإدارة)
    setFirebaseUser({ email: sanaeEmail, displayName: 'Sanae Dani' } as any); // <-- كتب سميتها هنا باش تطلع ليها الفوق
    setIsAdmin(false); // <-- ها السر: عطيناها false باش ما تكونش أدمن
    localStorage.removeItem('estm_admin_verified'); // تأكيد باش ما يوقعش شي خطأ فالتسجيل
    showToast('Bienvenue !');

  } else {
    // 3. أي طالب آخر كتب الإيميل ديالو بيديو غيطلع ليه هاد الإيرور
    setAuthError('عذراً، هاد الخانة مخصصة للإدارة فقط. المرجو الدخول عبر زر Google ⚠️');
  }
};

  // ===================================================
  // 🚪 LOGOUT
  // ===================================================
  const handleLogout = async () => {
    try { await signOut(auth); } catch { }
    setFirebaseUser(null);
    setIsAdmin(false);
    setActiveTab('dashboard');
    localStorage.removeItem('estm_admin_verified');
  };

  // ===================================================
  // 📤 UPLOAD PDF
  // ===================================================
  const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        showToast('Veuillez sélectionner un fichier PDF', 'error');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        showToast('Le fichier ne doit pas dépasser 50 MB', 'error');
        return;
      }
      setSelectedPdf(file);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        showToast('Veuillez sélectionner une image', 'error');
        return;
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handlePublishResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPdf) {
      showToast('Veuillez ajouter un fichier PDF', 'error');
      return;
    }
    if (!newTitle || !newSubject || !newProfessor) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }
    if (!publishFiliere) {
      showToast('Choisissez une filière avant de publier', 'error');
      return;
    }

    const selectedPublishFiliere = filieres.find((f) => f.id === publishFiliere);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      if (firebaseConnected) {
        const fileName = `${Date.now()}_${selectedPdf.name}`;
        const storageRef = ref(storage, `pdfs/${newType}/${fileName}`);
        const uploadTask = uploadBytesResumable(storageRef, selectedPdf);

        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (error) => reject(error),
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              await addDoc(collection(db, 'resources'), {
                title: newTitle,
                type: newType,
                subject: newSubject,
                professor: newProfessor,
                filiereId: publishFiliere,
                filiereName: selectedPublishFiliere?.name || '',
                date: new Date().toISOString().split('T')[0],
                size: (selectedPdf!.size / (1024 * 1024)).toFixed(1) + ' MB',
                downloads: 0,
                pdfUrl: downloadURL,
                storagePath: `pdfs/${newType}/${fileName}`,
                createdAt: serverTimestamp(),
                uploadedBy: firebaseUser?.email || 'admin'
              });
              resolve();
            }
          );
        });
        showToast(`✅ ${newType} publié sur Firebase !`);
      } else {
        await new Promise(r => {
          let p = 0;
          const interval = setInterval(() => {
            p += 15;
            setUploadProgress(Math.min(p, 100));
            if (p >= 100) { clearInterval(interval); r(undefined); }
          }, 100);
        });
        const pdfUrl = URL.createObjectURL(selectedPdf);
        const newDoc: Resource = {
          id: Date.now().toString(),
          title: newTitle,
          type: newType,
          subject: newSubject,
          professor: newProfessor,
          filiereId: publishFiliere,
          filiereName: selectedPublishFiliere?.name || '',
          date: new Date().toISOString().split('T')[0],
          size: (selectedPdf.size / (1024 * 1024)).toFixed(1) + ' MB',
          downloads: 0,
          pdfUrl
        };
        setResources(prev => [newDoc, ...prev]);
        showToast(`✅ ${newType} publié (mode démo)`);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      showToast('Erreur lors de la publication', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setNewTitle('');
      setNewSubject('');
      setNewProfessor('');
      setSelectedPdf(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // ===================================================
  // 📢 PUBLISH ANNOUNCEMENT WITH IMAGE
  // ===================================================
  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnouncementTitle || !newAnnouncementContent) {
      showToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    try {
      if (firebaseConnected) {
        let imageUrl = '';
        let imageStoragePath = '';

        if (selectedImage) {
          const imgName = `${Date.now()}_${selectedImage.name}`;
          const imgRef = ref(storage, `announcements/${imgName}`);
          const imgTask = uploadBytesResumable(imgRef, selectedImage);

          await new Promise<void>((resolve, reject) => {
            imgTask.on('state_changed',
              () => { },
              (error) => reject(error),
              async () => {
                imageUrl = await getDownloadURL(imgTask.snapshot.ref);
                imageStoragePath = `announcements/${imgName}`;
                resolve();
              }
            );
          });
        }

        await addDoc(collection(db, 'announcements'), {
          title: newAnnouncementTitle,
          content: newAnnouncementContent,
          priority: newAnnouncementPriority,
          date: new Date().toISOString().split('T')[0],
          author: 'Administration',
          imageUrl,
          imageStoragePath,
          createdAt: serverTimestamp()
        });
        showToast('✅ Annonce publiée sur Firebase !');
      } else {
        const newAnn: Announcement = {
          id: Date.now().toString(),
          title: newAnnouncementTitle,
          content: newAnnouncementContent,
          priority: newAnnouncementPriority,
          date: new Date().toISOString().split('T')[0],
          author: 'Administration',
          imageUrl: selectedImage ? URL.createObjectURL(selectedImage) : undefined
        };
        setAnnouncements(prev => [newAnn, ...prev]);
        showToast('✅ Annonce publiée (mode démo)');
      }
    } catch (err: any) {
      showToast('Erreur : ' + (err.message || ''), 'error');
    }

    setNewAnnouncementTitle('');
    setNewAnnouncementContent('');
    setNewAnnouncementPriority('Info');
    setSelectedImage(null);
    setImagePreview(null);
  };

  // ===================================================
  // 🗑️ DELETE
  // ===================================================
  const handleDeleteResource = async (resource: Resource) => {
    try {
      if (firebaseConnected) {
        await deleteDoc(doc(db, 'resources', resource.id));
        if (resource.storagePath) {
          try { await deleteObject(ref(storage, resource.storagePath)); } catch { }
        }
        showToast('Document supprimé', 'info');
      } else {
        setResources(prev => prev.filter(r => r.id !== resource.id));
        showToast('Document supprimé', 'info');
      }
    } catch (err: any) {
      showToast('Erreur suppression', 'error');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      if (firebaseConnected) {
        const ann = announcements.find(a => a.id === id);
        await deleteDoc(doc(db, 'announcements', id));
        if (ann?.imageStoragePath) {
          try { await deleteObject(ref(storage, ann.imageStoragePath)); } catch { }
        }
        showToast('Annonce supprimée', 'info');
      } else {
        setAnnouncements(prev => prev.filter(a => a.id !== id));
        showToast('Annonce supprimée', 'info');
      }
    } catch (err: any) {
      showToast('Erreur suppression', 'error');
    }
  };

  // ===================================================
  // 📥 DOWNLOAD
  // ===================================================
  const handleDownload = (resource: Resource) => {
    if (resource.pdfUrl) {
      window.open(resource.pdfUrl, '_blank');
    } else {
      const blob = new Blob([`Fichier: ${resource.title}`], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resource.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    showToast(`Téléchargement: ${resource.title}`);
  };

  // ===================================================
  // 📅 SCHEDULE HELPERS
  // ===================================================
  const getCurrentDay = () => {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();
  const currentSchedule = editingSchedule.find(s => s.day === currentDay)?.courses || [];
  const selectedResourcePool = resourceFiliere ? resources.filter((r) => r.filiereId === resourceFiliere) : [];

  const filteredResources = resources.filter(r => {
    const matchesFiliere = Boolean(resourceFiliere) && r.filiereId === resourceFiliere;
    const matchesFilter = resourceFilter === 'Tous' || r.type === resourceFilter;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.professor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFiliere && matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'Urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'Important': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Info': return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'Cours': return <BookOpen className="w-5 h-5 text-emerald-600" />;
      case 'TD': return <FileText className="w-5 h-5 text-teal-600" />;
      case 'TP': return <TrendingUp className="w-5 h-5 text-cyan-600" />;
      case 'QCM': return <FileQuestion className="w-5 h-5 text-indigo-600" />;
      case 'Ancien Examen': return <Award className="w-5 h-5 text-amber-600" />;
    }
  };

  const getTypeColor = (type: ResourceType) => {
    switch (type) {
      case 'Cours': return 'bg-emerald-50 text-emerald-700';
      case 'TD': return 'bg-teal-50 text-teal-700';
      case 'TP': return 'bg-cyan-50 text-cyan-700';
      case 'QCM': return 'bg-indigo-50 text-indigo-700';
      case 'Ancien Examen': return 'bg-amber-50 text-amber-700';
    }
  };

  // ===================================================
  // 📅 SCHEDULE CRUD
  // ===================================================
  const handleAddCourse = () => {
    if (!selectedFiliere) {
      showToast('Choisissez une filière avant de modifier son emploi du temps', 'error');
      return;
    }
    if (!courseSubject || !courseProf) {
      showToast('Veuillez remplir la matière et le professeur', 'error');
      return;
    }

    const newCourse: Course = {
      id: generateId(),
      time: courseTime,
      subject: courseSubject,
      prof: courseProf,
      room: courseRoom,
      type: courseType
    };

    const updated = editingSchedule.map(day => {
      if (day.day === selectedDay) {
        return { ...day, courses: [...day.courses, newCourse] };
      }
      return day;
    });

    setEditingSchedule(updated);
    setShowAddCourse(false);
    setCourseSubject('');
    setCourseProf('');
    setCourseRoom('Amphi A');
    setCourseTime('08:30 - 10:30');
    setCourseType('Cours');
    setEditingCourseId(null);
    showToast('Cours ajouté', 'success');
  };

  const handleStartEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setShowAddCourse(true);
    setCourseSubject(course.subject);
    setCourseProf(course.prof);
    setCourseRoom(course.room);
    setCourseTime(course.time);
    setCourseType(course.type);
  };

  const handleUpdateCourse = () => {
    if (!editingCourseId) return;
    if (!courseSubject || !courseProf) {
      showToast('Veuillez remplir la matière et le professeur', 'error');
      return;
    }

    const updated = editingSchedule.map((day) => {
      if (day.day !== selectedDay) return day;
      return {
        ...day,
        courses: day.courses.map((course) =>
          course.id === editingCourseId
            ? {
              ...course,
              subject: courseSubject,
              prof: courseProf,
              room: courseRoom,
              time: courseTime,
              type: courseType
            }
            : course
        )
      };
    });

    setEditingSchedule(updated);
    setShowAddCourse(false);
    setEditingCourseId(null);
    setCourseSubject('');
    setCourseProf('');
    setCourseRoom('Amphi A');
    setCourseTime('08:30 - 10:30');
    setCourseType('Cours');
    showToast('Cours modifié', 'success');
  };

  const handleDeleteCourse = (courseId: string) => {
    const updated = editingSchedule.map(day => {
      if (day.day === selectedDay) {
        return { ...day, courses: day.courses.filter(c => c.id !== courseId) };
      }
      return day;
    });
    setEditingSchedule(updated);
    if (editingCourseId === courseId) setEditingCourseId(null);
    showToast('Cours supprimé', 'info');
  };

  const handleSaveSchedule = async () => {
    if (!selectedFiliere) {
      showToast('Choisissez une filière à sauvegarder', 'error');
      return;
    }

    try {
      if (firebaseConnected) {
        for (const day of editingSchedule) {
          await setDoc(doc(db, 'schedules', `${selectedFiliere}_${day.day}`), {
            filiereId: selectedFiliere,
            day: day.day,
            courses: day.courses,
            updatedAt: serverTimestamp()
          }, { merge: true });
        }
        setScheduleByFiliere((prev) => ({ ...prev, [selectedFiliere]: editingSchedule }));
        showToast('✅ Emploi du temps sauvegardé pour cette filière', 'success');
      } else {
        setScheduleByFiliere((prev) => ({ ...prev, [selectedFiliere]: editingSchedule }));
        showToast('✅ Emploi du temps sauvegardé (mode démo)', 'success');
      }
    } catch (err: any) {
      showToast('Erreur sauvegarde', 'error');
    }
  };

  // ===================================================
  // 🏫 FILIÈRE CRUD
  // ===================================================
  const handleAddFiliere = async () => {
    if (!newFiliereName || !newFiliereCode) {
      showToast('Veuillez remplir le nom et le code', 'error');
      return;
    }

    const newFiliere: Filiere = {
      id: generateId(),
      name: newFiliereName,
      code: newFiliereCode,
      schedules: DEFAULT_SCHEDULE
    };

    try {
      if (firebaseConnected) {
        await addDoc(collection(db, 'filieres'), newFiliere);
        showToast('✅ Filière ajoutée sur Firebase !', 'success');
      } else {
        setFilieres(prev => [...prev, newFiliere]);
        setScheduleByFiliere((prev) => ({ ...prev, [newFiliere.id]: DEFAULT_SCHEDULE }));
        showToast('✅ Filière ajoutée (mode démo)', 'success');
      }
      setSelectedFiliere(newFiliere.id);
      setResourceFiliere(newFiliere.id);
      setPublishFiliere(newFiliere.id);
      setNewFiliereName('');
      setNewFiliereCode('');
    } catch (err: any) {
      showToast('Erreur', 'error');
    }
  };

  const handleDeleteFiliere = async (filiereId: string) => {
    try {
      if (firebaseConnected) {
        await deleteDoc(doc(db, 'filieres', filiereId));
        showToast('Filière supprimée', 'info');
      } else {
        setFilieres(prev => prev.filter(f => f.id !== filiereId));
        setScheduleByFiliere((prev) => {
          const next = { ...prev };
          delete next[filiereId];
          return next;
        });
        showToast('Filière supprimée', 'info');
      }

      if (selectedFiliere === filiereId) setSelectedFiliere('');
      if (resourceFiliere === filiereId) setResourceFiliere('');
      if (publishFiliere === filiereId) setPublishFiliere('');
    } catch (err: any) {
      showToast('Erreur', 'error');
    }
  };

  // ===================================================
  // ⏳ LOADING SCREEN
  // ===================================================
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="mb-6 flex justify-center"><ESTLogo size="lg" /></div>
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Chargement...</p>
        </motion.div>
      </div>
    );
  }

  // ===================================================
  // 🔐 LOGIN PAGE
  // ===================================================
  if (!firebaseUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/30 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500" />
          <div className="flex justify-center mb-8 mt-4"><ESTLogo size="lg" /></div>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Espace Étudiant</h2>
            <p className="text-slate-500 mt-2 text-sm">Plateforme de partage des ressources EST Meknès</p>
          </div>

          <AnimatePresence>
            {showAdminPassword && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <p className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><Settings className="w-4 h-4" /> Mot de passe Administrateur</p>
                <input type="password" value={adminPasswordInput} onChange={(e) => setAdminPasswordInput(e.target.value)} placeholder="Entrez le mot de passe admin" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 mb-3" autoFocus />
                <button onClick={handleAdminPasswordSubmit} className="w-full bg-slate-900 text-white py-2.5 rounded-xl font-bold hover:bg-slate-800">Valider</button>
              </motion.div>
            )}
          </AnimatePresence>

          {!showAdminPassword && (
            <>
              <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:border-slate-300 transition-all active:scale-[0.98] mb-4">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Se connecter avec Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-xs text-slate-400 font-medium">ou email académique</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              <form onSubmit={handleDemoLogin} className="space-y-4">
                <input type="email" value={demoEmail} onChange={(e) => setDemoEmail(e.target.value)} placeholder="prenom.nom@edu.umi.ac.ma" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-sm" required />
                <AnimatePresence>
                  {demoEmail === 'admin@edu.umi.ac.ma' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <input type="password" value={demoPassword} onChange={(e) => setDemoPassword(e.target.value)} placeholder="Mot de passe admin (ESTM2026)" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50 text-sm" />
                    </motion.div>
                  )}
                </AnimatePresence>
                <button type="submit" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                  <LogOut className="w-5 h-5 rotate-180" /> Se Connecter
                </button>
              </form>
            </>
          )}

          <AnimatePresence>{authError && (<motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-500 text-sm font-medium mt-4 text-center bg-red-50 p-3 rounded-xl">{authError}</motion.p>)}</AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">🔒 Accès réservé aux étudiants de l'EST Meknès</p>
            <p className="text-[10px] text-slate-300 mt-1">Email requis : @edu.umi.ac.ma</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ===================================================
  // 🏠 MAIN APP
  // ===================================================
  const navigateToResourceFilter = (filter: ResourceType) => {
    setActiveTab('resources');
    setResourceFilter(filter);
  };

  const userDisplayName = firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Étudiant';
  const currentFiliere = filieres.find(f => f.id === selectedFiliere);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-0">
      <AnimatePresence>{toastMessage && <Toast message={toastMessage.msg} type={toastMessage.type} />}</AnimatePresence>

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <ESTLogo size="sm" />
          <div className="flex items-center gap-3">
            <div className={`hidden md:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${firebaseConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              {firebaseConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {firebaseConnected ? 'Firebase' : 'Mode démo'}
            </div>
            <div className="hidden md:flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
              {firebaseUser.photoURL ? (<img src={firebaseUser.photoURL} alt="" className="w-5 h-5 rounded-full" />) : (<div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white text-[10px] font-bold">{userDisplayName[0]?.toUpperCase()}</div>)}
              {userDisplayName}
              {isAdmin && <span className="bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded-md font-bold">ADMIN</span>}
            </div>
            <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors active:scale-95">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl mx-auto w-full flex">
        {/* Desktop Sidebar */}
        <nav className="hidden md:flex w-64 flex-col p-6 gap-2 bg-white border-r border-slate-200 min-h-[calc(100vh-64px)]">
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 mb-4 border border-emerald-100">
            <div className="flex items-center gap-3 mb-2">
              {firebaseUser.photoURL ? (<img src={firebaseUser.photoURL} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />) : (<div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center text-white text-lg font-bold shadow-sm">{userDisplayName[0]?.toUpperCase()}</div>)}
              <div>
                <p className="font-bold text-slate-800 text-sm leading-tight">{userDisplayName}</p>
                <p className="text-[10px] text-slate-500">{isAdmin ? '👑 Administrateur' : '🎓 Étudiant TM-FBA'}</p>
              </div>
            </div>
          </div>

          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <TrendingUp className="w-5 h-5" /> Accueil
          </button>
          <button onClick={() => { setActiveTab('resources'); setResourceFilter('Tous'); }} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'resources' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <BookMarked className="w-5 h-5" /> Ressources PDF
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'schedule' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Calendar className="w-5 h-5" /> Emploi du temps
          </button>
          <button onClick={() => setActiveTab('announcements')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${activeTab === 'announcements' ? 'bg-emerald-50 text-emerald-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Bell className="w-5 h-5" /> Annonces
            {announcements.filter(a => a.priority === 'Urgent').length > 0 && (<span className="ml-auto bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse">New</span>)}
          </button>
          {isAdmin && (
            <button onClick={() => setActiveTab('admin')} className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all mt-auto ${activeTab === 'admin' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100'}`}>
              <Settings className="w-5 h-5" /> Administration
            </button>
          )}
        </nav>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          {/* ===================== DASHBOARD ===================== */}
          {activeTab === 'dashboard' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-cyan-800 rounded-3xl p-6 md:p-8 text-white shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 w-72 h-72 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/4" />
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold">Bonjour {userDisplayName} ! 👋</h1>
                    {firebaseConnected && (<span className="bg-white/20 text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1"><Wifi className="w-3 h-3" /> Firebase</span>)}
                  </div>
                  <p className="text-emerald-100 mb-6 max-w-lg">Plateforme des Cours, TD, TP, QCM et Anciens Examens en PDF tous les filière.</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {([
                      { type: 'Cours' as ResourceType, emoji: '📖', bg: 'from-emerald-500/20 to-emerald-600/20' },
                      { type: 'TD' as ResourceType, emoji: '📝', bg: 'from-teal-500/20 to-teal-600/20' },
                      { type: 'TP' as ResourceType, emoji: '💻', bg: 'from-cyan-500/20 to-cyan-600/20' },
                      { type: 'QCM' as ResourceType, emoji: '❓', bg: 'from-indigo-500/30 to-purple-600/30' },
                      { type: 'Ancien Examen' as ResourceType, emoji: '🏆', bg: 'from-amber-500/30 to-orange-600/30' },
                    ]).map(({ type, emoji, bg }) => (
                      <div key={type} onClick={() => navigateToResourceFilter(type)} className={`bg-gradient-to-br ${bg} backdrop-blur-md rounded-2xl p-4 cursor-pointer hover:scale-105 transition-all active:scale-95 border border-white/10`}>
                        <div className="text-2xl mb-1">{emoji}</div>
                        <div className="text-3xl font-black">{resources.filter(r => r.type === type).length}</div>
                        <div className="text-emerald-100 text-sm font-semibold">{type}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Calendar className="text-emerald-500" /> Programme de {currentDay}</h3>
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-bold">{currentSchedule.length} Séances</span>
                  </div>
                  <div className="space-y-3">
                    {currentSchedule.length > 0 ? currentSchedule.map((course) => (
                      <div key={course.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-emerald-50/50 transition-colors">
                        <div className="flex flex-col items-center justify-center bg-white rounded-xl px-3 py-2 border border-slate-200 min-w-[80px]">
                          <span className="text-sm font-bold text-slate-800">{course.time.split(' - ')[0]}</span>
                          <span className="text-xs text-slate-400">à {course.time.split(' - ')[1]}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{course.subject}</h4>
                          <p className="text-sm text-slate-600">{course.prof}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">{course.type}</span>
                            <span className="text-xs text-slate-500">{course.room}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-400">
                        <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Aucun cours programmé aujourd'hui 🎉</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setActiveTab('schedule')} className="w-full mt-4 text-emerald-600 text-sm font-bold flex items-center justify-center gap-1 hover:text-emerald-700">
                    Voir la semaine complète <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-6"><Bell className="text-amber-500" /> Dernières Annonces</h3>
                  <div className="space-y-4">
                    {announcements.length > 0 ? announcements.slice(0, 3).map(ann => (
                      <div key={ann.id} className={`p-4 rounded-2xl border ${getPriorityColor(ann.priority)}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold uppercase tracking-wider">{ann.priority}</span>
                          <span className="text-xs opacity-75 ml-auto">{ann.date}</span>
                        </div>
                        <h4 className="font-bold mb-1">{ann.title}</h4>
                        <p className="text-sm opacity-90">{ann.content}</p>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-slate-400">
                        <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Aucune annonce pour le moment</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

           {/* ===================== RESOURCES ===================== */}
          {activeTab === 'resources' && (() => {
            const filterConfig: { label: string; value: 'Tous' | ResourceType; icon: React.ReactNode; activeBg: string; activeText: string; badgeBg: string }[] = [
              { label: 'Tous', value: 'Tous', icon: <BookMarked className="w-4 h-4" />, activeBg: 'bg-emerald-600', activeText: 'text-white', badgeBg: 'bg-emerald-500' },
              { label: 'Cours', value: 'Cours', icon: <BookOpen className="w-4 h-4" />, activeBg: 'bg-emerald-600', activeText: 'text-white', badgeBg: 'bg-emerald-500' },
              { label: 'TD', value: 'TD', icon: <FileText className="w-4 h-4" />, activeBg: 'bg-teal-600', activeText: 'text-white', badgeBg: 'bg-teal-500' },
              { label: 'TP', value: 'TP', icon: <TrendingUp className="w-4 h-4" />, activeBg: 'bg-cyan-600', activeText: 'text-white', badgeBg: 'bg-cyan-500' },
              { label: 'QCM', value: 'QCM', icon: <FileQuestion className="w-4 h-4" />, activeBg: 'bg-indigo-600', activeText: 'text-white', badgeBg: 'bg-indigo-500' },
              { label: 'Anciens Examens', value: 'Ancien Examen', icon: <Award className="w-4 h-4" />, activeBg: 'bg-amber-600', activeText: 'text-white', badgeBg: 'bg-amber-500' },
            ];
            return (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              {/* Sélecteur de filière */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row gap-4 md:items-center">
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">📚 Filière</label>
                    <select value={resourceFiliere} onChange={(e) => { setResourceFiliere(e.target.value); setResourceFilter('Tous'); }} className="w-full md:w-80 px-4 py-2.5 rounded-xl border-2 border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500">
                      <option value="">— Choisir une filière —</option>
                      {filieres.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}
                    </select>
                  </div>
                  <div className="relative flex-1 max-w-md">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">🔍 Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type="text" placeholder="Chercher une matière, un prof..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-slate-50" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Boutons de filtre avec couleurs distinctes */}
              {resourceFiliere && (
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">📂 Filtrer par type</p>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {filterConfig.map(({ label, value, icon, activeBg, activeText, badgeBg }) => {
                      const count = value === 'Tous' ? selectedResourcePool.length : selectedResourcePool.filter(r => r.type === value).length;
                      const isActive = resourceFilter === value;
                      return (
                        <button
                          key={value}
                          onClick={() => setResourceFilter(value)}
                          className={`relative flex flex-col items-center gap-1.5 px-3 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 border-2 ${
                            isActive
                              ? `${activeBg} ${activeText} border-transparent shadow-lg scale-[1.02]`
                              : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <span className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20' : 'bg-white shadow-sm'}`}>{icon}</span>
                          <span className="text-xs leading-tight">{label}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            isActive ? `${badgeBg} text-white` : 'bg-slate-200 text-slate-600'
                          }`}>{count}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {!resourceFiliere ? (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border-2 border-dashed border-emerald-200 p-16 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                    <BookMarked className="w-10 h-10 text-emerald-500" />
                  </div>
                  <p className="font-bold text-emerald-800 text-lg mb-2">Sélectionnez votre filière</p>
                  <p className="text-emerald-600 text-sm max-w-md mx-auto">Choisissez d'abord une filière dans le menu ci-dessus pour accéder aux Cours, TD, TP, QCM et Anciens Examens.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredResources.length > 0 ? filteredResources.map((resource) => {
                    const typeColorMap: Record<string, string> = {
                      'Cours': 'bg-emerald-50 text-emerald-600 border-emerald-200',
                      'TD': 'bg-teal-50 text-teal-600 border-teal-200',
                      'TP': 'bg-cyan-50 text-cyan-600 border-cyan-200',
                      'QCM': 'bg-indigo-50 text-indigo-600 border-indigo-200',
                      'Ancien Examen': 'bg-amber-50 text-amber-600 border-amber-200',
                    };
                    const iconBgMap: Record<string, string> = {
                      'Cours': 'bg-emerald-100',
                      'TD': 'bg-teal-100',
                      'TP': 'bg-cyan-100',
                      'QCM': 'bg-indigo-100',
                      'Ancien Examen': 'bg-amber-100',
                    };
                    return (
                  <motion.div layout key={resource.id} className={`bg-white p-5 rounded-2xl shadow-sm border-2 hover:shadow-lg transition-all group flex flex-col h-full ${resource.type === 'QCM' ? 'border-indigo-100' : resource.type === 'Ancien Examen' ? 'border-amber-100' : 'border-slate-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-xl ${iconBgMap[resource.type] || 'bg-emerald-50'}`}>{getTypeIcon(resource.type)}</div>
                      <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${typeColorMap[resource.type] || getTypeColor(resource.type)}`}>{resource.type}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-1 leading-tight">{resource.title}</h3>
                    <p className="text-sm text-slate-600 font-medium mb-1">{resource.subject}</p>
                    <p className="text-sm text-slate-500 mb-1">{resource.professor}</p>
                    <p className="text-xs text-emerald-600 font-semibold mb-1">{resource.filiereName || 'Filière non définie'}</p>
                    <p className="text-xs text-slate-400 mb-4">{resource.date}</p>
                    <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">{resource.size}</span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{resource.downloads} ↓</span>
                      </div>
                      <button onClick={() => handleDownload(resource)} className={`flex items-center gap-1.5 font-bold text-sm active:scale-95 transition-all px-3 py-1.5 rounded-lg ${
                        resource.type === 'QCM' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' :
                        resource.type === 'Ancien Examen' ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' :
                        'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                      }`}>
                        <Download className="w-4 h-4" /> PDF
                      </button>
                    </div>
                  </motion.div>
                    );
                  }) : (
                    <div className="col-span-full text-center py-16 bg-white rounded-3xl border border-slate-100">
                      <BookMarked className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-medium">Aucun document « {resourceFilter} » trouvé pour cette filière</p>
                      <p className="text-slate-400 text-sm mt-1">Essayez un autre filtre ou une autre filière</p>
                      <button onClick={() => setResourceFilter('Tous')} className="mt-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-bold hover:bg-emerald-200 transition-colors">
                        Voir tous les documents
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
            );
          })()}

          {/* ===================== SCHEDULE ===================== */}
          {activeTab === 'schedule' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3"><Calendar className="text-emerald-500" /> Emploi du Temps</h2>
                    <p className="text-slate-500 text-sm mt-1">Semaine en cours - {currentFiliere?.name || 'Choisissez une filière'}</p>
                  </div>
                  <select value={selectedFiliere} onChange={(e) => setSelectedFiliere(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium">
                    <option value="">Choisir une filière</option>
                    {filieres.map(f => (<option key={f.id} value={f.id}>{f.name}</option>))}
                  </select>
                </div>

                {!selectedFiliere ? (
                  <div className="py-16 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                    <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="font-semibold">Choisissez d'abord une filière pour afficher son emploi du temps.</p>
                  </div>
                ) : (
                <div className="space-y-6">
                  {DAYS.map(day => {
                    const daySched = editingSchedule.find(s => s.day === day);
                    const courses = daySched?.courses || [];
                    const isToday = day === currentDay;

                    return (
                      <div key={day} className={`rounded-2xl border-2 overflow-hidden ${isToday ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 bg-white'}`}>
                        <div className={`px-4 py-3 font-bold flex items-center gap-2 ${isToday ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-700'}`}>
                          {day}
                          {isToday && <span className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full flex items-center gap-1"><Clock className="w-3 h-3" /> Aujourd'hui</span>}
                        </div>
                        <div className="p-4">
                          {courses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {courses.map((course) => (
                                <div key={course.id} className={`p-4 rounded-xl border ${isToday ? 'bg-white border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-bold text-emerald-600">{course.time}</span>
                                    <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{course.type}</span>
                                  </div>
                                  <h4 className="font-bold text-slate-800">{course.subject}</h4>
                                  <p className="text-sm text-slate-600">{course.prof}</p>
                                  <p className="text-xs text-slate-400 mt-1">📍 {course.room}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-slate-400 text-sm italic">Aucun cours</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ===================== ANNOUNCEMENTS ===================== */}
          {activeTab === 'announcements' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 mb-6"><Bell className="text-amber-500" /> Toutes les Annonces</h2>
                <div className="space-y-4">
                  {announcements.length > 0 ? announcements.map(ann => (
                    <div key={ann.id} className={`p-6 rounded-2xl border ${getPriorityColor(ann.priority)}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider">{ann.priority}</span>
                        <span className="text-xs opacity-75 ml-auto">{ann.date}</span>
                      </div>
                      <h3 className="font-bold text-lg mb-2">{ann.title}</h3>
                      <p className="text-slate-700 mb-4">{ann.content}</p>
                      {ann.imageUrl && (
                        <div className="mt-4 rounded-xl overflow-hidden border border-white/20">
                          <img src={ann.imageUrl} alt="Annonce" className="w-full h-auto max-h-64 object-cover" />
                        </div>
                      )}
                      <p className="text-xs opacity-75 mt-4">📢 {ann.author}</p>
                    </div>
                  )) : (
                    <div className="text-center py-16 text-slate-400">
                      <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>Aucune annonce pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ===================== ADMIN PANEL ===================== */}
          {activeTab === 'admin' && isAdmin && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl">
                <h2 className="text-2xl font-bold flex items-center gap-3"><Settings className="text-emerald-400" /> Panel Administrateur</h2>
                <p className="text-slate-300 text-sm mt-1">Gérez les ressources, l'emploi du temps, les filières et les annonces</p>
                {!firebaseConnected && <div className="mt-4 bg-amber-500/20 border border-amber-500/50 rounded-xl p-3 text-amber-200 text-sm flex items-center gap-2"><WifiOff className="w-4 h-4" /> Mode démo - Configurez Firebase pour sauvegarder les données</div>}
              </div>

              {/* Admin Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button onClick={() => setAdminTab('publish')} className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap ${adminTab === 'publish' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>📤 Publier PDF</button>
                <button onClick={() => setAdminTab('schedule')} className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap ${adminTab === 'schedule' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>📅 Emploi du temps</button>
                <button onClick={() => setAdminTab('filieres')} className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap ${adminTab === 'filieres' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>🏫 Filières</button>
                <button onClick={() => setAdminTab('announcements')} className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap ${adminTab === 'announcements' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200'}`}>📢 Annonces</button>
              </div>

              {/* PUBLISH TAB */}
              {adminTab === 'publish' && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2"><CloudUpload className="text-emerald-500" /> Publier un document PDF</h3>
                  <form onSubmit={handlePublishResource} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Titre du document</label>
                        <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Ex: Chapitre 1 - Introduction" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                        <select value={newType} onChange={(e) => setNewType(e.target.value as ResourceType)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white">
                          {['Cours', 'TD', 'TP', 'QCM', 'Ancien Examen'].map(t => (<option key={t} value={t}>{t}</option>))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Filière concernée</label>
                      <select value={publishFiliere} onChange={(e) => setPublishFiliere(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white" required>
                        <option value="">Sélectionner une filière</option>
                        {filieres.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Matière / Module</label>
                        <select value={newSubject} onChange={(e) => setNewSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white" required>
                          <option value="">Sélectionner une matière</option>
                          {MODULES.map(m => (<option key={m} value={m}>{m}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Professeur</label>
                        <select value={newProfessor} onChange={(e) => setNewProfessor(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 bg-white" required>
                          <option value="">Sélectionner un professeur</option>
                          {PROFESSORS.map(p => (<option key={p} value={p}>{p}</option>))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Fichier PDF</label>
                      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-50/50 transition-all">
                        <CloudUpload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">Cliquez pour uploader un PDF</p>
                        <p className="text-slate-400 text-sm mt-1">Max 50 MB</p>
                        {selectedPdf && (
                          <div className="mt-4 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl inline-flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> {selectedPdf.name} ({(selectedPdf.size / 1024 / 1024).toFixed(1)} MB)
                          </div>
                        )}
                      </div>
                      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handlePdfSelect} className="hidden" />
                    </div>

                    {isUploading && (
                      <div className="bg-slate-100 rounded-xl overflow-hidden">
                        <div className="bg-emerald-500 h-2 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        <p className="text-center text-sm text-slate-600 py-2">Upload en cours... {uploadProgress}%</p>
                      </div>
                    )}

                    <button type="submit" disabled={isUploading || !selectedPdf} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <CloudUpload className="w-5 h-5" /> {isUploading ? 'Publication en cours...' : 'Publier le document'}
                    </button>
                  </form>

                  {/* Resources List */}
                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4">Documents publiés ({resources.length})</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {resources.map(r => (
                        <div key={r.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {getTypeIcon(r.type)}
                            <div>
                              <p className="font-medium text-sm">{r.title}</p>
                              <p className="text-xs text-slate-500">{r.type} • {r.subject}</p>
                              <p className="text-xs text-emerald-600">{r.filiereName || 'Filière non définie'}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteResource(r)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SCHEDULE EDIT TAB */}
              {adminTab === 'schedule' && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2"><Edit2 className="text-emerald-500" /> Modifier l'Emploi du Temps</h3>
                    <select value={selectedFiliere} onChange={(e) => setSelectedFiliere(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium">
                      <option value="">Choisir une filière</option>
                      {filieres.map((f) => (<option key={f.id} value={f.id}>{f.name}</option>))}
                    </select>
                    <button onClick={handleSaveSchedule} className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 flex items-center gap-2"><Save className="w-4 h-4" /> Sauvegarder</button>
                  </div>

                  {!selectedFiliere ? (
                    <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="font-semibold">Choisissez d'abord la filière à modifier.</p>
                    </div>
                  ) : (
                  <>

                  <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
                    {DAYS.map(day => (
                      <button key={day} onClick={() => setSelectedDay(day)} className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap ${selectedDay === day ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>{day}</button>
                    ))}
                  </div>

                  <div className="mb-6">
                      <button onClick={() => {
                        setShowAddCourse(!showAddCourse);
                        if (showAddCourse) {
                          setEditingCourseId(null);
                          setCourseSubject('');
                          setCourseProf('');
                          setCourseRoom('Amphi A');
                          setCourseTime('08:30 - 10:30');
                          setCourseType('Cours');
                        }
                      }} className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5" /> {showAddCourse ? 'Annuler' : 'Ajouter un cours'}
                    </button>

                    <AnimatePresence>
                      {showAddCourse && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Matière</label>
                              <select value={courseSubject} onChange={(e) => setCourseSubject(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white">
                                <option value="">Sélectionner</option>
                                {MODULES.map(m => (<option key={m} value={m}>{m}</option>))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Professeur</label>
                              <select value={courseProf} onChange={(e) => setCourseProf(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white">
                                <option value="">Sélectionner</option>
                                {PROFESSORS.map(p => (<option key={p} value={p}>{p}</option>))}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Créneau</label>
                              <select value={courseTime} onChange={(e) => setCourseTime(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white">
                                {TIME_SLOTS.map(t => (<option key={t} value={t}>{t}</option>))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Salle</label>
                              <select value={courseRoom} onChange={(e) => setCourseRoom(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white">
                                {ROOMS.map(r => (<option key={r} value={r}>{r}</option>))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                              <select value={courseType} onChange={(e) => setCourseType(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white">
                                {['Cours', 'TD', 'TP', 'TP (Groupe)'].map(t => (<option key={t} value={t}>{t}</option>))}
                              </select>
                            </div>
                          </div>
                          {editingCourseId ? (
                            <button onClick={handleUpdateCourse} className="w-full bg-blue-600 text-white py-2 rounded-xl font-bold hover:bg-blue-700">Modifier ce cours</button>
                          ) : (
                            <button onClick={handleAddCourse} className="w-full bg-emerald-600 text-white py-2 rounded-xl font-bold hover:bg-emerald-700">Ajouter ce cours</button>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="space-y-3">
                    {editingSchedule.find(d => d.day === selectedDay)?.courses.map(course => (
                      <div key={course.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-bold text-emerald-600">{course.time}</span>
                            <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{course.type}</span>
                          </div>
                          <p className="font-bold text-slate-800">{course.subject}</p>
                          <p className="text-sm text-slate-600">{course.prof} • {course.room}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleStartEditCourse(course)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteCourse(course.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                    {(!editingSchedule.find(d => d.day === selectedDay)?.courses || editingSchedule.find(d => d.day === selectedDay)?.courses.length === 0) && (
                      <p className="text-slate-400 text-center py-8">Aucun cours pour {selectedDay}</p>
                    )}
                  </div>
                  </>
                  )}
                </div>
              )}

              {/* FILIERES TAB */}
              {adminTab === 'filieres' && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2"><School className="text-emerald-500" /> Gérer les Filières</h3>

                  <div className="mb-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="font-bold text-slate-700 mb-3">Ajouter une nouvelle filière</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" value={newFiliereName} onChange={(e) => setNewFiliereName(e.target.value)} placeholder="Nom de la filière" className="px-4 py-3 rounded-xl border border-slate-200" />
                      <input type="text" value={newFiliereCode} onChange={(e) => setNewFiliereCode(e.target.value)} placeholder="Code (ex: TM-FBA)" className="px-4 py-3 rounded-xl border border-slate-200" />
                      <button onClick={handleAddFiliere} className="bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 flex items-center justify-center gap-2"><Plus className="w-5 h-5" /> Ajouter</button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {filieres.map(filiere => (
                      <div key={filiere.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div>
                          <p className="font-bold text-slate-800">{filiere.name}</p>
                          <p className="text-sm text-slate-500">Code: {filiere.code}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setSelectedFiliere(filiere.id); setActiveTab('schedule'); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
                          <button onClick={() => handleDeleteFiliere(filiere.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ANNOUNCEMENTS WITH IMAGE TAB */}
              {adminTab === 'announcements' && (
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2"><Bell className="text-amber-500" /> Publier une annonce avec image</h3>

                  <form onSubmit={handlePublishAnnouncement} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Titre</label>
                      <input type="text" value={newAnnouncementTitle} onChange={(e) => setNewAnnouncementTitle(e.target.value)} placeholder="Ex: Report de cours" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Contenu</label>
                      <textarea value={newAnnouncementContent} onChange={(e) => setNewAnnouncementContent(e.target.value)} placeholder="Détails de l'annonce..." rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Priorité</label>
                      <select value={newAnnouncementPriority} onChange={(e) => setNewAnnouncementPriority(e.target.value as Priority)} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 bg-white">
                        {['Info', 'Important', 'Urgent'].map(p => (<option key={p} value={p}>{p}</option>))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Image (optionnel)</label>
                      <div onClick={() => imageInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-50/50 transition-all">
                        <ImageIcon className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                        <p className="text-slate-600 font-medium">Cliquez pour ajouter une image</p>
                        <p className="text-slate-400 text-sm">JPG, PNG</p>
                        {imagePreview && (
                          <div className="mt-4">
                            <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-xl border border-slate-200" />
                            <button type="button" onClick={(e) => { e.stopPropagation(); setSelectedImage(null); setImagePreview(null); }} className="mt-2 text-red-500 text-sm font-medium flex items-center gap-1 mx-auto"><X className="w-4 h-4" /> Retirer l'image</button>
                          </div>
                        )}
                      </div>
                      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
                    </div>

                    <button type="submit" className="w-full bg-amber-500 text-white py-4 rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center justify-center gap-2">
                      <Bell className="w-5 h-5" /> Publier l'annonce
                    </button>
                  </form>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <h4 className="font-bold text-slate-800 mb-4">Annonces publiées ({announcements.length})</h4>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {announcements.map(ann => (
                        <div key={ann.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{ann.title}</p>
                            <p className="text-xs text-slate-500">{ann.priority} • {ann.date}</p>
                          </div>
                          <button onClick={() => handleDeleteAnnouncement(ann.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 z-40 safe-area-bottom">
        <div className="flex items-center justify-around">
          <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'dashboard' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <TrendingUp className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Accueil</span>
          </button>
          <button onClick={() => { setActiveTab('resources'); setResourceFilter('Tous'); }} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'resources' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <BookMarked className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Ressources</span>
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'schedule' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Calendar className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Emploi</span>
          </button>
          <button onClick={() => setActiveTab('announcements')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'announcements' ? 'text-emerald-600' : 'text-slate-400'}`}>
            <Bell className="w-6 h-6" />
            <span className="text-[10px] font-medium mt-1">Annonces</span>
          </button>
          {isAdmin && (
            <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center p-2 rounded-xl transition-all ${activeTab === 'admin' ? 'text-slate-800' : 'text-slate-400'}`}>
              <Settings className="w-6 h-6" />
              <span className="text-[10px] font-medium mt-1">Admin</span>
            </button>
          )}
        </div>
      </nav>

      {/* Footer - Signature */}
      <footer className="hidden md:block bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm mb-2">
            <span>Ce travail a été fait par</span>
            <motion.span animate={{ scale: [1, 1.05, 1], color: ['#059669', '#0891b2', '#d97706', '#059669'] }} transition={{ duration: 3, repeat: Infinity }} className="font-black text-lg">verratti_vip</motion.span>
          </div>
          <p className="text-slate-300 text-xs">© 2025 EST Meknès</p>
        </div>
      </footer>
    </div>
  );
}
