"use server";

import { SchemaResponse } from "@/types/formTypes";

/**
 * Server-Action zum Testen des Formularsubmits
 * @returns Eine typsichere Erfolgsmeldung
 */
export async function test(): Promise<SchemaResponse<Record<string, never>>> {
    return {
        status: "success",
        message: "Test erfolgreich",
        data: {}
    };
}