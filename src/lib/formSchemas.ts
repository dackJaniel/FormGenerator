import { Props } from "@/components/AutoForm";
import { z } from "zod";

export type SchemaTypes = "all";

export function getFormSchema(type: string): Props[] | undefined {
    switch (type) {
        case "all":
            return [
                {
                    type: 'string',
                    name: 'Name',
                    defaultValue: 'Daniel',
                    validator: z.string().min(2).max(50),
                },
                {
                    type: 'email',
                    name: 'Email',
                    defaultValue: 'hallo@123.de',
                    validator: z.string().email().optional(),
                },
                {
                    type: 'number',
                    name: 'Number',
                    defaultValue: '123',
                    validator: z.coerce.number().positive(),
                },
                {
                    type: 'textarea',
                    name: 'Desctiption',
                    defaultValue: 'Ganz langer Text...',
                    validator: z.string().min(2).optional(),
                },
                {
                    type: 'string',
                    name: 'Benutzername',
                    description:
                        'Muss zwischen 3 und 15 Zeichen lang sein und mit einem Großbuchstaben beginnen',
                    validator: z
                        .string()
                        .min(3, {
                            message: 'Benutzername muss mindestens 3 Zeichen lang sein',
                        })
                        .max(15, {
                            message: 'Benutzername darf maximal 15 Zeichen lang sein',
                        })
                        .regex(/^[A-Z]/, {
                            message: 'Benutzername muss mit einem Großbuchstaben beginnen',
                        }),
                },
                {
                    type: 'multi-select',
                    name: 'Multi-Auswahl',
                    options: [
                        { label: 'OP1', value: 'OP1' },
                        { label: 'OP2', value: 'OP2' },
                        { label: 'OP3', value: 'OP3' },
                    ],
                    placeholder: 'Optionen auswählen...',
                    description: 'Bitte wähle eine oder mehrere Optionen aus',
                    defaultValue: { label: 'OP2', value: 'OP2' },
                    validator: z
                        .array(
                            z.object({
                                value: z.string(),
                                label: z.string(),
                            })
                        )
                        .optional(),
                },
                {
                    type: 'select',
                    name: 'Einzelauswahl',
                    options: [
                        { label: 'Option 1', value: 'opt1' },
                        { label: 'Option 2', value: 'opt2' },
                        { label: 'Option 3', value: 'opt3' },
                    ],
                    description: 'Bitte wähle eine Option aus',
                    defaultValue: { label: 'Option 2', value: 'opt2' },
                    validator: z.string().min(1),
                },
                {
                    type: 'checkbox',
                    name: 'AGB akzeptieren',
                    description: 'Bitte akzeptiere unsere AGB',
                    defaultValue: true,
                    validator: z.boolean().refine((val) => val === true, {
                        message: 'Du musst die AGB akzeptieren',
                    }),
                },
                {
                    type: 'switch',
                    name: 'AGB akzeptieren',
                    description: 'Bitte akzeptiere unsere AGB',
                    defaultValue: true,
                    validator: z.boolean().refine((val) => val === true, {
                        message: 'Du musst die AGB akzeptieren',
                    }),
                },
            ]
    }
}