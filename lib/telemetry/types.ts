export type UploadType = "manual" | "automatic" | "historical";

export type TelemetryRecord = {
  id: string;
  deviceId: string;
  message: string;
  moisture: number | null;
  timestampUtc: string | null;
  uploadType: UploadType;
};

export type TelemetryHistoryApiRecord = {
  id: string;
  device_id: string;
  message: string;
  moisture: number | null;
  created_at: string | null;
  upload_type: UploadType;
};

export type TelemetryHistoryPagination = {
  page: number;
  page_size: number;
  total_records: number;
  total_pages: number;
};

export type TelemetryHistoryResponse = {
  records: TelemetryHistoryApiRecord[];
  pagination: TelemetryHistoryPagination;
};

export function classifyUploadMessage(message: string): UploadType {
  if (message === "Manual button upload") {
    return "manual";
  }

  if (message === "Hourly latest moisture reading") {
    return "automatic";
  }

  return "historical";
}
