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
        <div className="w-full rounded-[10px] overflow-hidden border border-gray-300">
            <div className="overflow-x-auto">
                <table className="w-full table-auto text-sm text-left border-gray-300 rounded-[10px] overflow-hidden">
                    <thead className="rounded-t-[10px] border-gray-300 border-b" >
                        <tr>
                            {columns.map((column,i) => (
                                <th key={i} className="px-[16px] py-[10px] text-gray-600 font-bold text-[12px] max-w-[136px] desktop:min-w-[136px]">
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
                                        <td key={col} className="px-4 py-2 border-b text-[14px] border-gray-300 px-[16px] py-[10px]">
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
