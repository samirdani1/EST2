import { useApp } from '../context/AppContext';
import { BookOpen, Bell, Calendar, TrendingUp, Users, Clock, GraduationCap, Star } from 'lucide-react';
import { getTodaySchedule, getCurrentSlot } from '../data/scheduleData';

interface HomePageProps {
  setActiveTab: (tab: string) => void;
}

const typeColors = {
  cours: 'bg-blue-100 text-blue-700',
  td: 'bg-orange-100 text-orange-700',
  tp: 'bg-purple-100 text-purple-700',
};

const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

export default function HomePage({ setActiveTab }: HomePageProps) {
  const { courses, announcements, users } = useApp();
  const todaySlots = getTodaySchedule();
  const currentSlot = getCurrentSlot();

  const now = new Date();
  const dateStr = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const recentCourses = courses.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-green-700 via-teal-700 to-green-800 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-teal-400/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                <img src="/images/est-logo.png" alt="EST" className="w-11 h-11 object-contain" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg md:text-xl">ESTM - Meknès</h1>
                <p className="text-green-200 text-sm">Université Moulay Ismaïl</p>
              </div>
            </div>
            <h2 className="text-white text-2xl md:text-3xl font-extrabold leading-tight">
              Plateforme de Partage<br />
              <span className="text-yellow-300">TM-FBA Section A</span>
            </h2>
            <p className="text-green-200 text-sm mt-2">Année universitaire 2024-2025 • Semestre 2</p>
          </div>

          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 text-center min-w-[180px]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-300" />
              <span className="text-yellow-300 font-bold text-lg">{timeStr}</span>
            </div>
            <p className="text-white font-medium text-sm">{dateStr}</p>
            {currentSlot ? (
              <div className="mt-2 bg-yellow-400/20 rounded-xl p-2">
                <p className="text-yellow-200 text-xs font-semibold">🔴 En cours :</p>
                <p className="text-white text-xs mt-0.5">{currentSlot.subject}</p>
                <p className="text-green-200 text-xs">{currentSlot.teacher}</p>
              </div>
            ) : (
              <div className="mt-2 bg-white/10 rounded-xl p-2">
                <p className="text-green-200 text-xs">Pas de cours en ce moment</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Cours disponibles', value: courses.filter(c => c.type === 'cours').length, icon: BookOpen, color: 'blue' },
          { label: 'TD disponibles', value: courses.filter(c => c.type === 'td').length, icon: TrendingUp, color: 'orange' },
          { label: 'TP disponibles', value: courses.filter(c => c.type === 'tp').length, icon: Star, color: 'purple' },
          { label: 'Étudiants inscrits', value: users.filter(u => u.role === 'student').length, icon: Users, color: 'green' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
              stat.color === 'blue' ? 'bg-blue-100' :
              stat.color === 'orange' ? 'bg-orange-100' :
              stat.color === 'purple' ? 'bg-purple-100' :
              'bg-green-100'
            }`}>
              <stat.icon className={`w-5 h-5 ${
                stat.color === 'blue' ? 'text-blue-600' :
                stat.color === 'orange' ? 'text-orange-600' :
                stat.color === 'purple' ? 'text-purple-600' :
                'text-green-600'
              }`} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-800">Cours d'aujourd'hui</h3>
            </div>
            <button
              onClick={() => setActiveTab('schedule')}
              className="text-green-600 text-xs font-medium hover:underline"
            >
              Voir tout →
            </button>
          </div>

          {todaySlots.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Pas de cours aujourd'hui 🎉</p>
              <p className="text-xs mt-1">Profitez de votre journée libre !</p>
            </div>
          ) : (
            <div className="space-y-2">
              {todaySlots.map((slot, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border transition-all ${
                    currentSlot === slot
                      ? 'border-green-400 bg-green-50'
                      : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{slot.subject}</p>
                      <p className="text-gray-500 text-xs">{slot.teacher} • {slot.room}</p>
                      {slot.groups && slot.groups !== 'Tous' && (
                        <p className="text-green-600 text-xs font-medium">{slot.groups}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-bold text-gray-700">{slot.timeStart}</p>
                      <p className="text-xs text-gray-400">{slot.timeEnd}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${typeColors[slot.type as keyof typeof typeColors]}`}>
                        {slot.type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {currentSlot === slot && (
                    <div className="mt-2 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
                      <span className="text-green-600 text-xs font-medium">En cours maintenant</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Latest Announcements */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-800">Dernières Annonces</h3>
            </div>
            <button
              onClick={() => setActiveTab('announcements')}
              className="text-green-600 text-xs font-medium hover:underline"
            >
              Voir tout →
            </button>
          </div>
          {announcements.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucune annonce pour l'instant</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.slice(0, 3).map(ann => (
                <div key={ann.id} className={`p-3 rounded-xl border-l-4 ${
                  ann.priority === 'high' ? 'border-red-400 bg-red-50' :
                  ann.priority === 'medium' ? 'border-orange-400 bg-orange-50' :
                  'border-blue-400 bg-blue-50'
                }`}>
                  <h4 className="font-semibold text-gray-800 text-sm">{ann.title}</h4>
                  <p className="text-gray-600 text-xs mt-1 line-clamp-2">{ann.content}</p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(ann.createdAt).toLocaleDateString('fr-FR')} • {ann.postedByName}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Courses */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-800">Ressources récentes</h3>
          </div>
          <button
            onClick={() => setActiveTab('courses')}
            className="text-green-600 text-xs font-medium hover:underline"
          >
            Voir tout →
          </button>
        </div>
        {recentCourses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">Aucune ressource disponible</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentCourses.map(course => (
              <div key={course.id} className="border border-gray-100 rounded-xl p-3 hover:border-green-200 hover:bg-green-50/50 transition-all">
                <div className="flex items-start gap-2">
                  <div className={`px-2 py-1 rounded-lg text-xs font-bold ${typeColors[course.type]}`}>
                    {course.type.toUpperCase()}
                  </div>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm mt-2 line-clamp-2">{course.title}</h4>
                <p className="text-gray-500 text-xs mt-1">{course.subject}</p>
                <div className="flex items-center gap-3 mt-2 text-gray-400 text-xs">
                  <span>❤️ {course.likes}</span>
                  <span>📥 {course.downloads}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-teal-50 to-green-50 border border-teal-100 rounded-2xl p-5">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-teal-600 shrink-0" />
          <div>
            <h3 className="font-bold text-teal-800 text-sm">À propos de cette plateforme</h3>
            <p className="text-teal-600 text-xs mt-1">
              Partagez et téléchargez des cours, TD et TP avec vos camarades de la filière TM-FBA, Section A. 
              Seuls les étudiants avec un email <span className="font-mono font-bold">@edu.umi.ac.ma</span> peuvent accéder à la plateforme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
