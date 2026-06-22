export const formatDate = (value?: string) => {
  if (!value) return "Not set";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

export const formatMoney = (value: number, currency = "OMR") => {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeCurrency = /^[A-Z]{3}$/.test(currency) ? currency : "OMR";
  return new Intl.NumberFormat("en", { style: "currency", currency: safeCurrency, maximumFractionDigits: safeValue < 10 ? 3 : 2 }).format(safeValue);
};

export const formatFileSize = (size: number) => size < 1024 ? `${size} B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`;
