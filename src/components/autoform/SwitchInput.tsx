import { FormControl } from '../ui/form';
import { Switch } from '../ui/switch';
import { cn } from '@/lib/utils';
import { BaseFieldProps } from '@/types/formFieldTypes';

const SwitchInput = ({ field, fieldState, disabled }: BaseFieldProps) => {
    const hasError = !!fieldState.error;

    return (
        <FormControl>
            <Switch
                checked={field.value as boolean}
                onCheckedChange={field.onChange}
                disabled={disabled}
                className={cn(hasError && 'border-destructive')}
            />
        </FormControl>
    );
};

export default SwitchInput;
