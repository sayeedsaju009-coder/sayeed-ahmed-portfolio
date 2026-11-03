# Shaikh Sayeed Ahmed — Civil Engineer Portfolio

Freelance portfolio website (course exercise "Plan, Build, and Deploy a Full Project").
Plain HTML, CSS and JavaScript — no build step, no dependencies. Deployed on Vercel; chatbot and contact form run on N8N Cloud.

## Pages
| File | Page |
|---|---|
| `index.html` | Home: hero, key figures, services preview, featured projects |
| `services.html` | Six engineering services and the work process |
| `projects.html` | Project case studies with category filter and detail pop-up |
| `about.html` | Profile, skills, career timeline, IRC/MoRTH codes |
| `contact.html` | Contact form with validation, contact details |

## Run locally
Open `index.html` in a browser, or start the `sayeed-ahmed-portfolio` preview (port 8772) from `Desktop\.claude\launch.json`.

## Editing content
- **Services and projects:** edit `js/data.js`. Home, Services and Projects all read from it. Keep `n8n/business-data.csv` in step so the chatbot gives the same answers.
- **Placeholders:** any text like `[Add email]` is highlighted in orange on the site. Search the files for `[Add` and replace them with real details.
- **Photo:** replace `images/portrait.svg` with your photo (and update the `src` in `about.html`).
- **Colours and fonts:** tokens at the top of `css/styles.css`. Light/dark follows the system setting.

## N8N chatbot and contact form
- Step-by-step setup: [`n8n/SETUP.md`](n8n/SETUP.md). Workflows to import: `n8n/chatbot-workflow.json`, `n8n/contact-form-workflow.json`.
- Connect the site by pasting the two N8N URLs into **`js/config.js`** (`chatWebhookUrl`, `contactWebhookUrl`). The chat widget (`js/chat.js`) loads only when its URL is set; the contact form shows an error until its URL is set.
- The form POSTs JSON: `name, email, organisation, service, message, submittedAt`. A hidden `website` field catches spam bots and is never sent.

## Review sub-agents
`.claude/agents/` holds three Claude Code sub-agents for this site: `portfolio-design-enforcer`, `content-reviewer` and `code-reviewer`.

## Deploy
The folder deploys to Vercel as a static site with no configuration. Every push to the `main` branch on GitHub redeploys it.
