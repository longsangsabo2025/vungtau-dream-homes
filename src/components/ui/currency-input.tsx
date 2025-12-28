import { useState, useEffect, forwardRef } from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number;
  onChange: (value: string) => void;
  suffix?: string;
}

// Format number with dots as thousand separators (Vietnamese style)
export function formatCurrency(value: string | number): string {
  if (!value && value !== 0) return '';
  const numStr = String(value).replace(/\D/g, '');
  if (!numStr) return '';
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Parse formatted string back to number string
export function parseCurrency(formattedValue: string): string {
  return formattedValue.replace(/\./g, '');
}

// Format to display text (e.g., "2 tỷ 500 triệu")
export function formatPriceText(value: string | number): string {
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, '')) : value;
  if (!num || isNaN(num)) return '';
  
  if (num >= 1000000000) {
    const ty = Math.floor(num / 1000000000);
    const trieu = Math.floor((num % 1000000000) / 1000000);
    if (trieu > 0) {
      return `${ty} tỷ ${trieu} triệu`;
    }
    return `${ty} tỷ`;
  }
  
  if (num >= 1000000) {
    const trieu = Math.floor(num / 1000000);
    return `${trieu} triệu`;
  }
  
  if (num >= 1000) {
    return `${Math.floor(num / 1000)} nghìn`;
  }
  
  return formatCurrency(num);
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, suffix = 'VNĐ', className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatCurrency(value));

    useEffect(() => {
      setDisplayValue(formatCurrency(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      // Remove non-digit characters except dots
      const cleanValue = inputValue.replace(/[^\d.]/g, '');
      // Parse to get raw number
      const rawValue = parseCurrency(cleanValue);
      // Format for display
      const formatted = formatCurrency(rawValue);
      
      setDisplayValue(formatted);
      onChange(rawValue);
    };

    const priceText = formatPriceText(value);

    return (
      <div className="space-y-1">
        <div className="relative">
          <Input
            ref={ref}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            className={cn("pr-16", className)}
            {...props}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
            {suffix}
          </span>
        </div>
        {priceText && (
          <p className="text-sm text-primary font-medium">
            ≈ {priceText}
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
