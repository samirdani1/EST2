import { useApp } from '../context/AppContext';
import { Bell, Trash2, AlertCircle, Info, AlertTriangle, Clock, User } from 'lucide-react';

const priorityConfig = {
  high: {
    label: '🔴 Urgent',
    bg: 'bg-red-50',
    border: 'border-red-200',
    leftBorder: 'border-l-red-500',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    icon: AlertCircle
  },
  medium: {
    label: '🟡 Important',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    leftBorder: 'border-l-orange-400',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-700',
    icon: AlertTriangle
  },
  low: {
    label: '🔵 Info',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    leftBorder: 'border-l-blue-400',
    text: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-700',
    icon: Info
  },
};

export default function AnnouncementsPage() {
  const { announcements, currentUser, deleteAnnouncement } = useApp();

  const high = announcements.filter(a => a.priority === 'high');
  const medium = announcements.filter(a => a.priority === 'medium');
  const low = announcements.filter(a => a.priority === 'low');

  const renderGroup = (items: typeof announcements, title: string, priority: 'high' | 'medium' | 'low') => {
    if (items.length === 0) return null;
    const cfg = priorityConfig[priority];
    return (
      <div className="space-y-3">
        <h2 className={`text-sm font-bold ${cfg.text} flex items-center gap-2`}>
          <cfg.icon className="w-4 h-4" />
          {title} ({items.length})
        </h2>
        {items.map(ann => (
          <div
            key={ann.id}
            className={`bg-white border-l-4 ${cfg.leftBorder} rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.badge}`}>
                    {priorityConfig[ann.priority].label}
                  </span>
                  <h3 className="font-bold text-gray-800 text-sm">{ann.title}</h3>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                <div className="flex items-center gap-4 mt-3 text-gray-400 text-xs">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{ann.postedByName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ann.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>
                </div>
              </div>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => deleteAnnouncement(ann.id)}
                  className="shrink-0 text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3">
          <Bell className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Annonces</h1>
            <p className="text-orange-100 text-sm">Informations importantes de l'administration ESTM</p>
          </div>
        </div>
        <div className="flex gap-4 mt-4">
          <div className="bg-white/15 rounded-xl px-3 py-2">
            <p className="font-bold">{announcements.filter(a => a.priority === 'high').length}</p>
            <p className="text-orange-100 text-xs">Urgents</p>
          </div>
          <div className="bg-white/15 rounded-xl px-3 py-2">
            <p className="font-bold">{announcements.filter(a => a.priority === 'medium').length}</p>
            <p className="text-orange-100 text-xs">Importants</p>
          </div>
          <div className="bg-white/15 rounded-xl px-3 py-2">
            <p className="font-bold">{announcements.filter(a => a.priority === 'low').length}</p>
            <p className="text-orange-100 text-xs">Infos</p>
          </div>
        </div>
      </div>

      {announcements.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <Bell className="w-16 h-16 mx-auto mb-4 text-gray-200" />
          <p className="text-gray-400 font-medium">Aucune annonce pour l'instant</p>
          <p className="text-gray-400 text-sm mt-1">Revenez plus tard pour les nouvelles de l'administration</p>
        </div>
      ) : (
        <div className="space-y-8">
          {renderGroup(high, 'Annonces urgentes', 'high')}
          {renderGroup(medium, 'Annonces importantes', 'medium')}
          {renderGroup(low, 'Informations', 'low')}
        </div>
      )}
    </div>
  );
}
