import { z } from "zod";
import { FieldMetadata, Option } from "@/types/schemaTypes";

/**
 * Diese Datei erweitert Zod um die Fähigkeit, UI-bezogene Metadaten zu speichern.
 */

interface ExtendedZodType<T extends z.ZodTypeAny> extends z.ZodTypeAny {
    __fieldMetadata?: FieldMetadata;
}

// Symbol als eindeutige ID für unsere Metadaten
const META_KEY = Symbol("fieldMetadata");

/**
 * Fügt Metadaten zu einem Zod-Schema hinzu.
 * Diese werden direkt am Schema-Objekt und mit einem Symbol gespeichert,
 * damit sie auch bei Validierungsketten nicht verloren gehen.
 */
export function withMetadata<T extends z.ZodTypeAny>(
    schema: T,
    metadata: FieldMetadata
): T {
    const extendedSchema = schema as any;

    // Backward-Kompatibilität mit bestehender Implementierung
    const currentMeta = extendedSchema.__fieldMetadata || {};
    extendedSchema.__fieldMetadata = { ...currentMeta, ...metadata };

    // Zusätzliche Symbol-basierte Speicherung für bessere Persistenz
    extendedSchema[META_KEY] = { ...currentMeta, ...metadata };

    // Überschreiben der .optional()-Methode, um Metadaten zu erhalten
    const originalOptional = extendedSchema.optional;
    extendedSchema.optional = function () {
        const optSchema = originalOptional.apply(this);
        return withMetadata(optSchema, extendedSchema[META_KEY] || {});
    };

    // Validierungsmethoden patchen, um Metadaten zu erhalten
    patchValidationMethods(extendedSchema);

    return schema;
}

/**
 * Patcht die gängigen Validierungsmethoden eines Schemas, um Metadaten zu erhalten
 */
function patchValidationMethods(schema: any) {
    // Für String-spezifische Methoden
    if (schema instanceof z.ZodString) {
        const methods = ['min', 'max', 'length', 'email', 'url', 'uuid', 'cuid', 'regex', 'startsWith', 'endsWith'];
        methods.forEach(method => {
            if (typeof schema[method] === 'function') {
                const originalMethod = schema[method];
                schema[method] = function (...args: any[]) {
                    const result = originalMethod.apply(this, args);
                    return withMetadata(result, schema[META_KEY] || {});
                };
            }
        });
    }

    // Für Number-spezifische Methoden
    if (schema instanceof z.ZodNumber) {
        const methods = ['min', 'max', 'int', 'positive', 'negative', 'nonpositive', 'nonnegative'];
        methods.forEach(method => {
            if (typeof schema[method] === 'function') {
                const originalMethod = schema[method];
                schema[method] = function (...args: any[]) {
                    const result = originalMethod.apply(this, args);
                    return withMetadata(result, schema[META_KEY] || {});
                };
            }
        });
    }

    // Allgemeine Methoden für alle Schema-Typen
    ['optional', 'nullable', 'nullish', 'default', 'catch', 'refine', 'superRefine', 'transform', 'pipe'].forEach(method => {
        if (typeof schema[method] === 'function') {
            const originalMethod = schema[method];
            schema[method] = function (...args: any[]) {
                const result = originalMethod.apply(this, args);
                return withMetadata(result, schema[META_KEY] || {});
            };
        }
    });
}

/**
 * Verbesserte Metadaten-Extraktion, die tiefer nach Metadaten sucht und 
 * sowohl das Symbol als auch die Eigenschaft berücksichtigt
 */
export function extractMetadata(schema: z.ZodTypeAny): FieldMetadata {
    if (!schema) return {};

    // Symbol-basierte Metadaten haben höchste Priorität
    if ((schema as any)[META_KEY]) {
        return (schema as any)[META_KEY];
    }

    // Dann die normale Eigenschaft
    if ((schema as ExtendedZodType<typeof schema>).__fieldMetadata) {
        return (schema as ExtendedZodType<typeof schema>).__fieldMetadata;
    }

    try {
        // Versuche Metadaten aus verschiedenen Schema-Typen zu extrahieren

        // Für ZodEffects (wie bei .refine(), .transform(), etc.)
        if (schema instanceof z.ZodEffects && schema._def) {
            return extractMetadata(schema._def.schema);
        }

        // Für optionale Schemas (ZodOptional)
        if (schema instanceof z.ZodOptional && schema._def) {
            return extractMetadata(schema._def.innerType);
        }

        // Für ZodDefault (bei .default())
        if ('defaultValue' in schema._def && schema._def.innerType) {
            return extractMetadata(schema._def.innerType);
        }

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

        // Überprüfung aller möglichen inneren Schemas
        const innerSchemas = findAllPossibleInnerSchemas(schema);
        for (const innerSchema of innerSchemas) {
            const metadata = extractMetadata(innerSchema);
            if (Object.keys(metadata).length > 0) {
                return metadata;
            }
        }
    } catch (e) {
        console.warn('Fehler beim Extrahieren der Metadaten:', e);
    }

    return {};
}

/**
 * Findet alle möglichen inneren Schemas in einem komplexen Zod-Schema
 */
function findAllPossibleInnerSchemas(schema: z.ZodTypeAny): z.ZodTypeAny[] {
    if (!schema || typeof schema !== 'object' || !('_def' in schema)) return [];

    const result: z.ZodTypeAny[] = [];

    try {
        // Rekursive Suche durch alle properties des _def-Objekts
        const searchInObject = (obj: any): void => {
            if (!obj || typeof obj !== 'object') return;

            // Wenn es ein Zod-Schema ist, hinzufügen
            if ('_def' in obj) {
                result.push(obj as z.ZodTypeAny);
            }

            // Rekursiv durch alle Eigenschaften gehen
            for (const key in obj) {
                const value = obj[key];

                // Arrays durchsuchen
                if (Array.isArray(value)) {
                    value.forEach(item => searchInObject(item));
                }
                // Objekte durchsuchen
                else if (value && typeof value === 'object') {
                    searchInObject(value);
                }
            }
        };

        searchInObject(schema._def);
    } catch (e) {
        console.warn('Fehler beim Suchen innerer Schemas:', e);
    }

    return result;
}

/**
 * Verbesserte optional-Funktion, die immer die Metadaten erhält
 */
export function optional<T extends z.ZodTypeAny>(schema: T): z.ZodTypeAny {
    const metadata = extractMetadata(schema);
    const optionalSchema = schema.optional();
    return withMetadata(optionalSchema, metadata);
}

// Die folgenden Funktionen erstellen Basis-Schemas mit Metadaten

export function string(metadata: FieldMetadata = {}): z.ZodString {
    return withMetadata(z.string(), { type: "string", ...metadata }) as z.ZodString;
}

export function email(metadata: FieldMetadata = {}): z.ZodString {
    return withMetadata(
        z.string().email(),
        { type: "email", ...metadata }
    ) as z.ZodString;
}

export function password(metadata: FieldMetadata = {}): z.ZodString {
    return withMetadata(z.string(), { type: "password", ...metadata }) as z.ZodString;
}

export function number(metadata: FieldMetadata = {}): z.ZodNumber {
    return withMetadata(
        z.coerce.number(),
        { type: "number", ...metadata }
    ) as z.ZodNumber;
}

export function boolean(metadata: FieldMetadata = {}): z.ZodBoolean {
    return withMetadata(
        z.boolean(),
        { type: "checkbox", ...metadata }
    ) as z.ZodBoolean;
}

export function select(options: Option[], metadata: FieldMetadata = {}): z.ZodString {
    return withMetadata(
        z.string(),
        { type: "select", options, ...metadata }
    ) as z.ZodString;
}

export function multiSelect(options: Option[], metadata: FieldMetadata = {}) {
    return withMetadata(
        z.array(z.object({ label: z.string(), value: z.any() })),
        { type: "multi-select", options, ...metadata }
    );
}

export function textarea(metadata: FieldMetadata = {}): z.ZodString {
    return withMetadata(z.string(), { type: "textarea", ...metadata }) as z.ZodString;
}

export function date(metadata: FieldMetadata = {}): z.ZodDate {
    return withMetadata(z.date(), { type: "date", ...metadata }) as z.ZodDate;
}

export function tel(metadata: FieldMetadata = {}): z.ZodString {
    return withMetadata(z.string(), { type: "tel", ...metadata }) as z.ZodString;
}

export function url(metadata: FieldMetadata = {}): z.ZodString {
    return withMetadata(
        z.string().url(),
        { type: "url", ...metadata }
    ) as z.ZodString;
}
