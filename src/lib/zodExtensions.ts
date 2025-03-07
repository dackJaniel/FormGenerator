import { z } from "zod";
import { FieldMetadata, Option } from "@/types/schemaTypes";

/**
 * Diese Datei erweitert Zod um die Fähigkeit, UI-bezogene Metadaten zu speichern.
 */

interface ExtendedZodType<T extends z.ZodTypeAny> extends z.ZodTypeAny {
    __fieldMetadata?: FieldMetadata;
}

/**
 * Fügt Metadaten zu einem Zod-Schema hinzu.
 * Diese Metadaten werden später verwendet, um UI-Komponenten zu generieren.
 * 
 * @param schema - Das Zod-Schema, das erweitert werden soll
 * @param metadata - Die Metadaten, die zum Schema hinzugefügt werden sollen
 * @returns Das erweiterte Schema mit angehängten Metadaten
 */
export function withMetadata<T extends z.ZodTypeAny>(
    schema: T,
    metadata: FieldMetadata
): T {
    const metadataKey = "__fieldMetadata";
    const extendedSchema = schema as ExtendedZodType<T>;
    const currentMeta = extendedSchema[metadataKey] || {};
    const newMeta = { ...currentMeta, ...metadata };

    // Speicherung der Metadaten als Eigenschaft am Schema-Objekt
    extendedSchema[metadataKey] = newMeta;

    return schema;
}

/**
 * Macht ein Schema optional und überträgt dabei alle Metadaten
 * @param schema - Das Schema, das optional werden soll
 * @returns Ein optionales Schema mit den Metadaten des ursprünglichen Schemas
 */
export function optional<T extends z.ZodTypeAny>(schema: T): T {
    const metadata = extractMetadata(schema);
    const optionalSchema = schema.optional();
    return withMetadata(optionalSchema, metadata) as T;
}

/**
 * Erstellt ein String-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function string(metadata: FieldMetadata = {}) {
    return withMetadata(z.string(), { type: "string", ...metadata });
}

/**
 * Erstellt ein E-Mail-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function email(metadata: FieldMetadata = {}) {
    return withMetadata(z.string().email(), { type: "email", ...metadata });
}

/**
 * Erstellt ein Passwort-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function password(metadata: FieldMetadata = {}) {
    return withMetadata(z.string(), { type: "password", ...metadata });
}

/**
 * Erstellt ein Number-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function number(metadata: FieldMetadata = {}) {
    return withMetadata(z.coerce.number(), { type: "number", ...metadata });
}

/**
 * Erstellt ein Boolean-Schema mit UI-Metadaten als Checkbox
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function boolean(metadata: FieldMetadata = {}) {
    return withMetadata(z.boolean(), { type: "checkbox", ...metadata });
}

/**
 * Erstellt ein Select-Schema mit Optionen und UI-Metadaten
 * @param options - Die Auswahlmöglichkeiten für das Dropdown
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function select(options: Option[], metadata: FieldMetadata = {}) {
    return withMetadata(z.string(), {
        type: "select",
        options,
        ...metadata
    });
}

/**
 * Erstellt ein MultiSelect-Schema mit Optionen und UI-Metadaten
 * @param options - Die Auswahlmöglichkeiten für die Mehrfachauswahl
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function multiSelect(options: Option[], metadata: FieldMetadata = {}) {
    return withMetadata(
        z.array(z.object({ label: z.string(), value: z.any() })),
        { type: "multi-select", options, ...metadata }
    );
}

/**
 * Erstellt ein Textarea-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function textarea(metadata: FieldMetadata = {}) {
    return withMetadata(z.string(), { type: "textarea", ...metadata });
}

/**
 * Erstellt ein Date-Schema mit UI-Metadaten
 * @param metadata - Optional: UI-bezogene Metadaten
 */
export function date(metadata: FieldMetadata = {}) {
    return withMetadata(z.date(), { type: "date", ...metadata });
}

/**
 * Extrahiert Metadaten aus einem Zod-Schema
 * @param schema - Das Schema, aus dem die Metadaten extrahiert werden sollen
 * @returns Die im Schema gespeicherten Metadaten oder ein leeres Objekt
 */
export function extractMetadata(schema: z.ZodTypeAny): FieldMetadata {
    // Wenn das Schema null oder undefined ist, leeres Objekt zurückgeben
    if (!schema) return {};

    const extendedSchema = schema as ExtendedZodType<z.ZodTypeAny>;

    // 1. Direkt gespeicherte Metadaten haben höchste Priorität
    if (extendedSchema.__fieldMetadata) {
        return extendedSchema.__fieldMetadata;
    }

    try {
        // 2. Rekursive Extraktion für verschiedene Zod-Typen

        // Für ZodEffects (wie bei .refine(), .transform(), etc.)
        if (schema instanceof z.ZodEffects && schema._def) {
            return extractMetadata(schema._def.schema);
        }

        // Für optionale Schemas (ZodOptional)
        if (schema instanceof z.ZodOptional && schema._def) {
            return extractMetadata(schema._def.innerType);
        }

        // Sichere Typprüfungen für Schema-Definitionen
        if (schema._def) {
            // Für verschachtelte Schemas mit innerType (z.B. nach min(), max())
            if ('innerType' in schema._def && schema._def.innerType) {
                return extractMetadata(schema._def.innerType);
            }

            // Für ZodEffects und ähnliche
            if ('schema' in schema._def && schema._def.schema) {
                return extractMetadata(schema._def.schema);
            }

            // Für Arrays und Listen
            if ('type' in schema._def && schema._def.type) {
                return extractMetadata(schema._def.type);
            }

            // Für Typen mit typeName
            if ('typeName' in schema._def && typeof schema._def.typeName === 'string') {
                if (schema._def.typeName === 'ZodObject') {
                    return (schema as unknown as ExtendedZodType<z.ZodObject<any>>).__fieldMetadata || {};
                }

                if (schema._def.typeName === 'ZodEnum') {
                    return (schema as unknown as ExtendedZodType<z.ZodEnum<any>>).__fieldMetadata || {};
                }
            }
        }

        // Rekursive Suche nach verschachtelten Schemas
        const innerSchemas = findPossibleInnerSchemas(schema);
        for (const innerSchema of innerSchemas) {
            const metadata = extractMetadata(innerSchema);
            if (Object.keys(metadata).length > 0) {
                return metadata;
            }
        }
    } catch (e) {
        // Fehler beim Extrahieren der Metadaten abfangen, um Abstürze zu vermeiden
        console.warn('Fehler beim Extrahieren der Metadaten:', e);
    }

    // Fallback für alle anderen Fälle
    return {};
}

/**
 * Hilfsfunktion zum Durchsuchen aller möglichen inneren Schemas
 * Diese Funktion hilft bei der Extraktion von Metadaten aus komplexen 
 * verschachtelten Schemas, besonders bei Validierungsketten
 */
function findPossibleInnerSchemas(schema: z.ZodTypeAny): z.ZodTypeAny[] {
    if (!schema || typeof schema !== 'object') return [];
    if (!('_def' in schema) || !schema._def || typeof schema._def !== 'object') return [];

    const result: z.ZodTypeAny[] = [];

    try {
        // Durchsuche alle Properties des _def-Objekts nach möglichen Schemas
        for (const key in schema._def) {
            // Typname überspringen
            if (key === 'typeName') continue;

            const value = (schema._def as Record<string, unknown>)[key];

            // Sicherstellen, dass der Wert ein Objekt ist
            if (!value || typeof value !== 'object' || Array.isArray(value)) {
                continue;
            }

            // Prüfen, ob es sich um ein Zod-Schema handeln könnte
            if (value && typeof value === 'object' && '_def' in value) {
                result.push(value as z.ZodTypeAny);
            }
        }
    } catch (e) {
        // Fehlerbehandlung für unerwartete Strukturen
        console.warn('Fehler beim Durchsuchen der Schema-Struktur:', e);
    }

    return result;
}
