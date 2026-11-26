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
      <DialogContent className="flex h-[min(680px,calc(100dvh-1rem))] w-[calc(100%-1rem)] max-w-2xl flex-col gap-3 overflow-hidden p-3 sm:h-[min(700px,calc(100dvh-2rem))] sm:gap-4 sm:p-6">
        <DialogHeader className="shrink-0 pr-8">
          <DialogTitle>Connect another SoilMeter</DialogTitle>
          <DialogDescription>
            Follow the steps to add a device and its field details.
          </DialogDescription>
        </DialogHeader>
        <DeviceRegistrationForm
          className="flex-1"
          onCancel={() => onOpenChange(false)}
          onDeviceConnected={onDeviceConnected}
        />
      </DialogContent>
    </Dialog>
  );
}
