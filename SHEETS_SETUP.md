# Google Sheets reviews (what you need to provide)

Follow these steps once. Then copy the URL and secret into a `.env` file next to `server.js`.

## 1. Create the spreadsheet

Suggested title: **Gem Cleaning — Customer reviews**.

On the first tab (rename it **Reviews** if you like), row **1** must be exactly:

| Timestamp | Rating | Service | Name | Comments | Approved |

New submissions get **Approved** = `pending`. Change a cell to **yes** (lowercase OK) when you are happy for that row to appear on the website under **What our clients say**.

## 2. Add Apps Script

1. In the spreadsheet menu: **Extensions → Apps Script**.
2. Replace the blank `Code.gs` contents with everything from `scripts/google-apps-script-reviews.gs` in this repo (copy/paste).
3. Save the project (**Ctrl+S**).

## 3. Script property (shared secret)

1. In Apps Script: **Project Settings** (gear) → **Script properties**.
2. **Add script property**:  
   - Name: `GEM_SCRIPT_TOKEN`  
   - Value: a long random string (e.g. 32+ characters).  
3. Copy that value — you will paste it into `.env` as `GEM_APPS_SCRIPT_SECRET`.

## 4. Deploy the web app

1. **Deploy → New deployment** → type **Web app**.
2. **Execute as:** Me  
3. **Who has access:** Anyone  
4. Deploy, then copy the **Web app URL** (looks like `https://script.google.com/macros/s/.../exec`).

Paste that URL into `.env` as `GEM_APPS_SCRIPT_URL`.

**Note:** Each time you change the `.gs` code, use **Deploy → Manage deployments → Edit → Version (New)** so the latest code runs.

## 5. Local `.env`

From the repo root:

1. Copy `.env.example` to `.env`.
2. Set:

```env
GEM_APPS_SCRIPT_URL=https://script.google.com/macros/s/XXXX/exec
GEM_APPS_SCRIPT_SECRET=the_same_string_as_GEM_SCRIPT_TOKEN
```

3. Restart the Node server (`npm start`).

## 6. Approving reviews

Nothing appears on the site until **Approved** is **yes** for that row. This reduces spam showing up publicly without your review.

## 7. Submit review page

The dedicated form is at **`/submit-review.html`**. It reuses **`styles.css`** and **`app.js`** so it matches the main site theme. Submissions still go through **`POST /api/reviews`** to the same Google Sheet; approved rows appear on the home page in **What our clients say**.

---

**Hosting note:** `/api/reviews` is implemented on the **Node server** (`server.js`). If you publish only static files (no Express), submissions and the live section will not work until you deploy the Node app somewhere or proxy to it.
