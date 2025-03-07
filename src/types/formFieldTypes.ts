import { ControllerRenderProps, FieldValues, ControllerFieldState } from "react-hook-form";

export interface Option {
    label: string;
    value: string;
    // Sicherstellen, dass dynamische Properties zulässig sind
    [key: string]: string;
}

export interface BaseFieldProps {
    field: ControllerRenderProps<FieldValues, string>;
    fieldState: ControllerFieldState;
    disabled?: boolean;
}

export interface TextFieldProps extends BaseFieldProps {
    type: 'email' | 'password' | 'number' | 'tel' | 'url' | 'string';
    placeholder?: string;
}

export interface TextareaFieldProps extends BaseFieldProps {
    placeholder?: string;
}

export interface SelectFieldProps extends BaseFieldProps {
    options?: Option[];
}

export interface MultiSelectFieldProps extends SelectFieldProps {
    placeholder?: string;
}

export interface DateTimeFieldProps extends BaseFieldProps {
    placeholder?: string;
}
