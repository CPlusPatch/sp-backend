import { z } from "zod";
import type { Json } from "./responses";

export const zJson = z
    .unknown()
    .refine(
        (value) => {
            try {
                JSON.parse(JSON.stringify(value) as string);
                return true;
            } catch {
                return false;
            }
        },
        { message: "Invalid JSON" },
    )
    .transform((value) => value as Json);

export const DataRowSchema = z.object({
    tags: z.array(z.string()).default([]),
    title: z.string().min(1).nullable().optional(),
    image: z.string().url().nullable().optional(),
    links: z.array(z.string().url()).default([]),
    // Any JSON value
    data: zJson.nullable().optional(),
    content: z.string().nullable().optional(),
});

export const FullDataRowSchema = DataRowSchema.merge(
    z.object({
        id: z.number().int(),
        created_at: z.string(),
    }),
);
