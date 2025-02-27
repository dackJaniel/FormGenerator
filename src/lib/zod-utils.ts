import { z } from 'zod';

/**
 * Prüft, ob ein Zod-Schema required ist
 */
export const isFieldRequired = (schema: z.ZodTypeAny): boolean => {
    try {
        schema.parse(undefined);
        return false;
    } catch (error) {
        return true;
    }
};

/**
 * Versucht, min und max Länge aus einem String-Schema zu extrahieren
 */
export const extractStringLimits = (schema: z.ZodString) => {
    const minLength = schema._def.checks?.find(check => check.kind === 'min')?.value || 0;
    const maxLength = schema._def.checks?.find(check => check.kind === 'max')?.value || Infinity;
    return { minLength, maxLength };
};

/**
 * Versucht, min und max Werte aus einem Number-Schema zu extrahieren
 */
export const extractNumberLimits = (schema: z.ZodNumber) => {
    const min = schema._def.checks?.find(check => check.kind === 'min')?.value || -Infinity;
    const max = schema._def.checks?.find(check => check.kind === 'max')?.value || Infinity;
    return { min, max };
};

/**
 * Bestimmt den bestmöglichen Input-Typ basierend auf dem Schema
 */
export const determineInputType = (schema: z.ZodTypeAny): string => {
    if (schema instanceof z.ZodString) {
        if (schema._def.checks?.some(check => check.kind === 'email')) return 'email';
        if (schema._def.checks?.some(check => check.kind === 'url')) return 'url';
        return 'text';
    }
    if (schema instanceof z.ZodNumber) return 'number';
    if (schema instanceof z.ZodBoolean) return 'checkbox';
    if (schema instanceof z.ZodDate) return 'date';
    return 'text';
};
