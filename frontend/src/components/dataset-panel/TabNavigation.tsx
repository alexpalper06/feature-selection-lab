import React from 'react';

interface Tab {
  id: string;
  label: string;
}

interface TabNavigationProps {
  tabs: Tab[];
  active: string;
  onChange: (tabId: string) => void;
}

export default function TabNavigation({ tabs, active, onChange }: TabNavigationProps): React.ReactElement {
  return (
    <div className="flex gap-6 border-b border-border-main overflow-x-auto w-full">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            'pb-3 pt-1 px-1 font-medium text-sm whitespace-nowrap border-b-2 transition-all -mb-px outline-none',
            active === tab.id
              ? 'border-accent text-accent'
              : 'border-transparent text-text-main/60 hover:text-text-main hover:border-border-main'
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}