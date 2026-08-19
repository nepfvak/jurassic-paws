# Jurassic Paws — Dino DNA Quiz

A 14-question quiz that maps students to one of 7 NACE Career Readiness
competencies, styled as a dinosaur "DNA" reveal. Submissions are logged to a
Google Sheet for event staff, and each student gets a downloadable/shareable
result card rendered client-side on a `<canvas>` — no email step, so there's
no per-day send limit to worry about if turnout spikes.

## What's in here

```
index.html              the whole quiz UI (intake form → quiz → results)
css/style.css            styling
js/quiz.js                quiz questions, scoring, submission logic, and the
                           canvas-drawn DNA card
functions/api/submit.js  Cloudflare Pages Function — logs to Google Sheets
```

## 1. Set up the Google Sheet

1. Create a new Google Sheet. Add a header row to `Sheet1`:
   `Timestamp | Name | Email | UUID | Result | Code | Competency | Secondary`
2. Copy the Sheet ID out of its URL:
   `docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`
3. In [Google Cloud Console](https://console.cloud.google.com/), create a
   project (or use an existing one) and enable the **Google Sheets API**.
4. Under **IAM & Admin → Service Accounts**, create a service account. Create
   a JSON key for it and download it — you'll need two values from it:
   `client_email` and `private_key`.
5. Back in your Sheet, click **Share** and share it with the service
   account's `client_email` (as an Editor).

## 2. Deploy to Cloudflare Pages

1. Push this folder to a GitHub repo, or use Cloudflare's direct-upload option.
2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages** → connect
   the repo (or drag-and-drop upload). No build command needed — this is
   plain HTML/CSS/JS, so leave the build output directory as `/`.
3. Once deployed, go to your Pages project → **Settings → Environment
   variables** and add these as **secrets** (not plain text, since they're
   credentials):

   | Variable | Value |
   |---|---|
   | `GOOGLE_SERVICE_ACCOUNT_EMAIL` | the `client_email` from your service account JSON |
   | `GOOGLE_PRIVATE_KEY` | the `private_key` from that JSON, including the `-----BEGIN/END-----` lines |
   | `GOOGLE_SHEET_ID` | the ID from your Sheet's URL |

   > When pasting the private key into Cloudflare's dashboard, paste it with
   > real line breaks exactly as it appears in the JSON file — the code
   > handles either real newlines or escaped `\n` sequences, so either works.

4. Redeploy (Cloudflare redeploys automatically on env var changes, or trigger
   manually from the dashboard).

## 3. Test it

Open your `*.pages.dev` URL, run through the quiz, and check that:
- a new row appears in your Google Sheet
- the results screen renders a DNA card and the Save Card button downloads it

If the Sheet write fails, check **Workers & Pages → your project →
Functions → Real-time Logs** in the Cloudflare dashboard for the error
message — the function logs exactly what failed. The card itself renders
entirely in the browser, so it always works even if the Sheet write doesn't.

## Customizing

- **Questions/dinos**: edit the `DINOSAURS` and `QUESTIONS` objects at the top
  of `js/quiz.js`. Scores are summed per dinosaur (2 questions × 5 points max
  = 10 per dino); the highest total wins, with a "secondary strand" shown if
  the runner-up is within 2 points.
- **Colors/fonts**: all defined as CSS custom properties at the top of
  `css/style.css`.
- **Sheet columns**: if you change what gets logged, update both the header
  row in your Sheet and the `row` array in `functions/api/submit.js`.
