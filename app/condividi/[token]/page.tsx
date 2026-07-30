"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CareRouteLogo } from "@/components/shared/CareRouteLogo";
import * as demo from "@/lib/demo/store";
import type { DocumentRecord, DocumentShare } from "@/types/database";

export default function PublicSharePage() {
  const params = useParams<{ token: string }>();
  const [data, setData] = useState<{ share: DocumentShare; document: DocumentRecord | null } | null>(null);

  useEffect(() => {
    setData(demo.getShareByToken(params.token));
  }, [params.token]);

  const expired = data?.share ? new Date(data.share.expires_at) < new Date() : false;
  const exhausted = data?.share ? data.share.view_count >= data.share.max_views : false;

  return (
    <div className="cr-atmosphere min-h-dvh">
      <div className="cr-shell px-5 py-10">
        <CareRouteLogo size="sm" />
        <h1 className="mt-8 font-display text-3xl font-semibold">Documento condiviso</h1>
        {!data && <p className="mt-3 text-muted">Link non valido o scaduto.</p>}
        {data && (expired || exhausted) && (
          <p className="mt-3 font-semibold text-sos">Questo link non è più disponibile.</p>
        )}
        {data && !expired && !exhausted && data.document && (
          <div className="mt-6 rounded-3xl border border-line bg-white/85 p-5">
            <p className="text-sm font-bold uppercase tracking-wide text-muted">Vault CareRoute</p>
            <p className="mt-2 font-display text-2xl font-semibold">{data.document.title}</p>
            <p className="mt-2 text-sm text-muted">
              Accesso temporaneo · scade{" "}
              {new Date(data.share.expires_at).toLocaleString("it-IT")} ·{" "}
              {data.share.max_views - data.share.view_count} visualizzazioni residue
            </p>
            <a href={data.document.file_url} className="cr-btn cr-btn-primary mt-6 w-full">
              Apri documento (demo)
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
