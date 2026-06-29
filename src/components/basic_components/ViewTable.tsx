import React from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming you're using React Router

interface TableProps {
    columns: string[];
    items: any[];
    columnLabels: Record<string, string>;
    rowNavigationPath?: string; // Optional base path for navigation
}

const ViewTable: React.FC<TableProps> = ({
    columns,
    items,
    columnLabels,
    rowNavigationPath,
}) => {

    const navigate = useNavigate();
    const handleRowClick = (id: string | number) => {
        if (rowNavigationPath) {
            navigate(`/${rowNavigationPath}/${id}`);
        } else {
            console.warn('No rowNavigationPath provided');
        }
    };
    console.log(items,"itemsitemsitems")

    return (
        <div className="w-full overflow-hidden rounded-[18px] border border-gray-300 bg-white">
            <div className="overflow-x-auto">
                <table className="min-w-full table-auto overflow-hidden rounded-[10px] border-gray-300 text-left text-sm">
                    <thead className="border-b border-gray-300 bg-slate-50" >
                        <tr>
                            {columns.map((column,i) => (
                                <th key={i} className="px-[16px] py-[12px] text-[12px] font-bold text-gray-600 sm:min-w-[136px]">
                                    {columnLabels[column]}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="rounded-b-[10px] border-gray-300" >
                        {items.length > 0 ? (
                            items.map((item, index) => (
                                <tr
                                    key={index}
                                    onClick={() => handleRowClick(item.id)}
                                    className="group relative"
                                >
                                    {columns.map((col) => (
                                        <td key={col} className="border-b border-gray-300 px-[16px] py-[12px] text-[14px] text-slate-700 align-top">
                                            {item[col]}
                                        </td>
                                    ))}
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
            </div>
        </div>
    );
};

export default ViewTable;
