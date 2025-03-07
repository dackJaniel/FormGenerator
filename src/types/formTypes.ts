import type { z } from "zod";
import { ControllerRenderProps, ControllerFieldState } from "react-hook-form";
// Option-Typ aus formFieldTypes.ts verwenden, um Doppeldefinitionen zu vermeiden
import { Option } from "./formFieldTypes";
import { schemas, SchemaTypes } from "@/schemas/formSchemas";

/**
 * Diese Datei definiert komplexere Typen und abgeleitete Schnittstellen,
 * die auf den grundlegenden Schnittstellen aus schemaTypes.ts aufbauen.
 */

/**
 * Standard-Antwortformat für API-Aufrufe zur Formularverarbeitung.
 */
export type SchemaResponse<T> = {
    status: "success" | "error";
    message: string;
    data: T;
};

/**
 * Automatisch generierte Typen für die Formulardaten basierend auf Zod-Schemas.
 */
export type SchemaFieldDefinitions = {
    [K in SchemaTypes]: z.infer<typeof schemas[K]>
};

/**
 * Verbesserte typsichere Definition für Standardwerte in Formularen.
 * Stellt sicher, dass die Werte mit der Schema-Definition übereinstimmen.
 */
export type DefaultValueItem<T extends SchemaTypes> =
    Partial<SchemaFieldDefinitions[T]>;

/**
 * Props für ein einzelnes Formularfeld, abgeleitet von Schema und Metadaten.
 */
export type Props = {
    type: InputTypes;           // Input-Typ (text, checkbox, etc.)
    name: string;               // Feldname (entspricht dem Schlüssel im Schema)
    label: string;              // Anzeigelabel für das Feld
    options?: Option[];         // Optionen für Select/MultiSelect-Felder
    hidden?: boolean;           // Feld verstecken
    disabled?: boolean;         // Feld deaktivieren
    placeholder?: string;       // Platzhaltertext
    description?: string;       // Hilfebeschreibung
    validator: z.ZodTypeAny;    // Zod-Schema für die Validierung
    defaultValue?: unknown;     // Standardwert
};

/**
 * Stelle sicher, dass InputTypes alle möglichen Typen enthält:
 */
export type InputTypes =
    | "string"
    | "checkbox"
    | "switch"
    | "password"
    | "select"
    | "textarea"
    | "number"
    | "email"
    | "multi-select"
    | "tel"
    | "url"
    | "date"
    | "datetime"; // Neuer Typ für den DateTime-Picker

/**
 * FieldState-Typ für Formularfelder mit Fehlerzustand
 */
export interface FormFieldState {
    isDirty: boolean;
    isTouched: boolean;
    invalid: boolean;
    error?: { message?: string }; // Vereinfachte Version ohne unnötigen Import
}

/**
 * Props für die FormInput-Komponente, die für jedes einzelne Feld verwendet werden.
 */
export interface FormInputProps {
    props: {
        type: 'email' | 'password' | 'number' | 'tel' | 'url' | 'string' | 'checkbox' | 'switch' |
        'textarea' | 'select' | 'multi-select' | 'date' | 'datetime';
        placeholder?: string;
        disabled?: boolean;
        hidden?: boolean;
        options?: Option[];
    };
    field: ControllerRenderProps<Record<string, unknown>, string>;
    fieldState: ControllerFieldState; // Verwende den korrekten Typ
}

/**
 * Definition für Überschreibungen von Feldeigenschaften zur Laufzeit.
 */
export type FieldOverrides = {
    [fieldName: string]: {
        label?: string;         // Überschreibt das Feld-Label
        description?: string;   // Überschreibt die Feld-Beschreibung
        placeholder?: string;   // Überschreibt den Platzhaltertext
        hidden?: boolean;       // Überschreibt den versteckten Status
        disabled?: boolean;     // Überschreibt den deaktivierten Status
        errorMessage?: string;  // Überschreibt die Fehlermeldung
    };
};

/**
 * Typsicheres Ergebnis für onSubmit-Handler
 */
export interface SubmitResult {
    status: string;
    message: string;
}

/**
 * Props für die AutoForm-Hauptkomponente mit generischem Typ-Parameter.
 */
export type AutoFormProps<T extends SchemaTypes> = {
    btnName?: string;           // Name des Submit-Buttons
    schema: T;                  // Schema-Typ zu verwenden
    defaultValues?: DefaultValueItem<T>[];   // Korrigierte typsichere Standardwerte
    options?: T extends keyof SchemaFieldDefinitions
    ? { [K in keyof SchemaFieldDefinitions[T]]?: Option[] }
    : { [fieldName: string]: Option[] };  // Typsichere Optionen
    fieldOverrides?: FieldOverrides; // Überschreibungen für Felder
    errorMessages?: { [fieldName: string]: string }; // Globale Fehlermeldungen-Überschreibungen
    onSubmit?: (               // Typsicherer Submit-Handler
        payload: T extends keyof SchemaFieldDefinitions
            ? SchemaFieldDefinitions[T]
            : Record<string, unknown>
    ) => Promise<SubmitResult | void>;
};

/**
 * Hilfstüp für die Verwaltung von Pflichtfeldern.
 */
export type FieldRequirement = Record<string, boolean>;

/**
 * Hilfsdefinition für die Typisierung von Formularwerten basierend auf dem Schema-Typ.
 */
export type FormValues<T extends SchemaTypes> =
    T extends keyof SchemaFieldDefinitions
    ? SchemaFieldDefinitions[T]
    : Record<string, unknown>;