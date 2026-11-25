CREATE TABLE IF NOT EXISTS devices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id text NOT NULL,
  field_name text NOT NULL,
  crop_type text NOT NULL,
  latitude double precision,
  longitude double precision,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT devices_device_id_length CHECK (
    char_length(btrim(device_id)) BETWEEN 2 AND 128
  ),
  CONSTRAINT devices_field_name_length CHECK (
    char_length(btrim(field_name)) BETWEEN 2 AND 120
  ),
  CONSTRAINT devices_crop_type_length CHECK (
    char_length(btrim(crop_type)) BETWEEN 1 AND 80
  ),
  CONSTRAINT devices_coordinates_pair CHECK (
    (latitude IS NULL AND longitude IS NULL) OR
    (latitude IS NOT NULL AND longitude IS NOT NULL)
  ),
  CONSTRAINT devices_latitude_bounds CHECK (
    latitude IS NULL OR latitude BETWEEN -90 AND 90
  ),
  CONSTRAINT devices_longitude_bounds CHECK (
    longitude IS NULL OR longitude BETWEEN -180 AND 180
  ),
  CONSTRAINT devices_status_valid CHECK (
    status IN ('pending', 'verified', 'inactive')
  ),
  CONSTRAINT devices_device_id_unique UNIQUE (device_id)
);

CREATE INDEX IF NOT EXISTS devices_user_id_idx ON devices (user_id);
