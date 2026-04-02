/**
 * Validation Schemas for Edge Functions
 * Using Zod for runtime type validation
 */

import { z } from "https://deno.land/x/zod/mod.ts";

// Common schemas
export const UuidSchema = z.string().uuid();
export const EmailSchema = z.string().email();

/**
 * MailerLite Sync Request Schema
 */
export const MailerliteSyncSchema = z.object({
  email: EmailSchema.max(255),
  name: z.string().min(2).max(100),
  tier: z.enum(["essential", "elite", "private"]),
  userId: UuidSchema,
});

/**
 * PayFast Checkout Request Schema
 */
export const PayFastCheckoutItemSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
});

export const PayFastCheckoutSchema = z.object({
  items: z.array(PayFastCheckoutItemSchema).min(1),
  return_url: z.string().url().optional().or(z.literal("")),
  cancel_url: z.string().url().optional().or(z.literal("")),
  subscription_tier: z.enum(["essential", "elite", "private"]).optional().nullable(),
});

/**
 * Import Strains Schema
 */
export const StrainDataSchema = z.object({
  name: z.string().min(1).max(200),
  img_url: z.string().url().optional().or(z.literal("")),
  type: z.enum(["indica", "sativa", "hybrid", "Indica", "Sativa", "Hybrid"]),
  thc_level: z.string().optional(),
  most_common_terpene: z.string().optional(),
  description: z.string().optional(),
  effects: z.record(z.string()).optional(),
});

export const ImportStrainsSchema = z.object({
  data: z.array(StrainDataSchema).min(1),
});

/**
 * Import Culture Items Schema
 */
export const CultureItemSchema = z.object({
  name: z.string().min(1).max(200),
  img_url: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  type: z.string().optional(),
  year: z.string().optional(),
  era: z.string().optional(),
  feelings: z.record(z.string()).optional(),
  designer: z.string().optional(),
  artist: z.string().optional(),
  manufacturer: z.string().optional(),
  origin: z.string().optional(),
  most_common_material: z.string().optional(),
  most_common_medium: z.string().optional(),
  most_common_engine: z.string().optional(),
  most_common_form: z.string().optional(),
});

export const ImportCultureItemsSchema = z.object({
  category: z.enum(["artwork", "cars", "fashion", "wellness", "leafly"]),
  data: z.array(CultureItemSchema).min(1),
});

/**
 * Shipday Update Schema
 */
export const ShipdayUpdateSchema = z.object({
  order_id: z.string().uuid(),
  status: z.string(),
  tracking_number: z.string().optional(),
  estimated_delivery: z.string().optional(),
});

/**
 * Post to Shipday Schema
 */
export const PostToShipdaySchema = z.object({
  order_id: UuidSchema,
  delivery_id: z.string().uuid().optional(),
  pickup_address: z.string().optional(),
  delivery_address: z.string().min(1),
  customer_name: z.string().min(2),
  customer_email: EmailSchema.optional().or(z.literal("")),
  customer_phone: z.string().optional().or(z.literal("")),
  order_items: z.array(z.object({
    name: z.string(),
    quantity: z.number().int().positive(),
  })).optional(),
  priority: z.enum(["normal", "rush"]).optional(),
  admin_notes: z.string().optional(),
  courier_name: z.string().optional(),
});

/**
 * Helper function to validate request body
 */
export function validateRequest<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: boolean; data?: z.infer<T>; error?: string } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e: any) => `${e.path.join(".")}: ${e.message}`).join(", ");
      return { success: false, error: `Validation failed: ${messages}` };
    }
    return { success: false, error: "Invalid request format" };
  }
}
