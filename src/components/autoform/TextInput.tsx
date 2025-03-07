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
                    // Für Zahlenfelder: konvertiere den String-Wert in eine Zahl
                    if (type === 'number') {
                        const value = e.target.value;
                        // Leere Eingabe als leeren String verarbeiten
                        if (value === '') {
                            field.onChange('');
                        } else {
                            // Versuche den Wert als Zahl zu parsen
                            const numValue = parseFloat(value);
                            // Nur wenn eine gültige Zahl eingegeben wurde
                            if (!isNaN(numValue)) {
                                field.onChange(numValue); // Übergebe die Zahl, nicht den String
                            } else {
                                // Bei ungültiger Zahl behalte den String-Wert für die Anzeige
                                field.onChange(value);
                            }
                        }
                    } else {
                        // Für andere Felder: Leere Eingaben als leere Strings speichern
                        const value = e.target.value;
                        field.onChange(value);
                    }
                }}
                className={cn(
                    'placeholder:text-xs text-sm',
                    hasError && 'border-destructive focus-visible:ring-destructive'
                )}
            />
        </FormControl>
    );
};

export default TextInput;
