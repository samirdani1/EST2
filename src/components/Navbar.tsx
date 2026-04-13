import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BookOpen, Calendar, Bell, Home, LogOut, Menu, X, Shield, Users } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const { currentUser, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'courses', label: 'Cours & Ressources', icon: BookOpen },
    { id: 'schedule', label: 'Emploi du temps', icon: Calendar },
    { id: 'announcements', label: 'Annonces', icon: Bell },
    ...(currentUser?.role === 'admin' ? [
      { id: 'admin', label: 'Admin Panel', icon: Shield },
    ] : []),
  ];

  return (
    <nav className="bg-gradient-to-r from-green-800 to-teal-700 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-md shrink-0">
              <img src="/images/est-logo.png" alt="EST" className="w-8 h-8 object-contain" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">ESTM - TM-FBA</p>
              <p className="text-green-200 text-xs">Section A | S2 2024-2025</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-green-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>

          {/* User & Actions */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-white/10 rounded-xl px-3 py-1.5">
              <div className="w-7 h-7 bg-green-300 rounded-full flex items-center justify-center">
                {currentUser?.role === 'admin' 
                  ? <Shield className="w-4 h-4 text-green-800" />
                  : <Users className="w-4 h-4 text-green-800" />
                }
              </div>
              <div>
                <p className="text-white text-xs font-semibold leading-tight">{currentUser?.name?.split(' ')[0]}</p>
                <p className="text-green-200 text-xs capitalize">{currentUser?.role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white px-3 py-2 rounded-xl text-xs font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              Déconnexion
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden text-white p-2 rounded-xl hover:bg-white/10"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="lg:hidden pb-4 space-y-1 border-t border-white/10 pt-3">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  activeTab === item.id
                    ? 'bg-white/20 text-white'
                    : 'text-green-100 hover:bg-white/10'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between px-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-green-300 rounded-full flex items-center justify-center">
                  {currentUser?.role === 'admin' 
                    ? <Shield className="w-4 h-4 text-green-800" />
                    : <Users className="w-4 h-4 text-green-800" />
                  }
                </div>
                <div>
                  <p className="text-white text-xs font-semibold">{currentUser?.name}</p>
                  <p className="text-green-200 text-xs">{currentUser?.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-200 px-3 py-1.5 rounded-xl text-xs font-medium"
              >
                <LogOut className="w-3 h-3" />
                Déconnexion
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
