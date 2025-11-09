'use client';

import React from 'react';
import Link from 'next/link';

export interface HeaderProps {
  title?: string;
  user?: {
    name: string;
    role: 'member' | 'admin';
  };
}

export const Header = ({ title = 'Sistema de Networking', user }: HeaderProps) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="ml-3 text-xl font-semibold text-gray-900">{title}</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">{user.name}</span>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
