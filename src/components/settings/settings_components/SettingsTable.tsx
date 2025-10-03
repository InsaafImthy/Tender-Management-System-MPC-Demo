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
    let statusClasses = "py-1 text-xs border rounded-full flex justify-center";

    switch (status.toLowerCase()) {
        case "active":
            statusClasses += " bg-green-100 text-green-700 border-green-500";
            break;
        case "inactive":
            statusClasses += " bg-red-100 text-red-700 border-red-500";
            break;
        case "pending":
            statusClasses += " bg-yellow-100 text-yellow-700 border-yellow-500";
            break;
        default:
            statusClasses += " bg-gray-100 text-gray-700 border-gray-500";
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
        <div className="overflow-x-auto bg-white rounded-md shadow w-full">
            <div className="bg-white p-3">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-[18px] font-semibold mr-4">{title}</h2>
                    <div className="flex space-x-2">
                        {setSearchQuery && <div className="relative w-[219px] h-[30px] flex items-center">
                            <MagnifyingGlass className="absolute size-4 left-3 top-1/2 transform -translate-y-1/2 text-[#1E1F21] z-10" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-10 pr-3 py-1.5 rounded-[6px] bg-[#EFF4F9] text-sm focus:outline-none flex items-center"
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>}
                        {filter && setIsFilterModalOpen && <button
                            className="px-3 py-2 w-[75px] h-[30px] flex text-xs items-center justify-center bg-[#EFF4F9] rounded-[6px] hover:bg-blue-200"
                            onClick={() => setIsFilterModalOpen && setIsFilterModalOpen(true)}
                        >
                            <FilterIcon className="size-6 mr-2" /> Filter
                        </button>}
                        {filter && setIsSortModalOpen && <button
                            className="px-3 py-2 w-[75px] h-[30px] text-xs flex items-center justify-center bg-[#EFF4F9] rounded-[6px] hover:bg-blue-200"
                            onClick={() => setIsSortModalOpen && setIsSortModalOpen(true)}
                        >
                            <SortIcon className="size-3 mr-2" /> Sort
                        </button>}
                    </div>
                </div>
                <div ref={tableContainerRef} className="overflow-auto max-h-[380px]">
                    <table className="min-w-full border-collapse table-auto">
                        <thead className="sticky top-0 bg-white z-5">
                            <tr>
                                {columns.map((column) => (
                                    <th key={column.key} className="px-1 py-2 border-b text-[12px] text-gray-600 text-left text-md">
                                        {column.label}
                                    </th>
                                ))}
                                {dots && <th className="px-2 py-2 border-b text-[12px] text-gray-600 text-left text-md"></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map((item, index) => (
                                    <tr key={index} onClick={() => onRowClick?.(item)} className="cursor-pointer hover:bg-gray-100">
                                        {columns.map((col) => (
                                            <td key={col.key} className={`px-1 py-2 ${index < data.length - 1 && "border-b"} text-[12px]`}>
                                                {col.key === "status" ? getStatusBadge(item[col.key]) : item[col.key]}
                                            </td>
                                        ))}
                                        {(dots || item["dot"]) && (
                                            <td className={`px-6 py-2 ${index < data.length - 1 && "border-b"} text-xs`} onClick={(e) => e.stopPropagation()}>
                                                <button onClick={(e) => toggleDropdown(index, e)} className="focus:outline-none">
                                                    <EllipsisVerticalIcon className="w-4 h-4 stroke-gray-600" />
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-2 border-b text-center">
                                        No data found
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