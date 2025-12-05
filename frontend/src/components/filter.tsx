import { useState } from 'react';
import { filterGroups as initialGroups } from '../mocks/filters';
import type { FilterGroup } from '../mocks/filters';

type Props = {
    onChange?: (groups: FilterGroup[]) => void;
};

export default function Filter({ onChange }: Props) {
    const [groups, setGroups] = useState<FilterGroup[]>(() => {
        return initialGroups.map(g => ({ ...g, items: g.items.map(i => ({ ...i })) }));
    });

    const toggle = (groupId: string, itemId: string) => {
        const next = groups.map(g => {
            if (g.id !== groupId) return g;
            return {
                ...g,
                items: g.items.map(i => (i.id === itemId ? { ...i, checked: !i.checked } : i)),
            };
        });
        setGroups(next);
        onChange && onChange(next);
    };

    return (
        <div className="filters bg-gray-50 rounded p-2">
            {groups.map((g, idx) => (
                <fieldset
                    key={g.id}
                    className={`filter-group px-2 py-3 ${idx < groups.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                    <legend className="text-sm font-semibold text-gray-700 mb-2">{g.title}</legend>
                    <div className="flex flex-wrap gap-2">
                        {g.items.map(i => (
                            <label
                                key={i.id}
                                className="inline-flex items-center gap-2 py-1 px-2 text-sm text-gray-800 rounded hover:bg-gray-100"
                                style={{ cursor: 'pointer', minWidth: 120 }}
                            >
                                <input
                                    type="checkbox"
                                    checked={!!i.checked}
                                    onChange={() => toggle(g.id, i.id)}
                                    className="h-4 w-4 text-indigo-600 rounded"
                                />
                                <span className="truncate">{i.name}</span>
                            </label>
                        ))}
                    </div>
                </fieldset>
            ))}
        </div>
    );
}
