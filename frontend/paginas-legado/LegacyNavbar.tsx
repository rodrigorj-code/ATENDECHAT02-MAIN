import React from 'react';

type NavItem = {
  key: string;
  label: string;
  icon?: React.ReactNode;
};

type LegacyNavbarProps = {
  items: NavItem[];
  activeKey: string;
  onChange: (key: string) => void;
  rightAction?: React.ReactNode;
  className?: string;
};

export default function LegacyNavbar({
  items,
  activeKey,
  onChange,
  rightAction,
  className = '',
}: LegacyNavbarProps) {
  return (
    <div className={`w-full bg-white rounded-lg shadow-sm p-2 flex items-center justify-between ${className}`}>
      <div role="tablist" aria-label="Navegação de página" className="flex bg-gray-100 rounded-lg p-1">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          return (
            <button
              key={item.key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(item.key)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm transition-colors ${
                isActive ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.icon ? <span className="text-base">{item.icon}</span> : null}
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
      {rightAction ? <div className="ml-3">{rightAction}</div> : null}
    </div>
  );
}
