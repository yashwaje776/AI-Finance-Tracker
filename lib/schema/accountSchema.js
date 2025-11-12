import { z } from "zod";

export const accountSchema = z.object({
  name: z
    .string()
    .min(2, "Account name must be at least 2 characters long")
    .max(50, "Account name must be under 50 characters"),
    
  type: z.enum(["CURRENT", "SAVINGS"], {
    required_error: "Please select an account type",
  }),

  balance: z.coerce
    .number({
      required_error: "Please enter an initial balance",
      invalid_type_error: "Balance must be a number",
    })
    .min(0, "Balance cannot be negative"),

  isDefault: z.boolean().optional().default(false),
});
