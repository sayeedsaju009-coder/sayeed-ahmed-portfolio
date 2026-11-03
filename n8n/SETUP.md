# N8N setup: chatbot + contact form

Everything here is done in your browser at n8n.io. Files referenced below are in this `n8n` folder.

## 1. Create your n8n Cloud account
1. Go to https://n8n.io and click **Get started** (free trial).
2. Sign up and open your workspace. Its address looks like `https://YOURNAME.app.n8n.cloud`.

## 2. Add your Anthropic API key
1. Get a key at https://console.anthropic.com → **API Keys** → **Create Key**.
   Also set a **monthly spend limit** there (Settings → Limits). The chat URL is public, so a limit protects you if someone abuses it.
2. In n8n: **Overview → Credentials → Create credential → Anthropic**, paste the key, **Save**.
   (Never paste the key into chat or into the website files.)

## 3. Create the two data tables
In n8n: **Overview → Data tables → Create data table**.

**Table 1: `business_data`** (the chatbot's knowledge)
- Choose **Import CSV** and select `business-data.csv`.
  Columns: `type`, `title`, `details` (all text).
- If import isn't offered, create the three text columns by hand and paste the rows.

**Table 2: `contact_submissions`** (form entries)
- Columns, all **string/text**: `name`, `email`, `organisation`, `service`, `message`, `submitted_at`.

## 4. Import the chatbot workflow
1. **Create workflow → ⋯ menu → Import from file** → `chatbot-workflow.json`.
2. Open **Anthropic Chat Model** → select your Anthropic credential. Pick the model if the list asks (a Haiku model is cheapest and fast).
3. Open **Business data** → **Data table**: choose `business_data`. Operation: **Get** rows, **Return all** on.
4. Open **When chat message received**:
   - **Make Chat Publicly Available**: on
   - **Mode**: *Embedded Chat*
   - **Allowed Origins (CORS)**: `*` for now (change it to your Vercel address after deploying)
   - **Load Previous Session**: *From Memory* (Simple Memory is already connected to it)
   - Copy the **Chat URL** (production URL, ends with `/chat`).
5. Click **Save**, then switch the workflow to **Active** (toggle top right).
6. Test with the **Open chat** button: ask "What services do you offer?"

## 5. Import the contact form workflow
1. **Create workflow → Import from file** → `contact-form-workflow.json`.
2. Open **Save to contact_submissions** → **Data table**: choose `contact_submissions`. Check that the six columns are mapped (name ← `{{ $json.body.name }}` and so on).
3. Open **Contact form webhook** → copy the **Production URL**.
4. **Save** and set the workflow **Active**.

## 6. Connect the website
Send both URLs to Claude, or paste them yourself into `js/config.js`:

```js
const SITE_CONFIG = {
  chatWebhookUrl: "https://YOURNAME.app.n8n.cloud/webhook/sayeed-portfolio-chat/chat",
  contactWebhookUrl: "https://YOURNAME.app.n8n.cloud/webhook/sayeed-portfolio-contact",
};
```

After the change is pushed to GitHub, Vercel redeploys the site automatically.

## 7. After deploying
- In both trigger nodes, change **Allowed Origins** from `*` to your site address, for example `https://sayeed-ahmed-portfolio.vercel.app` (plus `http://localhost:8772` if you still test locally).
- Submissions appear in **Data tables → contact_submissions**.
