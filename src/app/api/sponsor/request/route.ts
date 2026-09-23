/* ══════════════════════════════════════════════════════════════════════════
   BOAM RACING — Envío de una solicitud de patrocinio, con la lámina adjunta
   --------------------------------------------------------------------------
   El formulario del configurador llevaba toda la vida a un `mailto:`, y un
   `mailto:` NO puede llevar adjuntos: no existe parámetro para ello en el
   esquema (RFC 6068), y ningún cliente de correo lo acepta. Para que al equipo
   le llegue el PNG de lo que el cliente ha rotulado hace falta que salga de un
   servidor. Esto es ese servidor.

   ╔═══════════════════════════════════════════════════════════════════════╗
   ║  SIN CREDENCIALES CONFIGURADAS, ESTO DEVUELVE 503 A PROPÓSITO         ║
   ╚═══════════════════════════════════════════════════════════════════════╝
   El repo no trae credenciales y no puede inventárselas. Sin ellas, la ruta
   responde 503 con `reason: "not-configured"` y el diálogo lo entiende:
   descarga las láminas y abre el correo del usuario con todo relleno, para
   que las adjunte a mano.

   VÍA PRINCIPAL: el Gmail del equipo (boamracingteam@gmail.com) por SMTP con
   una contraseña de aplicación de Google. En `.env.local`:

       GMAIL_USER=boamracingteam@gmail.com
       GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx
       SPONSOR_MAIL_TO=                       # opcional; por defecto, GMAIL_USER

   VÍA ALTERNATIVA: Resend, solo con dominio propio verificado (Resend no
   envía desde un gmail). Se usa únicamente si no hay credenciales de Gmail.
   Se habla con su API con `fetch` pelado: es un POST con JSON.
   ══════════════════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

import { dict, type Locale } from "@/i18n/translations";
import { DOSSIER } from "@/lib/constants";
import { getSlot } from "@/lib/sponsors";

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
  /* Solo para el acuse al cliente: ids, nunca texto libre. */
  readonly locale: Locale;
  readonly tierId: string;
  readonly slotIds: readonly string[];
}

const LOCALES: readonly Locale[] = ["es", "en", "ca"];
const MAX_SLOT_IDS = 40;

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
      locale: LOCALES.find((locale) => locale === body.locale) ?? "es",
      // Se validan contra el diccionario y `getSlot` al componer el acuse;
      // aquí solo se acotan tipo y cantidad.
      tierId: headerSafe(body.tierId, 20),
      slotIds: Array.isArray(body.slotIds)
        ? body.slotIds
            .filter((id): id is string => typeof id === "string")
            .slice(0, MAX_SLOT_IDS)
            .map((id) => id.slice(0, 40))
        : [],
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

/* ─────────────────────────────────────────────────────────────────────────
   5. Acuse de recibo para el cliente
   ─────────────────────────────────────────────────────────────────────────
   El destinatario es una dirección que teclea CUALQUIERA, así que este correo
   no puede ser un altavoz: no repite nada escrito por el visitante (ni nombre,
   ni empresa, ni mensaje). Lleva un texto fijo del diccionario y un resumen
   que el servidor compone desde ids conocidos — nivel y zonas —, y descarta
   cualquier id que no exista. Lo peor que puede pasar es que a alguien le
   llegue un "gracias por tu interés" que no pidió, y para eso ya está el
   limitador por IP y la frase del pie.

   El enlace al dossier sale de `SITE_URL`, nunca de la cabecera `Host` de la
   petición: esa la pone el cliente, y con ella se podría hacer que el Gmail
   del equipo mandara un enlace a un dominio ajeno. Sin `SITE_URL`, el correo
   va sin enlace.
   ───────────────────────────────────────────────────────────────────────── */

function localizedZone(locale: Locale, slotId: string): string | null {
  const slot = getSlot(slotId);
  if (!slot) return null;
  const copy = dict[locale].sponsors;
  const zones: Readonly<Record<string, string | undefined>> = copy.zones;
  const base = zones[slot.zoneId] ?? slot.label;
  if (slot.view === "lateral-izq") return `${base} · ${copy.sides.left}`;
  if (slot.view === "lateral-der") return `${base} · ${copy.sides.right}`;
  return base;
}

function dossierUrl(): string | null {
  const site = process.env.SITE_URL?.trim();
  if (!site) return null;
  try {
    const url = new URL(DOSSIER.href, site);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function buildConfirmation(data: ParsedRequest): { subject: string; html: string; text: string } {
  const copy = dict[data.locale].sponsors;
  const mail = copy.confirmationEmail;
  const tierLabels: Readonly<Record<string, string | undefined>> = copy.tierLabels;
  const tier = (data.tierId && tierLabels[data.tierId]) || mail.none;
  const zones = data.slotIds
    .map((id) => localizedZone(data.locale, id))
    .filter((zone): zone is string => zone !== null);
  const link = dossierUrl();

  const text = [
    mail.greeting,
    "",
    mail.intro,
    "",
    `${mail.summaryTitle}`,
    `${mail.tierLabel}: ${tier}`,
    `${mail.zonesLabel}: ${zones.length > 0 ? "" : mail.none}`,
    ...zones.map((zone) => `  · ${zone}`),
    ...(link ? ["", mail.dossierLead, link] : []),
    "",
    mail.signoff,
    "",
    "—",
    mail.footer,
  ].join("\n");

  const html = [
    '<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#1F1B16;max-width:560px">',
    `<p>${escapeHtml(mail.greeting)}</p>`,
    `<p>${escapeHtml(mail.intro)}</p>`,
    `<h3 style="margin:24px 0 8px;font-size:15px">${escapeHtml(mail.summaryTitle)}</h3>`,
    '<table cellpadding="4" style="border-collapse:collapse">',
    `<tr><td style="color:#8C8477;vertical-align:top">${escapeHtml(mail.tierLabel)}</td><td><strong>${escapeHtml(tier)}</strong></td></tr>`,
    `<tr><td style="color:#8C8477;vertical-align:top">${escapeHtml(mail.zonesLabel)}</td><td>${
      zones.length > 0 ? zones.map((zone) => escapeHtml(zone)).join("<br>") : escapeHtml(mail.none)
    }</td></tr>`,
    "</table>",
    link
      ? `<p style="margin-top:24px">${escapeHtml(mail.dossierLead)}<br><a href="${escapeHtml(link)}" style="color:#B5541B">${escapeHtml(mail.dossierCta)}</a></p>`
      : "",
    `<p style="margin-top:24px;white-space:pre-line">${escapeHtml(mail.signoff)}</p>`,
    `<p style="margin-top:32px;font-size:12px;color:#8C8477">${escapeHtml(mail.footer)}</p>`,
    "</div>",
  ].join("");

  return { subject: mail.subject, html, text };
}

/* ─────────────────────────────────────────────────────────────────────────
   6. Proveedores
   ───────────────────────────────────────────────────────────────────────── */

/**
 * Proveedor de envío, por orden de preferencia:
 *
 *   1. GMAIL del equipo por SMTP (`GMAIL_USER` + `GMAIL_APP_PASSWORD`). Es la
 *      cuenta que el equipo ya tiene y publica: boamracingteam@gmail.com. El
 *      correo sale de ella y llega a ella (o a `SPONSOR_MAIL_TO`), así que SPF
 *      y DKIM cuadran solos: Gmail firma lo que envía Gmail.
 *   2. RESEND (`RESEND_API_KEY` + `SPONSOR_MAIL_FROM`), para el día que haya
 *      dominio propio verificado.
 *   3. Ninguno: 503 y el diálogo pasa al plan B (descarga + `mailto:`).
 */
type Provider =
  | { readonly kind: "gmail"; readonly user: string; readonly pass: string }
  | { readonly kind: "resend"; readonly apiKey: string; readonly from: string };

function resolveProvider(): Provider | null {
  const user = process.env.GMAIL_USER;
  // Google muestra la contraseña de aplicación en bloques de 4 con espacios;
  // se aceptan pegados tal cual.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");
  if (user && pass) return { kind: "gmail", user, pass };

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.SPONSOR_MAIL_FROM;
  if (apiKey && from) return { kind: "resend", apiKey, from };

  return null;
}

/** Dirección del equipo: remitente de todo y destino de las solicitudes. */
function teamAddress(provider: Provider): string {
  return provider.kind === "gmail" ? provider.user : provider.from;
}

interface OutgoingMail {
  readonly to: string;
  readonly replyTo: string;
  readonly subject: string;
  readonly html: string;
  readonly text?: string;
  readonly attachments?: readonly IncomingAttachment[];
}

/**
 * Entrega un correo por el proveedor configurado. Lanza si falla: quien llama
 * decide si eso tumba la petición (la solicitud al equipo) o solo se anota
 * (el acuse al cliente).
 *
 * El remitente es SIEMPRE la cuenta del equipo: Gmail reescribe cualquier
 * otro `from` y, con Resend, remitir desde la dirección del cliente rompería
 * SPF/DKIM y el correo acabaría en spam. "Responder" se dirige con `replyTo`.
 */
async function deliver(provider: Provider, mail: OutgoingMail): Promise<void> {
  const attachments = mail.attachments ?? [];

  if (provider.kind === "gmail") {
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: provider.user, pass: provider.pass },
    });
    await transport.sendMail({
      from: { name: "BOAM Racing", address: provider.user },
      to: mail.to,
      replyTo: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
        encoding: "base64",
        contentType: "image/png",
      })),
    });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: provider.from,
      to: [mail.to],
      reply_to: mail.replyTo,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: attachments.map((attachment) => ({
        filename: attachment.filename,
        content: attachment.content,
      })),
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend ${response.status}: ${await response.text()}`);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const provider = resolveProvider();

  /* 503, no 500: el cliente NO ha hecho nada mal y la diferencia le importa
     — con un 5xx genérico el diálogo diría "ha fallado el envío" cuando lo
     correcto es pasar al plan B sin alarmar a nadie. */
  if (!provider) {
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
  const team = teamAddress(provider);

  /* 1 · La solicitud al equipo. Si esto falla, la petición falla y el
     diálogo pasa al plan B. El detalle del proveedor va al log del servidor,
     nunca al navegador: puede llevar dentro direcciones o el motivo exacto
     del rechazo. */
  try {
    await deliver(provider, {
      to: process.env.SPONSOR_MAIL_TO || team,
      replyTo: data.email,
      subject: `Patrocinio · ${data.company} · ${data.name}`,
      html: buildHtml(data),
      attachments: data.attachments,
    });
  } catch (error) {
    console.error("[BOAM · patrocinio] Fallo al enviar la solicitud", error);
    return NextResponse.json({ ok: false, reason: "provider-error" }, { status: 502 });
  }

  /* 2 · El acuse al cliente. La solicitud YA ha llegado, así que un fallo
     aquí no puede convertirse en un "no se ha enviado": se anota y se
     contesta ok. Responder a este correo va al buzón del equipo. */
  try {
    const confirmation = buildConfirmation(data);
    await deliver(provider, {
      to: data.email,
      replyTo: team,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
    });
  } catch (error) {
    console.error("[BOAM · patrocinio] Fallo al enviar el acuse al cliente", error);
  }

  return NextResponse.json({ ok: true });
}
