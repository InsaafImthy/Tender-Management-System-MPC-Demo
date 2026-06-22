import React, { useEffect, useRef, useState } from "react";
import { FilterIcon, MagnifyingGlass, SortIcon } from "../../../utils/Icons";
import { IFilterDto } from "../../../types/commonTypes";
import { EllipsisVerticalIcon } from "lucide-react";
import DropdownMenu from "../../basic_components/DropdownMenu";

interface TableColumn {
    key: string;
    label: string;
    render?: (value: any) => React.ReactNode;
}

interface IDot {
    setEditOption?: (data: any) => void;
    setBlockOption?: (data: any) => void;
    setDeleteOption?: (data: any) => void;
}

interface TableProps extends Partial<IDot> {
    title: string;
    columns: TableColumn[];
    data: any[];
    onRowClick?: (item: any) => void;
    statusColumn?: string;
    filter?: IFilterDto;
    dots?: boolean;
    setIsFilterModalOpen?: (open: boolean) => void;
    setIsSortModalOpen?: (open: boolean) => void;
    setSearchQuery?: (query: string) => void;
    setFilter: React.Dispatch<React.SetStateAction<IFilterDto>>;
    totalCount?: number;
}

// const DropdownMenu: React.FC<{
//     position: { top: number; left: number };
//     data: any;
//     setOpenDropdown: (index: number | null) => void;
// } & IDot> = ({ position, data, setOpenDropdown, setEditOption, setBlockOption, setDeleteOption }) => {
//     const dropdownRef = useRef<HTMLDivElement>(null);

//     useEffect(() => {
//         const handleClickOutside = (event: MouseEvent) => {
//             if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//                 setOpenDropdown(null);
//             }
//         };
//         document.addEventListener("mousedown", handleClickOutside);
//         return () => {
//             document.removeEventListener("mousedown", handleClickOutside);
//         };
//     }, []);

//     return (
//         <div
//             ref={dropdownRef}
//             className="absolute bg-white border shadow-md rounded w-32"
//             style={{ top: position.top, left: position.left }}
//         >
//             {setEditOption && (
//                 <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => setEditOption(data)}>
//                     Edit
//                 </button>
//             )}
//             {setBlockOption && (
//                 <button className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm" onClick={() => setBlockOption(data)}>
//                     {data.isActive?"Block":"Unblock"}
//                 </button>
//             )}
//             {setDeleteOption && (
//                 <button className="w-full text-left px-4 py-2 hover:bg-red-100 text-sm text-red-600" onClick={() => setDeleteOption(data)}>
//                     Delete
//                 </button>
//             )}
//         </div>
//     );
// };

const getStatusBadge = (status: string) => {
    let statusClasses = "inline-flex items-center justify-center px-3 py-1.5 text-xs border rounded-full font-semibold";

    switch (status.toLowerCase()) {
        case "active":
            statusClasses += " bg-emerald-50 text-emerald-700 border-emerald-200";
            break;
        case "inactive":
            statusClasses += " bg-rose-50 text-rose-700 border-rose-200";
            break;
        case "pending":
            statusClasses += " bg-amber-50 text-amber-700 border-amber-200";
            break;
        default:
            statusClasses += " bg-slate-50 text-slate-700 border-slate-200";
    }

    return <div className={statusClasses}>{status}</div>;
};

const SettingsTable: React.FC<TableProps> = ({
    title,
    columns,
    data,
    dots = false,
    onRowClick,
    // statusColumn,
    filter,
    setIsFilterModalOpen,
    setIsSortModalOpen,
    setSearchQuery,
    // setFilter,
    totalCount,
    setEditOption,
    setBlockOption,
    setDeleteOption,
}) => {
    // const currentPage = filter.pageNo ?? 1;
    const pageSize = filter?.pageSize ?? 10;
    // const [pages, setPages] = useState<number[]>([]);
    const tableContainerRef = useRef<HTMLDivElement>(null);
    console.log(data, columns, "hiiidsf");
    useEffect(() => {
        // if (totalCount ?? 0 > 0) {
        //     const pagesNeeded = Math.ceil(totalCount ?? 0 / pageSize);
        //     setPages(Array.from({ length: pagesNeeded }, (_, i) => i + 1));
        // } else {
        //     setPages([]);
        // }
    }, [totalCount, pageSize]);

    const [openDropdown, setOpenDropdown] = useState<number | null>(null);
    const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

    useEffect(() => {
        const handleScroll = () => {
            if (openDropdown !== null) {
                setOpenDropdown(null);
            }
        };

        const tableContainer = tableContainerRef.current;
        if (tableContainer) {
            tableContainer.addEventListener('scroll', handleScroll);
        }
        window.addEventListener('scroll', handleScroll);

        return () => {
            if (tableContainer) {
                tableContainer.removeEventListener('scroll', handleScroll);
            }
            window.removeEventListener('scroll', handleScroll);
        };
    }, [openDropdown]);

    const toggleDropdown = (index: number, event: React.MouseEvent) => {
        event.stopPropagation();

        if (openDropdown === index) {
            setOpenDropdown(null);
        } else {
            const buttonRect = event.currentTarget.getBoundingClientRect();
            const containerRect = tableContainerRef.current?.getBoundingClientRect();

            if (containerRect) {
                // Calculate if this is one of the last items in the table
                const isNearBottom = buttonRect.bottom > containerRect.bottom - 50; // 150px threshold

                const dropdownHeight = 120; // Approximate height of dropdown with all options
                const topPosition = isNearBottom
                    ? buttonRect.top + window.scrollY - dropdownHeight + 40 // Position above the button
                    : buttonRect.bottom + window.scrollY; // Position below the button

                setDropdownPosition({
                    top: topPosition,
                    left: buttonRect.left + window.scrollX - 110,
                });
            }

            setOpenDropdown(index);
        }
    };

    return (
        <div className="overflow-hidden bg-white rounded-xl w-full">
            <div className="bg-white">
                <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
                    <h2 className="text-xl font-semibold text-slate-950 mr-4">{title}</h2>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        {setSearchQuery && <div className="relative w-full sm:w-[280px] h-11 flex items-center">
                            <MagnifyingGlass className="absolute size-5 left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full h-11 pl-12 pr-4 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>}
                        {filter && setIsFilterModalOpen && <button
                            className="app-button-secondary h-11 px-4"
                            onClick={() => setIsFilterModalOpen && setIsFilterModalOpen(true)}
                        >
                            <FilterIcon className="size-5" /> Filter
                        </button>}
                        {filter && setIsSortModalOpen && <button
                            className="app-button-secondary h-11 px-4"
                            onClick={() => setIsSortModalOpen && setIsSortModalOpen(true)}
                        >
                            <SortIcon className="size-4" /> Sort
                        </button>}
                    </div>
                </div>
                <div ref={tableContainerRef} className="overflow-auto max-h-[460px] scrollbar-thin">
                    <table className="min-w-full border-collapse table-auto">
                        <thead className="sticky top-0 bg-slate-50 z-5">
                            <tr>
                                {columns.map((column) => (
                                    <th key={column.key} className="px-5 py-3.5 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 text-left">
                                        {column.label}
                                    </th>
                                ))}
                                {dots && <th className="px-5 py-3.5 border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500 text-left"></th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index} onClick={() => onRowClick?.(item)} className="cursor-pointer hover:bg-violet-50/60 transition-colors duration-150">
                                        {columns.map((col) => (
                                            <td key={col.key} className="px-5 py-3.5 text-sm font-medium text-slate-800">
                                                {col.key === "status" ? getStatusBadge(item[col.key]) : item[col.key]}
                                            </td>
                                        ))}
                                        {(dots || item["dot"]) && (
                                            <td className="px-5 py-3.5 text-xs" onClick={(e) => e.stopPropagation()}>
                                                <button onClick={(e) => toggleDropdown(index, e)} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-violet-50 hover:text-violet-800 focus:outline-none focus:ring-4 focus:ring-violet-100">
                                                    <EllipsisVerticalIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length + (dots ? 1 : 0)} className="px-5 py-14 text-center">
                                        <div className="mx-auto max-w-sm">
                                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-violet-100 bg-violet-50 text-violet-700">
                                                <MagnifyingGlass className="size-5" />
                                            </div>
                                            <p className="text-sm font-semibold text-slate-900">No data found</p>
                                            <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {openDropdown !== null && (
                        <DropdownMenu
                            position={dropdownPosition}
                            data={data[openDropdown]}
                            setOpenDropdown={setOpenDropdown}
                            setEditOption={setEditOption}
                            setBlockOption={setBlockOption}
                            setDeleteOption={setDeleteOption}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsTable;
