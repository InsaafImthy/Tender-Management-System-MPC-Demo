import { CheckCircle2, Mail, MapPin, Star } from "lucide-react";
import { getProvider } from "./principalProviderMaster";
import { ExtractedBOQLine } from "./types";

interface Props {
  line: ExtractedBOQLine;
  onSelect: (providerId: string) => void;
}

const PrincipalProviderMatchPanel = ({ line, onSelect }: Props) => (
  <div className="provider-match-panel">
    <div className="provider-match-title">
      <div><span className="boq-kicker">Principal match</span><strong>{line.itemName}</strong></div>
      <span>{line.suggestedProviderIds.length} eligible</span>
    </div>
    <div className="provider-match-grid">
      {line.suggestedProviderIds.map((providerId, index) => {
        const provider = getProvider(providerId);
        if (!provider) return null;
        const selected = line.selectedProviderId === providerId;
        return (
          <button type="button" key={providerId} onClick={() => onSelect(providerId)} className={`provider-match-option ${selected ? "is-selected" : ""}`}>
            <span className="provider-radio">{selected && <CheckCircle2 size={17} />}</span>
            <div>
              <strong>{provider.providerName}</strong>
              <small><MapPin size={13} /> {provider.country} · <Mail size={13} /> {provider.contactPerson}</small>
              <span className="provider-brands">{provider.brandsHandled.slice(0, 3).join(" · ")}</span>
            </div>
            {index === 0 && <em><Star size={12} /> Recommended</em>}
          </button>
        );
      })}
    </div>
  </div>
);

export default PrincipalProviderMatchPanel;
