import { useMemo, useState } from "react";
import { Input, InputNumber, Modal, notification } from "antd";
import {
  getDemoRfpById,
  getDemoSelectedProposals,
  saveDemoFinalProposal,
} from "../../data/finalProposalDemoData";
import type { FinalProposalRfpSource } from "./finalProposalTypes";

interface DemoFinalProposalFormProps {
  open: boolean;
  rfp: FinalProposalRfpSource;
  onClose: () => void;
  onSaved: () => void;
}

const formatMoney = (value: number, currency: string) =>
  `${currency} ${new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: currency === "OMR" ? 3 : 2,
    maximumFractionDigits: currency === "OMR" ? 3 : 2,
  }).format(value)}`;

const DemoFinalProposalForm = ({
  open,
  rfp,
  onClose,
  onSaved,
}: DemoFinalProposalFormProps) => {
  const storedRfp = rfp.id ? getDemoRfpById(rfp.id) : undefined;
  const existingProposal = rfp.id ? getDemoSelectedProposals(rfp.id)[0] : undefined;
  const [description, setDescription] = useState(
    storedRfp?.finalProposalDescription ??
      rfp.finalProposalDescription ??
      rfp.rfpDescription ??
      "",
  );
  const [itemValues, setItemValues] = useState<Record<number, number | null>>(() => {
    const values: Record<number, number | null> = {};
    for (const item of rfp.rfpItems ?? []) {
      if (!item.id) continue;
      const existingItem = existingProposal?.vendorRfpProposalItems?.find(
        (proposalItem) => proposalItem.rfpItemId === item.id,
      );
      values[item.id] = existingItem?.amount ?? null;
    }
    return values;
  });
  const [saving, setSaving] = useState(false);
  const currency = rfp.rfpCurrency ?? "OMR";

  const finalBidValue = useMemo(
    () =>
      Object.values(itemValues).reduce<number>(
        (total, value) => total + (typeof value === "number" ? value : 0),
        0,
      ),
    [itemValues],
  );

  const handleSave = () => {
    if (!rfp.id) return;
    const items = rfp.rfpItems ?? [];
    const incomplete = items.some(
      (item) => !item.id || !itemValues[item.id] || Number(itemValues[item.id]) <= 0,
    );
    if (incomplete) {
      notification.warning({
        message: "Complete the final pricing",
        description: "Enter a final value greater than zero for every BOQ item.",
      });
      return;
    }

    setSaving(true);
    try {
      saveDemoFinalProposal(rfp.id, {
        description,
        itemValues: items.map((item) => ({
          rfpItemId: item.id as number,
          finalValue: Number(itemValues[item.id as number]),
        })),
      });
      notification.success({ message: "Demo final proposal details saved." });
      onSaved();
      onClose();
    } catch (error) {
      notification.error({
        message: "Unable to save final proposal",
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Enter Final Proposal Details"
      open={open}
      onCancel={onClose}
      onOk={handleSave}
      okText="Save Final Details"
      confirmLoading={saving}
      width={760}
      destroyOnClose
    >
      <div className="space-y-5 py-3">
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-900">
          These values are stored in this browser for demonstration only and are not sent to the backend.
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            External proposal description
          </label>
          <Input.TextArea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            maxLength={800}
            showCount
          />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-slate-700">Approved BOQ values</h3>
            <span className="text-sm font-bold text-[#0B1F49]">
              Final Bid: {formatMoney(finalBidValue, currency)}
            </span>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[minmax(0,1fr)_100px_180px] gap-3 bg-slate-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              <span>Item</span>
              <span className="text-right">Quantity</span>
              <span className="text-right">Final Value</span>
            </div>
            {(rfp.rfpItems ?? []).map((item, index) => (
              <div
                key={item.id ?? index}
                className="grid grid-cols-[minmax(0,1fr)_100px_180px] items-center gap-3 border-t border-slate-100 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{item.itemName}</p>
                  <p className="text-xs text-slate-500">{item.itemCode}</p>
                </div>
                <span className="text-right text-sm text-slate-700">{item.quantity}</span>
                <InputNumber
                  value={item.id ? itemValues[item.id] : null}
                  min={0.001}
                  precision={3}
                  step={0.001}
                  addonBefore={currency}
                  className="w-full"
                  onChange={(value) => {
                    if (!item.id) return;
                    setItemValues((current) => ({ ...current, [item.id as number]: value }));
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default DemoFinalProposalForm;
