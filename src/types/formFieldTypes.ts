import { ControllerRenderProps, FieldValues, ControllerFieldState } from "react-hook-form";

/**
 * Standardisierte Optionsobjekt-Schnittstelle für Select- und MultiSelect-Felder.
 * Wird sowohl in Schemas als auch in der Formular-Darstellung verwendet.
 */
export interface Option {
    value: string;              // Der tatsächliche Wert, der beim Submit übermittelt wird
    label: string;              // Die für den Benutzer sichtbare Bezeichnung
    disable?: boolean;          // Optional: Option deaktivieren
    fixed?: boolean;            // Optional: Option kann nicht entfernt werden (für MultiSelect)
    [key: string]: string | boolean | undefined;  // Zusätzliche benutzerdefinierte Eigenschaften
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
