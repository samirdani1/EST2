import { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Shield, PlusCircle, BookOpen, Bell, Users, Trash2,
  AlertCircle, CheckCircle
} from 'lucide-react';

const subjects = [
  'Droit commercial et des affaires',
  'Statistiques descriptives',
  'Environnement bancaire et financier',
  'Communication commerciale',
  'Démarche marketing',
  "Travaux d'inventaire",
  'Culture digitale',
  'Autre',
];

export default function AdminPage() {
  const { currentUser, courses, announcements, users, addCourse, deleteCourse, addAnnouncement, deleteAnnouncement } = useApp();
  const [activeSection, setActiveSection] = useState<'courses' | 'announcements' | 'users'>('courses');

  // Course form
  const [courseForm, setCourseForm] = useState({
    title: '', subject: subjects[0], type: 'cours' as 'cours' | 'td' | 'tp',
    description: '', fileUrl: '', fileName: ''
  });
  const [courseMsg, setCourseMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  // Announcement form
  const [annForm, setAnnForm] = useState({
    title: '', content: '', priority: 'medium' as 'low' | 'medium' | 'high'
  });
  const [annMsg, setAnnMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center">
        <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
        <h2 className="text-xl font-bold text-red-600">Accès refusé</h2>
        <p className="text-red-400 text-sm mt-2">Vous devez être administrateur pour accéder à cette page.</p>
      </div>
    );
  }

  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.description) {
      setCourseMsg({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' });
      return;
    }
    addCourse({
      ...courseForm,
      uploadedBy: currentUser.id,
      uploadedByName: currentUser.name
    });
    setCourseForm({ title: '', subject: subjects[0], type: 'cours', description: '', fileUrl: '', fileName: '' });
    setCourseMsg({ type: 'success', text: 'Cours publié avec succès !' });
    setTimeout(() => setCourseMsg(null), 3000);
  };

  const handleAddAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) {
      setAnnMsg({ type: 'error', text: 'Veuillez remplir tous les champs' });
      return;
    }
    addAnnouncement({
      ...annForm,
      postedBy: currentUser.id,
      postedByName: currentUser.name
    });
    setAnnForm({ title: '', content: '', priority: 'medium' });
    setAnnMsg({ type: 'success', text: 'Annonce publiée avec succès !' });
    setTimeout(() => setAnnMsg(null), 3000);
  };

  const sectionItems = [
    { id: 'courses', label: 'Gérer les cours', icon: BookOpen, count: courses.length },
    { id: 'announcements', label: 'Gérer les annonces', icon: Bell, count: announcements.length },
    { id: 'users', label: 'Étudiants inscrits', icon: Users, count: users.filter(u => u.role === 'student').length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-gray-800" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Panel Administrateur</h1>
            <p className="text-gray-300 text-sm">Gérez les ressources et annonces de la plateforme ESTM TM-FBA</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          {sectionItems.map(item => (
            <div key={item.id} className="bg-white/10 rounded-xl px-4 py-2">
              <p className="font-bold text-xl">{item.count}</p>
              <p className="text-gray-300 text-xs">{item.label.split(' ').slice(-1)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 bg-gray-100 rounded-2xl p-1">
        {sectionItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id as typeof activeSection)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
              activeSection === item.id
                ? 'bg-white shadow text-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{item.label}</span>
            <span className="sm:hidden">{item.label.split(' ').slice(-1)}</span>
            <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded-full font-bold">
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* COURSES SECTION */}
      {activeSection === 'courses' && (
        <div className="space-y-6">
          {/* Add Course Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-green-600" />
              Publier un nouveau cours / TD / TP
            </h2>

            {courseMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${
                courseMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {courseMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {courseMsg.text}
              </div>
            )}

            <form onSubmit={handleAddCourse} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={courseForm.title}
                    onChange={e => setCourseForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Ex: Cours introduction au droit..."
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Matière *</label>
                  <select
                    value={courseForm.subject}
                    onChange={e => setCourseForm(p => ({ ...p, subject: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                  <div className="flex gap-2">
                    {(['cours', 'td', 'tp'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setCourseForm(p => ({ ...p, type: t }))}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                          courseForm.type === t
                            ? t === 'cours' ? 'bg-blue-600 text-white border-blue-600'
                              : t === 'td' ? 'bg-orange-500 text-white border-orange-500'
                              : 'bg-purple-600 text-white border-purple-600'
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Lien du fichier (URL)</label>
                  <input
                    type="url"
                    value={courseForm.fileUrl}
                    onChange={e => setCourseForm(p => ({ ...p, fileUrl: e.target.value }))}
                    placeholder="https://drive.google.com/..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={courseForm.description}
                  onChange={e => setCourseForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="Décrivez le contenu du cours..."
                  rows={3}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Publier la ressource
              </button>
            </form>
          </div>

          {/* Course List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Toutes les ressources ({courses.length})
            </h2>
            {courses.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Aucune ressource publiée</p>
            ) : (
              <div className="space-y-2">
                {courses.map(course => (
                  <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 ${
                      course.type === 'cours' ? 'bg-blue-100 text-blue-700' :
                      course.type === 'td' ? 'bg-orange-100 text-orange-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {course.type.toUpperCase()}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{course.title}</p>
                      <p className="text-gray-400 text-xs truncate">{course.subject}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
                      <span>❤️ {course.likes}</span>
                      <span>📥 {course.downloads}</span>
                    </div>
                    <button
                      onClick={() => deleteCourse(course.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ANNOUNCEMENTS SECTION */}
      {activeSection === 'announcements' && (
        <div className="space-y-6">
          {/* Add Announcement Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-orange-500" />
              Publier une nouvelle annonce
            </h2>

            {annMsg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${
                annMsg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {annMsg.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                {annMsg.text}
              </div>
            )}

            <form onSubmit={handleAddAnnouncement} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={annForm.title}
                    onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))}
                    placeholder="Titre de l'annonce"
                    required
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <div className="flex gap-2">
                    {([
                      { val: 'high', label: 'Urgent', color: 'bg-red-500' },
                      { val: 'medium', label: 'Important', color: 'bg-orange-400' },
                      { val: 'low', label: 'Info', color: 'bg-blue-500' }
                    ] as const).map(p => (
                      <button
                        key={p.val}
                        type="button"
                        onClick={() => setAnnForm(prev => ({ ...prev, priority: p.val }))}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all border ${
                          annForm.priority === p.val
                            ? `${p.color} text-white border-transparent`
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu *</label>
                <textarea
                  value={annForm.content}
                  onChange={e => setAnnForm(p => ({ ...p, content: e.target.value }))}
                  placeholder="Rédigez votre annonce ici..."
                  rows={4}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" />
                Publier l'annonce
              </button>
            </form>
          </div>

          {/* Announcements List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Toutes les annonces ({announcements.length})
            </h2>
            {announcements.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-6">Aucune annonce publiée</p>
            ) : (
              <div className="space-y-2">
                {announcements.map(ann => (
                  <div key={ann.id} className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg shrink-0 mt-0.5 ${
                      ann.priority === 'high' ? 'bg-red-100 text-red-700' :
                      ann.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {ann.priority === 'high' ? 'URGENT' : ann.priority === 'medium' ? 'IMPORT.' : 'INFO'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">{ann.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{ann.content}</p>
                      <p className="text-gray-300 text-xs mt-1">{new Date(ann.createdAt).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <button
                      onClick={() => deleteAnnouncement(ann.id)}
                      className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* USERS SECTION */}
      {activeSection === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Étudiants inscrits ({users.filter(u => u.role === 'student').length})
          </h2>

          {users.filter(u => u.role === 'student').length === 0 ? (
            <div className="text-center py-10">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-200" />
              <p className="text-gray-400 text-sm">Aucun étudiant inscrit pour l'instant</p>
            </div>
          ) : (
            <div className="space-y-2">
              {users.filter(u => u.role === 'student').map((user) => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-sm shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm truncate">{user.name}</p>
                    <p className="text-gray-400 text-xs truncate">{user.email}</p>
                  </div>
                  <div className="text-gray-400 text-xs shrink-0">
                    {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                  <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium shrink-0">
                    Étudiant
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Admin list */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-600 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-yellow-600" />
              Administrateurs
            </h3>
            {users.filter(u => u.role === 'admin').map(user => (
              <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                <div className="w-8 h-8 bg-yellow-200 rounded-full flex items-center justify-center">
                  <Shield className="w-4 h-4 text-yellow-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </div>
                <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full font-bold">ADMIN</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
