import { z } from 'zod';
import { extractMetadata } from './zodExtensions';
import { Option } from '@/types/schemaTypes';
import { FieldOverrides, Props } from '@/types/formTypes';
import { schemas, SchemaTypes } from '@/schemas/formSchemas';

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

        // Standardwerte für Props setzen mit expliziten Typen
        const prop: Props = {
            name: key,
            type: (metadata.type || 'string') as Props["type"],
            label: overrides.label || metadata.label || key,
            description: overrides.description || metadata.description,
            placeholder: overrides.placeholder || metadata.placeholder,
            hidden: overrides.hidden !== undefined ? overrides.hidden : metadata.hidden,
            disabled: overrides.disabled !== undefined ? overrides.disabled : metadata.disabled,
            options: fieldOptions,
            validator: value,
        };

        return prop;
    });
}

/**
 * Die Hauptfunktion zur Generierung von Props aus einem Schema-Typ.
 * Wird von AutoForm verwendet, um Props aus einem SchemaType zu generieren.
 */
export function getFormSchema<T extends SchemaTypes>(
    schemaType: T,
    options?: Record<string, Option[]>,
    fieldOverrides?: FieldOverrides
): Props[] | null {
    // Schema für den angegebenen Typ abrufen mit explizitem Cast
    const schema = schemas[schemaType] as z.ZodObject<ZodShape> | undefined;

    if (!schema) {
        console.error(`Schema für Typ "${schemaType}" nicht gefunden.`);
        return null;
    }

    try {
        // Props aus dem Schema generieren
        return getPropsFromSchema(schema, options, fieldOverrides);
    } catch (error) {
        console.error(`Fehler beim Generieren der Props aus Schema "${schemaType}":`, error);
        return null;
    }
}

// Optional: Eine Funktion, um Fehlermeldungen zu überschreiben
export function withCustomErrorMessages(
    schema: z.ZodObject<ZodShape>,
    errorMessages: Record<string, string>
): z.ZodObject<ZodShape> {
    const shape = schema._def.shape();
    const newShape: Record<string, z.ZodTypeAny> = {};

    Object.entries(shape).forEach(([key, field]) => {
        if (errorMessages[key]) {
            // Hier könnten wir eine tiefere Logik implementieren,
            // um spezifische Validierungsregeln mit benutzerdefinierten Meldungen zu versehen
            newShape[key] = field;
        } else {
            newShape[key] = field;
        }
    });

    return z.object(newShape);
}