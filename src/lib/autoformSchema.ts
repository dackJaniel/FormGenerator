import { z } from 'zod';
import { extractMetadata } from './zodExtensions';
import { SchemaTypes, Option } from '@/types/schemaTypes';
import { FieldOverrides, Props } from '@/types/formTypes';
import { schemas } from '@/schemas/formSchemas';

/**
 * Diese Datei enthält die Kernlogik zum Generieren von Formular-Properties aus Zod-Schemas.
 */

/**
 * Typsichere Shape-Type für Zod-Schemas
 */
type ZodShape = Record<string, z.ZodTypeAny>;

/**
 * Extrahiert UI-Props aus einem Zod-Schema für die Formular-Generierung.
 */
export function getPropsFromSchema(
    schema: z.ZodObject<ZodShape>,
    options?: Record<string, Option[]>,
    fieldOverrides?: FieldOverrides
): Props[] {
    const shape = schema._def.shape();
    const entries = Object.entries(shape);

    return entries.map(([key, value]) => {
        // Verbesserte Metadaten-Extraktion, die auch mit optionalen Feldern funktioniert
        const metadata = extractMetadata(value);

        // Optionen aus Parametern oder Metadaten abrufen
        const fieldOptions = options?.[key] || metadata.options;

        // Überschreibungen aus fieldOverrides anwenden (falls vorhanden)
        const overrides = fieldOverrides?.[key] || {};

        // Standardwerte für Props setzen
        return {
            name: key,
            type: metadata.type || 'string',
            label: overrides.label || metadata.label || key,
            description: overrides.description || metadata.description,
            placeholder: overrides.placeholder || metadata.placeholder,
            hidden: overrides.hidden !== undefined ? overrides.hidden : metadata.hidden,
            disabled: overrides.disabled !== undefined ? overrides.disabled : metadata.disabled,
            options: fieldOptions,
            validator: value,
        };
    });
}

/**
 * Die Hauptfunktion zur Generierung von Props aus einem Schema-Typ.
 * Wird von AutoForm verwendet, um Props aus einem SchemaType zu generieren.
 */
export function getFormSchema(
    schemaType: SchemaTypes,
    options?: Record<string, Option[]>,
    fieldOverrides?: FieldOverrides
): Props[] | null {
    // Schema für den angegebenen Typ abrufen
    const schema = schemas[schemaType];

    if (!schema) {
        console.error(`Schema für Typ "${schemaType}" nicht gefunden.`);
        return null;
    }

    // Props aus dem Schema generieren
    return getPropsFromSchema(schema, options, fieldOverrides);
}

// Optional: Eine Funktion, um Fehlermeldungen zu überschreiben
export function withCustomErrorMessages(
    schema: z.ZodObject<any>,
    errorMessages: Record<string, string>
): z.ZodObject<any> {
    const shape = schema._def.shape();
    const newShape: Record<string, z.ZodTypeAny> = {};

    Object.entries(shape).forEach(([key, field]) => {
        if (errorMessages[key]) {
            // Hier könnten wir eine tiefere Logik implementieren,
            // um spezifische Validierungsregeln mit benutzerdefinierten Meldungen zu versehen
            // Dies ist jedoch komplex und würde eine Erweiterung des Zod-Schemas erfordern
            newShape[key] = field;
        } else {
            newShape[key] = field;
        }
    });

    return z.object(newShape);
}