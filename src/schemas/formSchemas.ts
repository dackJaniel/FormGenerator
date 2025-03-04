import { z } from 'zod';
import * as zod from '@/lib/zodExtensions';
import { SchemaTypes } from '@/schemas/schemaTypes';

// User Admin Schema mit integrierten Metadaten
export const userAdminSchema = z.object({
    id: zod.string({
        label: "ID",
        disabled: true,  // Feld ist immer deaktiviert
        hidden: true
    }).optional(),

    status: zod.select(
        [
            { label: "Aktiv", value: "ACTIVE" },
            { label: "Inaktiv", value: "INACTIVE" },
            { label: "Gesperrt", value: "LOCKED" }
        ],
        { label: "Status" }
    ).optional(),
});

// User Schema mit einem deaktivierten Feld
export const userSchema = z.object({
    id: zod.string({ label: "", hidden: true }).optional(),
    firstname: zod.string({
        label: "Vorname",
        placeholder: "Vorname eingeben"
    }).min(2, "Vorname muss mindestens 2 Zeichen lang sein"),
    lastname: zod.string({
        label: "Nachname",
        placeholder: "Nachname eingeben"
    }).min(2, "Nachname muss mindestens 2 Zeichen lang sein"),
    email: zod.email({
        label: "E-Mail Adresse",
        placeholder: "email@example.com"
    }),
    alias: zod.string({
        label: "Alias",
        placeholder: "Spitzname oder Erkennungsmerkmal",
        description: "Der Alias wird von Unternehmen verwendet um dich besser zuordnen zu können.",
    }).min(2, "Alias muss mindestens 2 Zeichen lang sein"),
    // Neues Feld 'generatedId', das immer deaktiviert ist
    generatedId: zod.string({
        label: "Generierte ID",
        description: "Diese ID wird automatisch generiert",
        disabled: true,  // Dieses Feld ist immer deaktiviert
        placeholder: "Wird automatisch generiert"
    }).optional(),
});

// Group Schema
export const groupSchema = z.object({
    id: zod.string({ label: "", hidden: true }).optional(),
    name: zod.string({ label: "Name" })
        .min(1, "Name muss mindestens 1 Zeichen lang sein."),
    description: zod.textarea({
        label: "Beschreibung"
    }).min(1, "Die Beschreibung darf nicht leer sein."),
    maxUsers: zod.number({
        label: "Maximale Teilnehmer",
        description: "Maximale Benutzeranzahl"
    }).optional(),
    days: zod.multiSelect(
        [
            { label: "Montag", value: "Mo" },
            { label: "Dienstag", value: "Di" },
            { label: "Mittwoch", value: "Mi" },
            { label: "Donnerstag", value: "Do" },
            { label: "Freitag", value: "Fr" },
            { label: "Samstag", value: "Sa" },
            { label: "Sonntag", value: "So" }
        ],
        { label: "Wochentage" }
    ),
});

// Company Schema mit deaktivierten Feldern
export const companySchema = z.object({
    id: zod.string({
        label: "ID",
        hidden: true,
        disabled: true
    }).optional(),
    name: zod.string({
        label: "Unternehmens Name",
        placeholder: "Muster GmbH"
    }).min(2, "Name muss mindestens 2 Zeichen lang sein"),
    description: zod.textarea({
        label: "Unternehmens Beschreibung",
        placeholder: "Kurze Beschreibung Ihres Unternehmens"
    }),
    zip: zod.number({
        label: "Postleitzahl",
        placeholder: "12345"
    }).min(1),
    city: zod.string({
        label: "Stadt",
        placeholder: "Berlin"
    }).min(1),
    street: zod.string({
        label: "Straße",
        placeholder: "Musterstraße 123"
    }).min(1, "Straße muss mindestens 1 Zeichen haben."),
    country: zod.select(
        [{ label: "Deutschland", value: "DE" }],
        {
            label: "Land",
            description: "Zum aktuellen Zeitpunkt steht nur Deutschland zur Verfügung.",
            disabled: true  // Land kann nicht geändert werden
        }
    ),
    email: zod.email({
        label: "E-Mail Adresse",
        placeholder: "kontakt@firma.de"
    }).min(1),
    phone: zod.string({
        label: "Telefonnummer",
        placeholder: "+49 123 4567890"
    }).optional(),
    website: zod.string({
        label: "Webseite",
        placeholder: "https://www.meinefirma.de",
        description: "Gib eine Webseite oder eine öffentliche Social Media Seite von dir an."
    }).optional(),
    privacyUrls: zod.textarea({
        label: "Datenschutz URLs",
        placeholder: "https://datenschutz.firma.de, https://agb.firma.de",
        description: "Eigene URLs für den Datenschutz, AGBs usw. (kommasepariert)."
    }).optional()
});

// Bank Details Schema
export const bankDetailsSchema = z.object({
    accountName: zod.string({
        label: "Name auf dem Konto",
        placeholder: "Max Mustermann / Muster GmbH"
    }).min(1, "Name auf dem Konto muss mindestens 1 Zeichen lang sein"),
    bankName: zod.string({
        label: "Name der Bank",
        placeholder: "Sparkasse / Deutsche Bank"
    }).min(1, "Bankname muss mindestens 1 Zeichen lang sein."),
    iban: zod.string({
        label: "IBAN",
        placeholder: "DE89 3704 0044 0532 0130 00"
    }).min(2, "Name muss mindestens 2 Zeichen lang sein"),
    bic: zod.string({
        label: "BIC",
        placeholder: "DEUTDEFFXXX"
    }),
    purposeOfUse: zod.string({
        label: "Verwendungszweck",
        placeholder: "Rechnungsnummer / Kundenreferenz"
    }).optional(),
});

// Product Schema
export const productSchema = z.object({
    id: zod.string({
        label: "",
        disabled: true,
        hidden: true
    }).optional(),
    name: zod.string({
        label: "Name",
        placeholder: "Produktname"
    }).min(1, "Name muss mindestens 1 Zeichen enthalten."),
    description: zod.textarea({
        label: "Beschreibung",
        placeholder: "Produktbeschreibung"
    }).optional(),
    advantages: zod.textarea({
        label: "Vorteile",
        description: "Kommaseparieren, um mehrere Vorteile zu nennen.",
        placeholder: "schnell, günstig, nachhaltig"
    }).optional(),
    price: zod.number({
        label: "Preis des Produkts (in Euro)",
        placeholder: "19.99"
    }).min(0, "Preis muss größer oder gleich 0 sein"),
    count: zod.number({
        label: "Anzahl der Stempel",
        placeholder: "10"
    }),
    highlight: zod.boolean({
        label: "Produkt Hervorheben",
        description: "Soll das Produkt hervorgehoben werden?"
    }),
});

// Note Schema
export const noteSchema = z.object({
    id: zod.string({ label: " ", hidden: true }).optional(),
    type: zod.string({ label: " ", hidden: true }).optional(),
    noteId: zod.string({ label: " ", hidden: true }).optional(),
    title: zod.string({
        label: "Überschrift",
        placeholder: "Notiz-Titel"
    }).min(2, "Title muss mindestens 2 Zeichen enthalten."),
    content: zod.textarea({
        label: "Inhalt",
        placeholder: "Notizinhalt..."
    }).min(2, "Inhalt muss mindestens 2 Zeichen enthalten."),
    publicNote: zod.boolean({
        label: "Öffentlich einsehbar",
        description: "Soll die Notiz öffentlich für die Person/ Gruppe einsehbar sein?"
    }).optional(),
});

// StampCard Schema
export const stampCardSchema = z.object({
    id: zod.string({ label: "ID", hidden: true }).optional(),
    name: zod.string({
        label: "Name der Stempelkarte",
        placeholder: "z.B. Kaffeekarte, Treuekarte"
    }).min(2, "Name muss mindestens 2 Zeichen lang sein"),
    description: zod.textarea({
        label: "Beschreibung",
        placeholder: "Details zur Stempelkarte"
    }).optional(),
    maxStamps: zod.number({
        label: "Maximale Stempelanzahl",
        placeholder: "10"
    }).min(1),
});

// Stamp Schema
export const stampSchema = z.object({
    id: zod.string({ label: "ID", hidden: true }).optional(),
    cardId: zod.string({
        label: "Stempelkarten ID",
        hidden: true
    }),
    stampDate: zod.string({
        label: "Stempeldatum",
        placeholder: "01.01.2023"
    }),
    stampedBy: zod.string({
        label: "Gestempelt von",
        placeholder: "Name des Mitarbeiters"
    }),
    note: zod.textarea({
        label: "Notiz",
        placeholder: "Optionale Bemerkung zum Stempel"
    }).optional(),
});

// Plan Schema
export const planSchema = z.object({
    groupFromId: zod.string({
        label: "",
        hidden: true,
        disabled: true
    }),
    userId: zod.select(
        [], // Options werden dynamisch übergeben
        {
            label: "Benutzer",
            description: "Benutzer der Verschoben werden soll."
        }
    ),
    groupToId: zod.select(
        [], // Options werden dynamisch übergeben
        {
            label: "Gruppe",
            description: "In die Gruppe in die der Benutzer verschoben werden soll."
        }
    ),
    date: zod.date({
        label: "Datum der Verschiebung"
    }),
});

// Sammlung aller Schemas
export const schemas: Record<SchemaTypes, z.ZodObject<any>> = {
    "user-admin": userAdminSchema,
    "user": userSchema,
    "group": groupSchema,
    "company": companySchema,
    "bankDetails": bankDetailsSchema,
    "product": productSchema,
    "note": noteSchema,
    "stampCard": stampCardSchema,
    "stamp": stampSchema,
    "plan": planSchema,
};

// Export der Schemas-Typen für die Typisierung
export type ZodSchemas = typeof schemas;
