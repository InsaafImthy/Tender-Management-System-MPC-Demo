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
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-5 rounded shadow-lg">
                <h3 className="text-lg font-semibold mb-3 text-gray-600">Sort By</h3>
                <div className="space-y-3">
                    {Object.keys(columns).map((column) => {
                        const isSelected = sortOptions.field === column;
                        //const direction = isSelected ? sortOptions.direction : 'ASC'; // Show current direction for the selected column

                        return (
                            <button
                                key={column}
                                className={`w-full relative px-4 py-2 text-left border-b hover:bg-blue-100 text-sm ${isSelected ? 'bg-blue-200' : ''}`}
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
                                <span>{columns[column]}</span> <span className='absolute right-2'>{isSelected && (sortOptions.direction === 'ASC' ? '↑' : '↓')}</span>
                            </button>
                        );
                    })}
                    <div className="mt-4">
                        <button
                            className="px-4 py-2 bg-gray-300 rounded text-sm"
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
