import { FormControl } from '../ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../ui/select';
import { cn } from '@/lib/utils';
import { SelectFieldProps } from '@/types/formFieldTypes';

const SelectInput = ({ field, fieldState, options, disabled }: SelectFieldProps) => {
    const hasError = !!fieldState.error;

    return (
        <Select
            onValueChange={field.onChange}
            defaultValue={field.value as string}
            value={field.value as string}
            disabled={disabled}>
            <FormControl>
                <SelectTrigger
                    className={cn(
                        hasError && 'border-destructive focus-visible:ring-destructive'
                    )}
                    disabled={disabled}>
                    <SelectValue placeholder='Bitte auswählen' />
                </SelectTrigger>
            </FormControl>
            <SelectContent>
                {options && options.length >= 0 ? (
                    options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))
                ) : (
                    <small>Keine Auswahlmöglichkeiten</small>
                )}
            </SelectContent>
        </Select>
    );
};

export default SelectInput;
