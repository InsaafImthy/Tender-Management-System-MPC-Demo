import { useState } from 'react';
import { IFilterDto } from '../../types/commonTypes';

interface SortModalProp {
    filter: IFilterDto;
    columns: Record<string, string>;
    setFilter: React.Dispatch<React.SetStateAction<IFilterDto>>;
    setIsSortModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SortModal: React.FC<SortModalProp> = ({ columns, setFilter, setIsSortModalOpen, filter }: SortModalProp) => {
    const [sortOptions, setSortOptions] = useState<{ field: string | null; direction: 'ASC' | 'DESC' }>({
        field: filter.sortColumn as string,
        direction: filter.sortDirection as 'ASC' | 'DESC',
    });

    // Handle sort modal submission
    const applySorting = ({ name, order }: { name: string, order: string }) => {
        setFilter(x => ({ ...x, sortColumn: name || "CreatedAt", sortDirection: order as any }));
        setIsSortModalOpen(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-sm">
            <div className="app-surface w-full max-w-sm p-5 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
                <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">Sort</p>
                    <h3 className="mt-1 text-lg font-semibold text-slate-950">Sort By</h3>
                </div>
                <div className="space-y-2">
                    {Object.keys(columns).map((column) => {
                        const isSelected = sortOptions.field === column;
                        //const direction = isSelected ? sortOptions.direction : 'ASC'; // Show current direction for the selected column

                        return (
                            <button
                                key={column}
                                className={`relative w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                                    isSelected
                                        ? 'border-violet-200 bg-violet-50 text-violet-700 shadow-sm'
                                        : 'border-slate-200 bg-white text-slate-700 hover:border-violet-200 hover:bg-violet-50/70 hover:text-violet-700'
                                }`}
                                onClick={() => {
                                    let sortingColumn: { name: string, order: 'ASC' | 'DESC' } = { name: column, order: 'ASC' };
                                    if (sortOptions.field === column) {
                                        sortingColumn.order = sortOptions.direction === 'ASC' ? 'DESC' : 'ASC';
                                        setSortOptions(x => ({ ...x, direction: sortingColumn.order }));
                                    } else {
                                        setSortOptions({ field: column, direction: 'ASC' });
                                    }
                                    applySorting(sortingColumn);
                                }}
                            >
                                <span>{columns[column]}</span> <span className='absolute right-4 text-violet-600'>{isSelected && (sortOptions.direction === 'ASC' ? '↑' : '↓')}</span>
                            </button>
                        );
                    })}
                    <div className="mt-5 flex justify-end">
                        <button
                            className="app-button-secondary min-w-[104px]"
                            onClick={() => setIsSortModalOpen(false)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SortModal;
