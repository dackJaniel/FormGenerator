import { FormControl } from '../ui/form';
import { Textarea } from '../ui/textarea';
import { cn } from '@/lib/utils';
import { TextareaFieldProps } from '@/types/formFieldTypes';

const TextareaInput = ({ field, fieldState, placeholder, disabled }: TextareaFieldProps) => {
    const hasError = !!fieldState.error;

    return (
        <FormControl>
            <Textarea
                {...field}
                value={field.value as string}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                    'placeholder:text-xs text-sm',
                    hasError && 'border-destructive focus-visible:ring-destructive'
                )}
            />
        </FormControl>
    );
};

export default TextareaInput;
