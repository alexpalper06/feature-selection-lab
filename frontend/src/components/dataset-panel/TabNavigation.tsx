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

export default function TabNavigation({tabs, active, onChange}: TabNavigationProps): React.ReactElement {
    return (
        <div
            role="tablist"
            className="flex items-center gap-1 p-1 rounded-xl bg-code-bg border border-border-main overflow-x-auto scrollbar-none w-full"
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
                            'flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap',
                            'transition-all duration-200 outline-none cursor-pointer',
                            'focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1',
                            isActive
                                ? 'bg-surface text-text-h shadow-sm border border-border-main'
                                : 'text-text-main/60 hover:text-text-main hover:bg-surface/50',
                        ].join(' ')}
                    >
                        {Icon && (
                            <Icon
                                className={[
                                    'w-4 h-4 flex-shrink-0 transition-colors duration-200',
                                    isActive ? 'text-accent' : 'text-text-main/50',
                                ].join(' ')}
                            />
                        )}
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}