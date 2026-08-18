/**
 * POST /api/submit
 *
 * Body JSON: { name, email, uuid, result, resultCode, competency, secondary, scores, submittedAt }
 *
 * Does two things, in parallel:
 *   1. Appends a row to a Google Sheet (via a service account)
 *   2. Emails the student their Dino DNA card (via Resend)
 *
 * Required environment variables / secrets (set in Cloudflare Pages dashboard
 * → Settings → Environment variables, or with `wrangler pages secret put`):
 *
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL   e.g. jurassic-paws@your-project.iam.gserviceaccount.com
 *   GOOGLE_PRIVATE_KEY             full PEM private key from the service account JSON
 *                                   (keep the \n escapes — see README)
 *   GOOGLE_SHEET_ID                the long ID in the sheet's URL
 *   RESEND_API_KEY                 from resend.com
 *   RESEND_FROM                    e.g. "Jurassic Paws <results@yourschooldomain.org>"
 */

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ ok: false, error: "Invalid JSON body" }, 400);
  }

  const { name, email, uuid, result, resultCode, competency, secondary, scores, submittedAt } = body;

  if (!name || !email || !uuid || !result) {
    return jsonResponse({ ok: false, error: "Missing required fields" }, 400);
  }

  const results = await Promise.allSettled([
    appendToSheet(env, { name, email, uuid, result, resultCode, competency, secondary, scores, submittedAt }),
    sendResultEmail(env, { name, email, result, competency, resultCode })
  ]);

  const [sheetResult, emailResult] = results;
  const sheetOk = sheetResult.status === "fulfilled";
  const emailOk = emailResult.status === "fulfilled";

  if (!sheetOk) console.error("Sheet append failed:", sheetResult.reason);
  if (!emailOk) console.error("Email send failed:", emailResult.reason);

  // We still return 200 if at least the sheet write succeeded, since that's
  // the source of truth for the event. The front-end shows a generic
  // success message either way to avoid confusing students.
  if (!sheetOk && !emailOk) {
    return jsonResponse({ ok: false, error: "Both save and email failed" }, 502);
  }

  return jsonResponse({ ok: true, sheetOk, emailOk });
}

// ============================================================
// GOOGLE SHEETS
// ============================================================
async function appendToSheet(env, data) {
  const accessToken = await getGoogleAccessToken(env);

  const row = [
    data.submittedAt || new Date().toISOString(),
    data.name,
    data.email,
    data.uuid,
    data.result,
    data.resultCode || "",
    data.competency || "",
    data.secondary || ""
  ];

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${env.GOOGLE_SHEET_ID}/values/Sheet1!A:H:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ values: [row] })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Sheets API error ${res.status}: ${text}`);
  }
}

async function getGoogleAccessToken(env) {
  const header = { alg: "RS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const claimSet = {
    iss: env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now
  };

  const encHeader = base64urlEncodeString(JSON.stringify(header));
  const encClaim = base64urlEncodeString(JSON.stringify(claimSet));
  const unsigned = `${encHeader}.${encClaim}`;

  const key = await importPrivateKey(env.GOOGLE_PRIVATE_KEY);
  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );
  const jwt = `${unsigned}.${base64urlEncodeBuffer(signatureBuffer)}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=${encodeURIComponent("urn:ietf:params:oauth:grant-type:jwt-bearer")}&assertion=${jwt}`
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Google token exchange failed ${tokenRes.status}: ${text}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

async function importPrivateKey(pem) {
  // The private key is usually stored in the env var with literal "\n"
  // sequences instead of real newlines — normalize both cases.
  const normalized = pem.includes("\\n") ? pem.replace(/\\n/g, "\n") : pem;

  const pemBody = normalized
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");

  const binaryDer = base64ToArrayBuffer(pemBody);

  return crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

// ============================================================
// RESEND EMAIL
// ============================================================
async function sendResultEmail(env, data) {
  const html = buildEmailHtml(data);

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.RESEND_FROM,
      to: [data.email],
      subject: `Your Dino DNA: ${data.result}`,
      html
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend API error ${res.status}: ${text}`);
  }
}

function buildEmailHtml({ name, result, competency, resultCode }) {
  return `
  <div style="font-family: Georgia, serif; background:#15140f; color:#ede3cf; padding:32px; max-width:520px; margin:0 auto;">
    <p style="font-family: monospace; color:#7ea36c; font-size:12px; letter-spacing:1px; text-transform:uppercase;">Jurassic Paws · Sequence Resolved</p>
    <p style="font-family: monospace; color:#e8a93b; font-size:13px;">&gt;&gt; ${resultCode || ""}</p>
    <h1 style="font-size:32px; margin:8px 0 4px; color:#e8a93b;">${result}</h1>
    <p style="font-size:14px; text-transform:uppercase; letter-spacing:1px; color:#b8ad95; margin-top:0;">${competency}</p>
    <p style="font-size:15px; line-height:1.6;">Hi ${name},</p>
    <p style="font-size:15px; line-height:1.6;">Thanks for stopping by the Jurassic Paws exhibit. Your Dino DNA result is above — hang onto this email as your record from the event.</p>
  </div>`;
}

// ============================================================
// UTILITIES
// ============================================================
function base64urlEncodeString(str) {
  return base64urlEncodeBuffer(new TextEncoder().encode(str));
}

function base64urlEncodeBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
