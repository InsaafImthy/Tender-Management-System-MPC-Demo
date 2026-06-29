import { Fragment, useState } from "react";
import { ChevronDown, ChevronUp, WandSparkles } from "lucide-react";
import { getProvider } from "./principalProviderMaster";
import PrincipalProviderMatchPanel from "./PrincipalProviderMatchPanel";
import { ExtractedBOQLine } from "./types";

interface Props {
  lines: ExtractedBOQLine[];
  onChange: (line: ExtractedBOQLine) => void;
}

const categories = ["Laboratory / Diagnostics", "Surgical Consumables", "Medical Equipment", "Mobility / Hospital Furniture", "Medical Consumables"];
const units = ["Nos.", "Kit", "Pack", "Packet", "Set", "Box"];

const ExtractedLineItemsTable = ({ lines, onChange }: Props) => {
  const [expandedLineId, setExpandedLineId] = useState<string | null>(lines[0]?.id ?? null);
  const update = (line: ExtractedBOQLine, change: Partial<ExtractedBOQLine>) => onChange({ ...line, ...change });

  return (
    <section className="boq-card boq-table-card">
      <div className="boq-section-heading compact">
        <div><span className="boq-kicker">AI extracted</span><h2>BOQ line items</h2><p>Review and correct the highlighted commercial fields before generating RFPs.</p></div>
        <span className="boq-count-pill">{lines.length} lines</span>
      </div>
      <div className="boq-table-scroll">
        <table className="boq-review-table">
          <thead><tr><th>Sr</th><th>Item Code</th><th className="description-column">Item Name / Description</th><th>Category / Sub Category</th><th>Unit</th><th>Qty</th><th>Remarks / Delivery</th><th>Confidence</th><th>Principal Provider</th><th>RFP Group</th><th /></tr></thead>
          <tbody>
            {lines.map((line) => {
              const expanded = expandedLineId === line.id;
              return (
                <Fragment key={line.id}>
                  <tr className={expanded ? "is-expanded" : ""}>
                    <td><strong>{line.srNo}</strong></td>
                    <td><span className="boq-code">{line.itemCode}</span></td>
                    <td><strong className="boq-item-name">{line.itemName}</strong></td>
                    <td>
                      <select value={line.category} onChange={(event) => update(line, { category: event.target.value })}>{categories.map((category) => <option key={category}>{category}</option>)}</select>
                      <input aria-label="Sub category" value={line.subCategory} onChange={(event) => update(line, { subCategory: event.target.value })} />
                    </td>
                    <td><select value={line.unit} onChange={(event) => update(line, { unit: event.target.value })}>{units.map((unit) => <option key={unit}>{unit}</option>)}</select></td>
                    <td><input className="quantity-input" type="number" min="1" value={line.quantity} onChange={(event) => update(line, { quantity: Number(event.target.value) })} /></td>
                    <td><span className="boq-remarks">{line.remarks}</span></td>
                    <td><span className={`boq-confidence ${line.confidence < 85 ? "medium" : ""}`}><WandSparkles size={13} /> {line.confidence}%</span></td>
                    <td><button type="button" className="provider-chip-button" onClick={() => setExpandedLineId(expanded ? null : line.id)}>{getProvider(line.selectedProviderId)?.providerName ?? "Select provider"}</button></td>
                    <td><span className="rfp-group-label">{line.rfpGroup ?? "Assigned on save"}</span></td>
                    <td><button type="button" className="boq-icon-button" aria-label="Show provider matches" onClick={() => setExpandedLineId(expanded ? null : line.id)}>{expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}</button></td>
                  </tr>
                  {expanded && (
                    <tr key={`${line.id}-provider`} className="provider-expanded-row"><td colSpan={11}><PrincipalProviderMatchPanel line={line} onSelect={(providerId) => update(line, { selectedProviderId: providerId })} /></td></tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ExtractedLineItemsTable;
