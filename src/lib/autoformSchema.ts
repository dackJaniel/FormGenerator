import { z } from 'zod';
import { extractMetadata } from './zodExtensions';
import { SchemaTypes, Option } from '@/schemas/schemaTypes';
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
    // ...existing code...
}

// ...existing code...
