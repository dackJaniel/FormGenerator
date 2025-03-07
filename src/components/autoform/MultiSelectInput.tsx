import { FormControl } from '../ui/form';
import MultipleSelector from '../ui/multi-select';
import { cn } from '@/lib/utils';
import { MultiSelectFieldProps } from '@/types/formFieldTypes';

const MultiSelectInput = ({ field, fieldState, options, placeholder, disabled }: MultiSelectFieldProps) => {
    const hasError = !!fieldState.error;

    return (
        <FormControl>
            <MultipleSelector
                value={Array.isArray(field.value) ? field.value : []}
                defaultOptions={(options || []).map(option => ({
                    ...option,
                    [option.value]: option.label
                }))}
                placeholder={placeholder || 'Bitte auswählen...'}
                onChange={(selectedOptions) => {
                    field.onChange(selectedOptions);
                }}
                disabled={disabled}
                emptyIndicator={
                    <p className='text-center text-lg leading-10 text-gray-600 dark:text-gray-400'>
                        Keine weiteren Ergebnisse gefunden.
                    </p>
                }
                className={cn(
                    'placeholder:text-xs',
                    hasError && 'border-destructive'
                )}
            />
        </FormControl>
    );
};

export default MultiSelectInput;
