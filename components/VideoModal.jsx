"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function VideoModal({ isOpen, onClose, videoUrl }) {
  if (!videoUrl) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[80vw] max-h-[80vh] p-0 bg-black">
        <div className="relative w-full h-full flex items-center justify-center">
          <video 
            src={videoUrl} 
            controls 
            autoPlay
            className="max-w-full max-h-[80vh]"
            style={{ 
              width: "100%",
              height: "auto",
              maxHeight: "80vh"
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}