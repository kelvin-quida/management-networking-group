'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface NavItem {
  label: string;
  href: string;
}

export interface NavigationProps {
  items: NavItem[];
}

export const Navigation = ({ items }: NavigationProps) => {
  const pathname = usePathname();

  return (
    <nav className="flex gap-6">
      {items.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              text-sm font-medium transition-colors
              ${isActive 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
