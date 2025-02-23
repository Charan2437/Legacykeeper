import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  CreditCard,
  FileDown,
  FileText,
  Shield,
  Heart,
  Users,
  Smartphone,
  Building2,
  LogOut,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

function SidebarLink({ to, icon, children }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-indigo-50 text-indigo-600'
            : 'text-gray-700 hover:bg-gray-50'
        }`
      }
    >
      {icon}
      <span className="text-sm font-medium">{children}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/signin';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-indigo-600" />
          <span className="text-xl font-bold text-gray-900">Trustee Hub</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <SidebarLink to="/dashboard" icon={<LayoutDashboard size={20} />}>
          Dashboard
        </SidebarLink>
        <SidebarLink to="/transactions" icon={<Receipt size={20} />}>
          Transactions
        </SidebarLink>
        <SidebarLink to="/debits" icon={<CreditCard size={20} />}>
          Debits and credits
        </SidebarLink>
        <SidebarLink to="/deposits" icon={<FileDown size={20} />}>
          Deposits and investments
        </SidebarLink>
        <SidebarLink to="/documents" icon={<FileText size={20} />}>
          Documents Store
        </SidebarLink>
        <SidebarLink to="/insurance" icon={<Shield size={20} />}>
          Insurance
        </SidebarLink>
        <SidebarLink to="/health" icon={<Heart size={20} />}>
          Health Records
        </SidebarLink>
        <SidebarLink to="/family" icon={<Users size={20} />}>
          Family Wills
        </SidebarLink>
        <SidebarLink to="/digital" icon={<Smartphone size={20} />}>
          Digital Assets and Subscriptions
        </SidebarLink>
        <SidebarLink to="/business" icon={<Building2 size={20} />}>
          Business Plans
        </SidebarLink>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-2 w-full rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}