"use client";

import { DeviceRegistrationForm } from "@/components/devices/device-registration-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type AddDeviceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeviceConnected: (deviceId: string) => void;
};

export function AddDeviceDialog({
  open,
  onOpenChange,
  onDeviceConnected,
}: AddDeviceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle>Connect another SoilMeter</DialogTitle>
          <DialogDescription>
            Add the field details and verify the device ID to connect it to your
            dashboard.
          </DialogDescription>
        </DialogHeader>
        <DeviceRegistrationForm onDeviceConnected={onDeviceConnected} />
      </DialogContent>
    </Dialog>
  );
}
