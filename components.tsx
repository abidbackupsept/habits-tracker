
import React from 'react';
import { Bell, X } from 'lucide-react';

export const Modal: React.FC<{ isOpen: boolean, onClose: () => void, children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 border border-zinc-100 dark:border-zinc-800">
        {children}
      </div>
    </div>
  );
};

export const Toast: React.FC<{ messages: { id: string, msg: string }[] }> = ({ messages }) => (
  <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2">
    {messages.map(m => (
      <div key={m.id} className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right duration-300">
        <Bell className="w-4 h-4 text-amber-400 dark:text-amber-600" />
        <span className="text-sm font-medium">{m.msg}</span>
      </div>
    ))}
  </div>
);

export const NavItem = ({ id, icon: Icon, label, activeTab, onClick }: { id: string, icon: any, label: string, activeTab: string, onClick: (id: any) => void }) => {
  const active = activeTab === id;
  return (
    <button 
      onClick={() => onClick(id)}
      className={`flex flex-col md:flex-row items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 ${
        active 
          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 md:w-full' 
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 md:hover:bg-zinc-100 md:dark:hover:bg-zinc-800 md:w-full'
      }`}
    >
      <Icon className={`w-6 h-6 md:w-5 md:h-5 ${active ? 'scale-110' : ''}`} />
      <span className="text-[10px] md:text-sm font-semibold">{label}</span>
    </button>
  );
};