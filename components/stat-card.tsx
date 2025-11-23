'use client';

import { RadioTower, Users, CheckCircle, AlertTriangle, Wrench, HelpCircle, Building, LucideIcon } from 'lucide-react';
import Link from 'next/link';

const iconMap: Record<string, LucideIcon> = {
  Users,
  RadioTower,
  CheckCircle,
  AlertTriangle,
  Wrench,
  HelpCircle,
  Building,
};

interface StatCardProps {
  title: string;
  value: string;
  iconName: string;
  color: string;
  href?: string;
}

export default function StatCard({ title, value, iconName, color, href }: StatCardProps) {
  const Icon = iconMap[iconName];
  
  const content = (
    <div className={`flex items-center rounded-lg bg-white p-5 shadow ${href ? 'cursor-pointer transition-transform hover:scale-105 hover:shadow-lg' : ''}`}>
      <div className={`mr-4 rounded-full p-3 ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}