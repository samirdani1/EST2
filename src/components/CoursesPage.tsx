import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Search, Filter, Heart, Download, Trash2, FileText, Clock, User } from 'lucide-react';

const subjects = [
  'Tous',
  'Droit commercial et des affaires',
  'Statistiques descriptives',
  'Environnement bancaire et financier',
  'Communication commerciale',
  'Démarche marketing',
  "Travaux d'inventaire",
  'Culture digitale',
  'Autre',
];

const typeColors = {
  cours: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  td: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  tp: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
};

const typeIcons = {
  cours: '📚',
  td: '📝',
  tp: '🔬',
};

export default function CoursesPage() {
  const { courses, currentUser, deleteCourse, likeCourse } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'cours' | 'td' | 'tp'>('all');
  const [filterSubject, setFilterSubject] = useState('Tous');

  const filtered = courses.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) ||
                       c.subject.toLowerCase().includes(search.toLowerCase()) ||
                       c.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || c.type === filterType;
    const matchSubject = filterSubject === 'Tous' || c.subject === filterSubject;
    return matchSearch && matchType && matchSubject;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Cours & Ressources</h1>
            <p className="text-blue-100 text-sm">Tous les cours, TD et TP de la filière TM-FBA</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          {['cours', 'td', 'tp'].map(type => (
            <div key={type} className="bg-white/15 rounded-xl px-3 py-2 text-center">
              <p className="font-bold text-lg">{courses.filter(c => c.type === type).length}</p>
              <p className="text-blue-100 text-xs capitalize">{type === 'cours' ? 'Cours' : type === 'td' ? 'TD' : 'TP'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un cours, TD, TP..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Type Filter */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
            {(['all', 'cours', 'td', 'tp'] as const).map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterType === t
                    ? 'bg-white shadow text-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t === 'all' ? 'Tous' : t.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <select
            value={filterSubject}
            onChange={e => setFilterSubject(e.target.value)}
            className="flex-1 min-w-[200px] border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Filter className="w-4 h-4" />
        <span>{filtered.length} ressource{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Course Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 font-medium">Aucune ressource trouvée</p>
          <p className="text-gray-400 text-sm mt-1">Modifiez vos filtres ou attendez que l'admin publie du contenu</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(course => (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 hover:shadow-md transition-all flex flex-col"
            >
              {/* Card Header */}
              <div className={`p-4 rounded-t-2xl ${typeColors[course.type].bg}`}>
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{typeIcons[course.type]}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${typeColors[course.type].bg} ${typeColors[course.type].text} border ${typeColors[course.type].border}`}>
                    {course.type.toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-gray-800 mt-2 text-sm line-clamp-2">{course.title}</h3>
                <p className={`text-xs font-medium mt-1 ${typeColors[course.type].text}`}>{course.subject}</p>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-gray-500 text-xs line-clamp-3 flex-1">{course.description}</p>

                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
                    <User className="w-3 h-3" />
                    <span>{course.uploadedByName}</span>
                    <Clock className="w-3 h-3 ml-auto" />
                    <span>{new Date(course.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => likeCourse(course.id)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <Heart className="w-4 h-4" />
                      <span>{course.likes}</span>
                    </button>

                    <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-500 transition-colors ml-2">
                      <Download className="w-4 h-4" />
                      <span>{course.downloads}</span>
                    </button>

                    {course.fileUrl && (
                      <a
                        href={course.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-auto flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FileText className="w-3 h-3" />
                        Voir
                      </a>
                    )}

                    {currentUser?.role === 'admin' && (
                      <button
                        onClick={() => deleteCourse(course.id)}
                        className="ml-auto flex items-center gap-1 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Suppr.
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
