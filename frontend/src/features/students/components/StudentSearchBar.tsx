'use client';

import React, { useEffect, useState } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

interface StudentSearchBarProps {
  value?: string;
  onSearchChange: (search: string) => void;
  debounceMs?: number;
  placeholder?: string;
  isLoading?: boolean;
}

export const StudentSearchBar: React.FC<StudentSearchBarProps> = ({
  value = '',
  onSearchChange,
  debounceMs = 300,
  placeholder = 'Buscar por número de matrícula, nombre completo o correo...',
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value !== prevValue) {
    setPrevValue(value);
    setSearchTerm(value);
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearchChange(searchTerm);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, debounceMs, onSearchChange]);

  const handleClear = () => {
    setSearchTerm('');
    onSearchChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className="relative w-full">
      {/* Icono de búsqueda */}
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-5 h-5 text-slate-400" />
      </div>

      {/* Input interactivo */}
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full pl-11 pr-10 py-2.5 text-sm font-medium rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-all"
      />

      {/* Indicador de carga o botón de limpiar */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {isLoading ? (
          <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
        ) : searchTerm ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            title="Limpiar búsqueda (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
};
