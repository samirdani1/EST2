import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { scheduleData, days, timeSlots } from '../data/scheduleData';
import { ScheduleSlot } from '../types';

const typeColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
  cours: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', dot: 'bg-blue-500' },
  td: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200', dot: 'bg-orange-500' },
  tp: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200', dot: 'bg-purple-500' },
};



function getCurrentDayName(): string {
  const dayMap: Record<number, string> = {
    1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi'
  };
  return dayMap[new Date().getDay()] || '';
}

function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function isCurrentSlot(slot: ScheduleSlot): boolean {
  return slot.day === getCurrentDayName() &&
    slot.timeStart <= getCurrentTime() && slot.timeEnd >= getCurrentTime();
}

function getSlot(day: string, start: string): ScheduleSlot[] {
  return scheduleData.filter(s => s.day === day && s.timeStart === start);
}

export default function SchedulePage() {
  const [selectedDay, setSelectedDay] = useState(getCurrentDayName() || 'Lundi');
  const [view, setView] = useState<'day' | 'week'>('week');
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const todayName = getCurrentDayName();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-700 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Calendar className="w-7 h-7" />
              <h1 className="text-2xl font-bold">Emploi du Temps</h1>
            </div>
            <p className="text-green-100 text-sm">Filière TM-FBA • Section A • Semestre 2 • 2024-2025</p>
            <p className="text-yellow-200 text-xs mt-1">📅 Date d'effet : 02/02/2026 • Université Moulay Ismaïl - ESTM Meknès</p>
          </div>
          <div className="bg-white/15 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-300" />
              <span className="text-yellow-200 text-sm font-medium">Heure actuelle</span>
            </div>
            <p className="text-white font-bold text-2xl">{currentTime}</p>
            <p className="text-green-200 text-xs">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mt-4">
          {[
            { type: 'cours', label: 'Cours magistral', color: 'bg-blue-400' },
            { type: 'td', label: 'Travaux Dirigés', color: 'bg-orange-400' },
            { type: 'tp', label: 'Travaux Pratiques', color: 'bg-purple-400' },
          ].map(item => (
            <div key={item.type} className="flex items-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
              <span className="text-green-100 text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* View Toggle & Day Selector */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setView('day')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'day' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
              Vue journée
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'week' ? 'bg-white shadow text-gray-800' : 'text-gray-500'}`}
            >
              Vue semaine
            </button>
          </div>

          {view === 'day' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const idx = days.indexOf(selectedDay);
                  if (idx > 0) setSelectedDay(days[idx - 1]);
                }}
                disabled={days.indexOf(selectedDay) === 0}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex gap-1">
                {days.map(day => (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedDay === day
                        ? 'bg-green-600 text-white'
                        : day === todayName
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    {day.slice(0, 3)}
                    {day === todayName && <span className="ml-1">●</span>}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  const idx = days.indexOf(selectedDay);
                  if (idx < days.length - 1) setSelectedDay(days[idx + 1]);
                }}
                disabled={days.indexOf(selectedDay) === days.length - 1}
                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Schedule View */}
      {view === 'week' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="py-3 px-4 text-left text-xs font-semibold text-gray-500 w-28 border-b border-gray-200">Horaire</th>
                  {days.map(day => (
                    <th key={day} className={`py-3 px-2 text-center text-xs font-semibold border-b border-gray-200 ${
                      day === todayName ? 'bg-green-50 text-green-700' : 'text-gray-500'
                    }`}>
                      <div>{day}</div>
                      {day === todayName && (
                        <div className="text-green-500 text-xs font-normal">Aujourd'hui</div>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map((slot, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50/50">
                    <td className="py-3 px-4 text-xs font-medium text-gray-600 align-top">
                      <div className="font-bold">{slot.start}</div>
                      <div className="text-gray-400">{slot.end}</div>
                    </td>
                    {days.map(day => {
                      const slots = getSlot(day, slot.start);
                      return (
                        <td key={day} className={`py-2 px-1 align-top ${day === todayName ? 'bg-green-50/50' : ''}`}>
                          {slots.length === 0 ? (
                            <div className="h-full min-h-[60px]" />
                          ) : (
                            <div className="space-y-1">
                              {slots.map((s, j) => {
                                const colors = typeColors[s.type] || typeColors.cours;
                                const isCurrent = isCurrentSlot(s);
                                return (
                                  <div
                                    key={j}
                                    className={`p-2 rounded-lg border text-xs ${colors.bg} ${colors.border} ${
                                      isCurrent ? 'ring-2 ring-green-400 ring-offset-1' : ''
                                    }`}
                                  >
                                    <div className="flex items-center gap-1 mb-1">
                                      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                      <span className={`font-bold uppercase text-xs ${colors.text}`}>{s.type}</span>
                                      {isCurrent && <span className="ml-auto text-green-500 font-bold text-xs animate-pulse">●</span>}
                                    </div>
                                    <p className={`font-semibold leading-tight ${colors.text}`} style={{ fontSize: '10px' }}>
                                      {s.subject.length > 30 ? s.subject.slice(0, 30) + '...' : s.subject}
                                    </p>
                                    <p className="text-gray-500 mt-0.5" style={{ fontSize: '9px' }}>
                                      {s.teacher}
                                    </p>
                                    {s.room && (
                                      <p className="text-gray-400" style={{ fontSize: '9px' }}>
                                        📍 {s.room}
                                      </p>
                                    )}
                                    {s.groups && s.groups !== 'Tous' && (
                                      <p className="text-gray-500 font-medium" style={{ fontSize: '9px' }}>
                                        👥 {s.groups}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Day View */
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-3 h-3 rounded-full ${selectedDay === todayName ? 'bg-green-500' : 'bg-gray-300'}`} />
            <h2 className="text-xl font-bold text-gray-800">{selectedDay}</h2>
            {selectedDay === todayName && (
              <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full">Aujourd'hui</span>
            )}
          </div>

          {timeSlots.map(slot => {
            const slots = getSlot(selectedDay, slot.start);
            if (slots.length === 0) return (
              <div key={slot.start} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="text-center w-24 shrink-0">
                  <p className="text-sm font-bold text-gray-600">{slot.start}</p>
                  <p className="text-xs text-gray-400">{slot.end}</p>
                </div>
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-gray-300 text-xs">Libre</span>
              </div>
            );
            return slots.map((s, j) => {
              const colors = typeColors[s.type] || typeColors.cours;
              const isCurrent = isCurrentSlot(s);
              return (
                <div
                  key={`${slot.start}-${j}`}
                  className={`bg-white rounded-2xl border-2 p-5 shadow-sm transition-all ${colors.border} ${
                    isCurrent ? 'ring-2 ring-green-400 ring-offset-2 shadow-md' : ''
                  }`}
                >
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="text-center sm:w-28 shrink-0">
                      <div className={`text-lg font-black ${colors.text}`}>{s.timeStart}</div>
                      <div className="text-gray-400 text-sm">à {s.timeEnd}</div>
                      <div className={`mt-2 text-xs font-bold uppercase px-2 py-1 rounded-lg inline-block ${colors.bg} ${colors.text}`}>
                        {s.type}
                      </div>
                      {isCurrent && (
                        <div className="mt-2 flex items-center justify-center gap-1">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <span className="text-green-600 text-xs font-semibold">En cours</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 border-l-4 pl-4 border-gray-100">
                      <h3 className={`font-bold text-gray-800 text-lg ${isCurrent ? 'text-green-800' : ''}`}>{s.subject}</h3>
                      <div className="flex flex-wrap gap-3 mt-2">
                        <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                          <User className="w-4 h-4" />
                          <span>{s.teacher}</span>
                        </div>
                        {s.room && (
                          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <MapPin className="w-4 h-4" />
                            <span>{s.room}</span>
                          </div>
                        )}
                        {s.groups && (
                          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                            <span>👥 {s.groups}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            });
          })}
        </div>
      )}

      {/* Department Info */}
      <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-sm text-green-800">
        <h3 className="font-bold mb-2">📋 Informations sur l'emploi du temps</h3>
        <ul className="space-y-1 text-xs text-green-700">
          <li>• <strong>Département :</strong> Techniques de Management</li>
          <li>• <strong>Filière :</strong> TM-FBA</li>
          <li>• <strong>Section :</strong> A</li>
          <li>• <strong>Semestre :</strong> 2</li>
          <li>• <strong>Année universitaire :</strong> 2024-2025</li>
          <li>• <strong>Date d'effet :</strong> 02/02/2026</li>
          <li>• <strong>Établissement :</strong> École Supérieure de Technologie, Meknès - Université Moulay Ismaïl</li>
        </ul>
      </div>
    </div>
  );
}
