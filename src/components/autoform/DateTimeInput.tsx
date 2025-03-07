import { FormControl } from '../ui/form';
import { DateTimePicker } from '../ui/datetime';
import { cn } from '@/lib/utils';
import { de } from 'date-fns/locale';
import { DateTimeFieldProps } from '@/types/formFieldTypes';

const DateTimeInput = ({ field, fieldState, placeholder, disabled }: DateTimeFieldProps) => {
    const hasError = !!fieldState.error;

    return (
        <FormControl>
            <DateTimePicker
                value={field.value as Date}
                onChange={(date) => {
                    field.onChange(date);
                }}
                disabled={disabled}
                locale={de}
                placeholder={placeholder || "Datum und Uhrzeit auswählen"}
                className={cn(
                    hasError && 'border-destructive focus-visible:ring-destructive'
                )}
                granularity="minute"
                displayFormat={{
                    hour24: "PPpp",
                    hour12: "PPpp"
                }}
            />
        </FormControl>
    );
};

export default DateTimeInput;
