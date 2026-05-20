// src/components/ui/TabNavigation.tsx
import React from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabNavigationProps {
  tabs: Tab[];
  active: string;
  onChange: (tabId: string) => void;
}

export default function TabNavigation({ tabs, active, onChange }: TabNavigationProps): React.ReactElement {
  return (
    <div
      role="tablist"
      // Added justify-center to center the tabs and gap-8 for balanced spacing
      className="flex justify-center gap-8 border-b border-border-main overflow-x-auto w-full scrollbar-none"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.id;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={[
              // Increased horizontal padding (px-4) for a better touch/click target area
              'pb-3 pt-2 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-all -mb-px outline-none flex items-center gap-2 cursor-pointer',
              isActive
                ? 'border-accent text-accent'
                : 'border-transparent text-text-main/60 hover:text-text-main hover:border-border-main'
            ].join(' ')}
          >
            {Icon && <Icon className="w-4.5 h-4.5 flex-shrink-0" />}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}