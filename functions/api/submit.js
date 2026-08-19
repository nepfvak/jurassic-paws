/**
 * POST /api/submit
 *
 * Body JSON: { name, email, uuid, result, resultCode, competency, secondary, scores, submittedAt }
 *
 * Appends a row to a Google Sheet via a service-account JWT flow. That's the
 * only side effect — the student's result is rendered as a downloadable/
 * shareable card entirely client-side, so there's no email step here and no
 * per-day send limit to worry about at high turnout.
 *
 * Required environment variables / secrets (set in Cloudflare Pages dashboard
 * → Settings → Environment variables, or with `wrangler pages secret put`):
 *
 *   GOOGLE_SERVICE_ACCOUNT_EMAIL   e.g. jurassic-paws@your-project.iam.gserviceaccount.com
 *   GOOGLE_PRIVATE_KEY             full PEM private key from the service account JSON
 *                                   (keep the \n escapes — see README)
 *   GOOGLE_SHEET_ID                the long ID in the sheet's URL
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

  try {
    await appendToSheet(env, { name, email, uuid, result, resultCode, competency, secondary, scores, submittedAt });
  } catch (err) {
    console.error("Sheet append failed:", err);
    return jsonResponse({ ok: false, error: "Sheet append failed" }, 502);
  }

  return jsonResponse({ ok: true });
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
