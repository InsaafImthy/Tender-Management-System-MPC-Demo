// Excel and CSV parser utility for procurement items
import * as XLSX from 'xlsx';

export interface ParsedProcurementItem {
  itemName: string;
  itemCode: string;
  quantity: number;
}

export const parseCSV = (csvText: string): ParsedProcurementItem[] => {
  const lines = csvText.split('\n').filter(line => line.trim());
  const items: ParsedProcurementItem[] = [];

  // Skip header row (first row)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle CSV parsing with proper quote handling
    const columns = parseCSVLine(line);
    
    if (columns.length >= 1) {
      const itemName = columns[0].trim();
      const itemCode = columns.length >= 2 ? columns[1].trim() : '';
      const quantity = columns.length >= 3 ? parseFloat(columns[2].trim()) || 0 : 0;
      
      if (itemName) {
        items.push({ itemName, itemCode, quantity });
      }
    }
  }

  return items;
};

const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
};

export const parseExcelFile = async (file: File): Promise<ParsedProcurementItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('No data found in file'));
          return;
        }

        // Check if it's a CSV file (text-based)
        if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
          const text = data as string;
          const items = parseCSV(text);
          resolve(items);
          return;
        }

        // Handle Excel files (.xls, .xlsx)
        const workbook = XLSX.read(data, { type: 'binary' });
        
        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          reject(new Error('No sheets found in the Excel file'));
          return;
        }
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        if (!worksheet) {
          reject(new Error('Unable to read the first sheet'));
          return;
        }
        
        // Convert worksheet to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const items: ParsedProcurementItem[] = [];
        
        // Process each row (skip header row)
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          
          if (!row || row.length === 0) continue;
          
          const itemName = row[0] ? String(row[0]).trim() : '';
          const itemCode = row[1] ? String(row[1]).trim() : '';
          const quantity = row[2] !== undefined && row[2] !== null ? parseFloat(String(row[2])) : 0;
          
          if (itemName) {
            items.push({ itemName, itemCode, quantity });
          }
        }
        
        resolve(items);
      } catch (error) {
        console.error('Error parsing file:', error);
        reject(new Error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    // Read as binary for Excel files, text for CSV
    if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};

export const validateParsedItems = (items: ParsedProcurementItem[]): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (items.length === 0) {
    errors.push('No items found in the file');
  }
  
  items.forEach((item, index) => {
    if (!item.itemName || item.itemName.trim() === '') {
      errors.push(`Row ${index + 1}: Item name is required`);
    }
    
    if (item.quantity < 0) {
      errors.push(`Row ${index + 1}: Quantity cannot be negative`);
    }
  });
  
  return {
    valid: errors.length === 0,
    errors
  };
};
