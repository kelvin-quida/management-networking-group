'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SidebarItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

export interface SidebarProps {
  items: SidebarItem[];
}

export const Sidebar = ({ items }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-1">
        {items.map((item) => {
          let isActive = false;
          
          if (pathname === item.href) {
            isActive = true;
          } else if (pathname.startsWith(item.href + '/')) {
            const hasMoreSpecificMatch = items.some(
              (otherItem) => 
                otherItem.href !== item.href && 
                otherItem.href.startsWith(item.href) && 
                pathname.startsWith(otherItem.href)
            );
            isActive = !hasMoreSpecificMatch;
          }
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {item.icon && <span className="w-5 h-5">{item.icon}</span>}
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
