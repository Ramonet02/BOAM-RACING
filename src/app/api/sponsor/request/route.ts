/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Envío de una solicitud de patrocinio, con la lámina adjunta
   --------------------------------------------------------------------------
   El formulario del configurador llevaba toda la vida a un `mailto:`, y un
   `mailto:` NO puede llevar adjuntos: no existe parámetro para ello en el
   esquema (RFC 6068), y ningún cliente de correo lo acepta. Para que al equipo
   le llegue el PNG de lo que el cliente ha rotulado hace falta que salga de un
   servidor. Esto es ese servidor.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  SIN CLAVE CONFIGURADA, ESTO DEVUELVE 503 A PROPÓSITO                 ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   El repo no trae credenciales y no puede inventárselas. Si falta
   `RESEND_API_KEY`, la ruta responde 503 con `reason: "not-configured"` y el
   diálogo lo entiende: descarga las láminas y abre el correo del usuario con
   todo relleno, para que las adjunte a mano. Es un peldaño peor, pero funciona
   hoy y sin dar de alta nada.

   El día que el equipo cree su clave, el envío pasa a ser automático sin tocar
   una línea. Las tres variables van en `.env.local`:

       RESEND_API_KEY=re_xxxxxxxx
       SPONSOR_MAIL_FROM=web@boamracing.com   # dominio verificado en Resend
       SPONSOR_MAIL_TO=hola@boamracing.com    # opcional; por defecto, FROM

   Se habla con la API HTTP de Resend con `fetch` pelado en vez de instalar su
   SDK: es un POST con JSON. Una dependencia más en el bundle del servidor para
   ahorrar quince líneas no sale a cuenta.
   ══════════════════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";

/* Node, no Edge: aquí se manejan adjuntos de varios megas en base64 y se
   usa `Buffer` para medirlos. */
export const runtime = "nodejs";

/* ─────────────────────────────────────────────────────────────────────────
   1. Límites
   ───────────────────────────────────────────────────────────────────────── */

/** Total de adjuntos ya decodificados. Cinco láminas caben de sobra. */
const MAX_ATTACHMENT_BYTES = 6 * 1024 * 1024;
const MAX_ATTACHMENTS = 6;
const MAX_FIELD_CHARS = 4000;

/** Ventana y cupo del limitador por IP. */
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;

/**
 * Limitador en memoria.
 *
 * Es honestamente flojo: vive en el proceso, así que con varias instancias
 * cada una lleva su cuenta, y un despliegue lo reinicia. No pretende frenar a
 * nadie decidido — para eso hace falta un almacén compartido o el limitador
 * del proveedor. Lo que sí evita es que un formulario abierto en bucle acabe
 * en una factura, que es el accidente probable aquí.
 */
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);

  // Poda barata: sin esto el Map crece con cada IP que pase por aquí.
  if (hits.size > 500) {
    for (const [key, times] of hits) {
      if (times.every((time) => now - time >= RATE_WINDOW_MS)) hits.delete(key);
    }
  }

  return recent.length > RATE_LIMIT;
}

/* ─────────────────────────────────────────────────────────────────────────
   2. Saneado
   ───────────────────────────────────────────────────────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Deja un valor apto para una CABECERA de correo.
 *
 * Los saltos de línea son lo único que importa de verdad: un `\r\n` dentro del
 * asunto o del `reply_to` permite inyectar cabeceras nuevas —un `Bcc:`, por
 * ejemplo— y convertir el formulario en un relé de spam. Aquí el asunto lo
 * compone el servidor, pero lleva dentro el nombre de la empresa, que lo
 * teclea quien quiera.
 */
function headerSafe(value: unknown, max = 200): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]+/g, " ").trim().slice(0, max);
}

/** Texto de cuerpo: se conservan los saltos, se recorta la longitud. */
function bodySafe(value: unknown, max = MAX_FIELD_CHARS): string {
  if (typeof value !== "string") return "";
  return value.slice(0, max);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Nombre de adjunto sin rutas: nadie escribe fuera de donde debe. */
function safeFilename(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  const base = value.split(/[\\/]/).pop() ?? fallback;
  const clean = base.replace(/[^A-Za-z0-9._-]/g, "-").slice(0, 80);
  return clean.length > 0 ? clean : fallback;
}

/* ─────────────────────────────────────────────────────────────────────────
   3. Contrato
   ───────────────────────────────────────────────────────────────────────── */

interface IncomingAttachment {
  readonly filename: string;
  /** PNG en base64, SIN el prefijo `data:`. */
  readonly content: string;
}

interface ParsedRequest {
  readonly name: string;
  readonly company: string;
  readonly email: string;
  readonly phone: string;
  readonly tier: string;
  readonly message: string;
  readonly summary: string;
  readonly attachments: readonly IncomingAttachment[];
}

type ParseResult =
  | { readonly ok: true; readonly value: ParsedRequest }
  | { readonly ok: false; readonly error: string };

function parseBody(raw: unknown): ParseResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "invalid-body" };
  const body = raw as Record<string, unknown>;

  if (body.consent !== true) return { ok: false, error: "consent-required" };

  const email = headerSafe(body.email, 120);
  if (!EMAIL_RE.test(email)) return { ok: false, error: "invalid-email" };

  const name = headerSafe(body.name, 120);
  const company = headerSafe(body.company, 120);
  if (name.length === 0 || company.length === 0) return { ok: false, error: "missing-fields" };

  const attachments: IncomingAttachment[] = [];
  let bytes = 0;

  if (Array.isArray(body.attachments)) {
    if (body.attachments.length > MAX_ATTACHMENTS) {
      return { ok: false, error: "too-many-attachments" };
    }
    for (const [index, entry] of body.attachments.entries()) {
      if (!entry || typeof entry !== "object") continue;
      const item = entry as Record<string, unknown>;
      const content = typeof item.content === "string" ? item.content : "";
      // Base64 puro: cualquier otra cosa no es una lámina nuestra.
      if (!/^[A-Za-z0-9+/=\s]+$/.test(content) || content.length === 0) {
        return { ok: false, error: "invalid-attachment" };
      }
      bytes += Buffer.byteLength(content, "base64");
      if (bytes > MAX_ATTACHMENT_BYTES) return { ok: false, error: "attachments-too-large" };
      attachments.push({
        filename: safeFilename(item.filename, `boam-${index + 1}.png`),
        content: content.replace(/\s+/g, ""),
      });
    }
  }

  return {
    ok: true,
    value: {
      name,
      company,
      email,
      phone: headerSafe(body.phone, 60),
      tier: headerSafe(body.tier, 60),
      message: bodySafe(body.message),
      summary: bodySafe(body.summary),
      attachments,
    },
  };
}

/* ─────────────────────────────────────────────────────────────────────────
   4. Envío
   ───────────────────────────────────────────────────────────────────────── */

function buildHtml(request: ParsedRequest): string {
  const rows: readonly (readonly [string, string])[] = [
    ["Nombre", request.name],
    ["Empresa", request.company],
    ["Email", request.email],
    ["Teléfono", request.phone || "—"],
    ["Nivel", request.tier || "—"],
  ];

  return [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#1F1B16">',
    "<h2 style=\"margin:0 0 16px\">Solicitud de patrocinio</h2>",
    '<table cellpadding="4" style="border-collapse:collapse;margin-bottom:20px">',
    ...rows.map(
      ([label, value]) =>
        `<tr><td style="color:#8C8477">${escapeHtml(label)}</td>` +
        `<td><strong>${escapeHtml(value)}</strong></td></tr>`,
    ),
    "</table>",
    `<pre style="white-space:pre-wrap;font-family:inherit;background:#FAF7F1;padding:14px">${escapeHtml(
      request.summary,
    )}</pre>`,
    request.message
      ? `<h3 style="margin:20px 0 6px">Mensaje</h3><pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(
          request.message,
        )}</pre>`
      : "",
    request.attachments.length > 0
      ? `<p style="color:#8C8477;margin-top:20px">${request.attachments.length} lámina(s) del rotulado adjuntas.</p>`
      : "",
    "</div>",
  ].join("");
}

export async function POST(request: Request): Promise<NextResponse> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SPONSOR_MAIL_FROM;

  /* 503, no 500: el cliente NO ha hecho nada mal y la diferencia le importa
     — con un 5xx genérico el diálogo diría "ha fallado el envío" cuando lo
     correcto es pasar al plan B sin alarmar a nadie. */
  if (!apiKey || !from) {
    return NextResponse.json(
      { ok: false, reason: "not-configured" },
      { status: 503 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, reason: "rate-limited" }, { status: 429 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid-json" }, { status: 400 });
  }

  const parsed = parseBody(payload);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, reason: parsed.error }, { status: 400 });
  }

  const data = parsed.value;
  const to = process.env.SPONSOR_MAIL_TO || from;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        /* `reply_to`, NO `from`: remitir desde la dirección del cliente
           rompería SPF/DKIM del dominio del equipo y el correo acabaría en
           spam. Así el sobre lo firma el dominio propio y "Responder" sigue
           yendo al patrocinador. */
        reply_to: data.email,
        subject: `Patrocinio · ${data.company} · ${data.name}`,
        html: buildHtml(data),
        attachments: data.attachments.map((attachment) => ({
          filename: attachment.filename,
          content: attachment.content,
        })),
      }),
    });

    if (!response.ok) {
      /* El detalle del proveedor va al log del servidor, nunca al navegador:
         un mensaje de error de la API de correo puede llevar dentro la
         dirección de origen o el motivo exacto del rechazo. */
      console.error("[BOAM · patrocinio] Resend respondió", response.status, await response.text());
      return NextResponse.json({ ok: false, reason: "provider-error" }, { status: 502 });
    }
  } catch (error) {
    console.error("[BOAM · patrocinio] Fallo al enviar", error);
    return NextResponse.json({ ok: false, reason: "network-error" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
