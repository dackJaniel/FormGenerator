import { FormControl } from '../ui/form';
import { Checkbox } from '../ui/checkbox';
import { cn } from '@/lib/utils';
import { BaseFieldProps } from '@/types/formFieldTypes';

const CheckboxInput = ({ field, fieldState, disabled }: BaseFieldProps) => {
    const hasError = !!fieldState.error;

    return (
        <FormControl>
            <Checkbox
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
                disabled={disabled}
                className={cn(hasError && 'border-destructive')}
            />
        </FormControl>
    );
};

export default CheckboxInput;
