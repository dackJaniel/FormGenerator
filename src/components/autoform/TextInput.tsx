import { FormControl } from '../ui/form';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import { TextFieldProps } from '@/types/formFieldTypes';

const TextInput = ({ field, fieldState, type, placeholder, disabled }: TextFieldProps) => {
    const hasError = !!fieldState.error;

    return (
        <FormControl>
            <Input
                {...field}
                // Sicherstellen, dass `value` immer ein String ist
                value={field.value === null || field.value === undefined ? '' :
                    typeof field.value === 'object' ?
                        JSON.stringify(field.value) : String(field.value)}
                type={type}
                placeholder={placeholder || ''}
                disabled={disabled}
                onChange={(e) => {
                    // Leere Eingabe als undefined verarbeiten, sonst den normalen Wert
                    const value = e.target.value === '' ? undefined : e.target.value;
                    field.onChange(value);
                }}
                className={cn(
                    'placeholder:text-xs',
                    hasError && 'border-destructive focus-visible:ring-destructive'
                )}
            />
        </FormControl>
    );
};

export default TextInput;
