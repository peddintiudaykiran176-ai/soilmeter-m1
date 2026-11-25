import { z } from "zod";

export const cropTypes = ["Tomato", "Corn", "Lettuce", "Other"] as const;

export const deviceRegistrationSchema = z
  .object({
    device_id: z
      .string()
      .trim()
      .min(2, "Enter a valid device ID or hardware MAC.")
      .max(128, "Device IDs must be 128 characters or fewer.")
      .regex(
        /^[A-Za-z0-9][A-Za-z0-9._:-]*$/,
        "Use letters, numbers, hyphens, colons, underscores, or periods.",
      ),
    field_name: z
      .string()
      .trim()
      .min(2, "Enter a field name.")
      .max(120, "Field names must be 120 characters or fewer."),
    crop_type: z.enum(cropTypes),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
  })
  .strict()
  .superRefine((device, context) => {
    if ((device.latitude === null) !== (device.longitude === null)) {
      context.addIssue({
        code: "custom",
        message: "Enter both coordinates or leave both blank.",
        path: ["latitude"],
      });
    }
  });

export const connectedDeviceSchema = z.object({
  id: z.string().uuid(),
  field_name: z.string(),
  crop_type: z.enum(cropTypes),
  status: z.literal("verified"),
  moisture: z.number().finite().nullable(),
  last_reading_at: z.string().nullable(),
});

export const connectDeviceResponseSchema = z.object({
  device: connectedDeviceSchema,
});
