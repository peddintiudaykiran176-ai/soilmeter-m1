import { sql } from "drizzle-orm";
import {
  check,
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "users_name_length",
      sql`char_length(btrim(${table.name})) BETWEEN 2 AND 100`,
    ),
    check(
      "users_email_normalized",
      sql`${table.email} = lower(btrim(${table.email}))`,
    ),
    check(
      "users_email_length",
      sql`char_length(${table.email}) BETWEEN 3 AND 254`,
    ),
    check(
      "users_password_hash_not_empty",
      sql`length(${table.passwordHash}) > 0`,
    ),
    unique("users_email_unique").on(table.email),
  ],
);

export const devices = pgTable(
  "devices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    deviceId: text("device_id").notNull(),
    fieldName: text("field_name").notNull(),
    cropType: text("crop_type").notNull(),
    latitude: doublePrecision("latitude"),
    longitude: doublePrecision("longitude"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", {
      withTimezone: true,
      mode: "date",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    check(
      "devices_device_id_length",
      sql`char_length(btrim(${table.deviceId})) BETWEEN 2 AND 128`,
    ),
    check(
      "devices_field_name_length",
      sql`char_length(btrim(${table.fieldName})) BETWEEN 2 AND 120`,
    ),
    check(
      "devices_crop_type_length",
      sql`char_length(btrim(${table.cropType})) BETWEEN 1 AND 80`,
    ),
    check(
      "devices_coordinates_pair",
      sql`(${table.latitude} IS NULL AND ${table.longitude} IS NULL) OR (${table.latitude} IS NOT NULL AND ${table.longitude} IS NOT NULL)`,
    ),
    check(
      "devices_latitude_bounds",
      sql`${table.latitude} IS NULL OR ${table.latitude} BETWEEN -90 AND 90`,
    ),
    check(
      "devices_longitude_bounds",
      sql`${table.longitude} IS NULL OR ${table.longitude} BETWEEN -180 AND 180`,
    ),
    check(
      "devices_status_valid",
      sql`${table.status} IN ('pending', 'verified', 'inactive')`,
    ),
    unique("devices_device_id_unique").on(table.deviceId),
    index("devices_user_id_idx").on(table.userId),
  ],
);
