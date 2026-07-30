"use client";

import { Phone } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmergencyButton({
  phone,
  doctorPhone,
  className,
}: {
  phone?: string | null;
  doctorPhone?: string | null;
  className?: string;
}) {
  const primary = phone || "112";
  return (
    <div className={cn("grid gap-2", doctorPhone ? "grid-cols-2" : "grid-cols-1", className)}>
      <a
        href={`tel:${primary}`}
        data-touch
        className="cr-btn cr-btn-sos shadow-[0_12px_30px_-12px_rgba(201,59,59,0.7)]"
      >
        <Phone className="h-5 w-5" />
        SOS / Emergenza
      </a>
      {doctorPhone && (
        <a href={`tel:${doctorPhone}`} data-touch className="cr-btn cr-btn-secondary">
          <Phone className="h-5 w-5 text-pine" />
          Medico
        </a>
      )}
    </div>
  );
}
