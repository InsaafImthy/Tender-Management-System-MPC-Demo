import React from 'react';
import { Modal as AntdModal } from 'antd';
import { IBom } from '../../../types/bomTypes';
import { commonUnits } from '../../../utils/constants';

interface BomDetailModalProps {
  open: boolean;
  onClose: () => void;
  bom: IBom | null;
}

const fmt = (n: number) => `$${Number(n || 0).toFixed(2)}`;
const getUnitLabel = (v: number) => commonUnits.find(u => u.value === v)?.label || v;

const BomDetailModal: React.FC<BomDetailModalProps> = ({ open, onClose, bom }) => {
  if (!bom) return null as any;
  const items = (bom as any).bomItemDtos || [];
  const total = items.reduce((s: number, it: any) => s + Number(it.quantity || 0) * Number(it.price || 0), 0);

  return (
    <AntdModal open={open} onCancel={onClose} footer={null} width={800}
      title={<div className="flex items-center justify-between"><div className="text-[18px] font-semibold">{(bom as any).bomName}</div><div className="text-sm text-gray-600">{bom.category ? (bom as any).category?.name : ''}</div></div>}>
      <div className="text-sm text-gray-600 mb-2">{(bom as any).description || ''}</div>
      <div className="text-xs text-gray-500 mb-4">Items: {items.length} • Total Value: {fmt(total)}</div>
      <div className="space-y-2 max-h-[60vh] overflow-auto">
        {items.map((it: any, idx: number) => (
          <div key={idx} className="grid grid-cols-12 gap-2 items-center text-sm bg-gray-50 rounded px-3 py-2">
            <div className="col-span-2 text-gray-600">{it.itemCode}</div>
            <div className="col-span-4">{it.itemName}</div>
            <div className="col-span-3 text-gray-600">{it.description}</div>
            <div className="col-span-2 text-gray-600">{Number(it.quantity)} {getUnitLabel(Number(it.unit))}</div>
            <div className="col-span-1 text-right font-medium">{fmt(Number(it.price))}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">No items</div>}
      </div>
    </AntdModal>
  );
};

export default BomDetailModal;
