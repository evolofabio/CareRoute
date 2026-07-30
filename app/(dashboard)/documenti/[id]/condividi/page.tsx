"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { useDemo } from "@/lib/demo/DemoProvider";
import * as demo from "@/lib/demo/store";

export default function CondividiDocumentoPage() {
  const { session } = useDemo();
  const params = useParams<{ id: string }>();
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expires, setExpires] = useState<string | null>(null);

  const doc = useMemo(() => {
    if (!session) return null;
    return demo.getDocuments(session.care_group_id).find((d) => d.id === params.id) ?? null;
  }, [session, params.id]);

  if (!session || !doc) {
    return <div className="px-5 py-10 text-muted">Documento non trovato.</div>;
  }

  return (
    <div className="px-5 pb-28 pt-2">
      <h1 className="font-display text-3xl font-semibold">Condividi</h1>
      <p className="mt-1 text-sm text-muted">{doc.title}</p>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        Genera un link temporaneo con QR per il medico. Scade automaticamente e limita le visualizzazioni.
      </p>

      <button
        data-touch
        className="cr-btn cr-btn-primary mt-6 w-full"
        onClick={() => {
          const share = demo.createShare(doc.id, session.id, 24);
          const origin = typeof window !== "undefined" ? window.location.origin : "";
          setShareUrl(`${origin}/condividi/${share.token}`);
          setExpires(share.expires_at);
        }}
      >
        Genera link 24 ore
      </button>

      {shareUrl && (
        <div className="mt-6 flex flex-col items-center rounded-3xl border border-line bg-white p-6 text-center">
          <QRCodeSVG value={shareUrl} size={180} bgColor="#FFFFFF" fgColor="#1A4D3E" />
          <p className="mt-4 break-all text-xs text-muted">{shareUrl}</p>
          <p className="mt-2 text-sm font-semibold text-alert">
            Scade: {expires ? new Date(expires).toLocaleString("it-IT") : ""}
          </p>
          <button
            data-touch
            className="cr-btn cr-btn-secondary mt-4 w-full"
            onClick={() => navigator.clipboard.writeText(shareUrl)}
          >
            Copia link
          </button>
        </div>
      )}
    </div>
  );
}
