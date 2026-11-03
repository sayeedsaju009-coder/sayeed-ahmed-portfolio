// N8N chat widget. Loads only when SITE_CONFIG.chatWebhookUrl is set.
const CHAT_VERSION = "1.43.1";

if (typeof SITE_CONFIG !== "undefined" && SITE_CONFIG.chatWebhookUrl) {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = `https://cdn.jsdelivr.net/npm/@n8n/chat@${CHAT_VERSION}/dist/style.css`;
  document.head.appendChild(css);

  import(`https://cdn.jsdelivr.net/npm/@n8n/chat@${CHAT_VERSION}/dist/chat.bundle.es.js`)
    .then(({ createChat }) => {
      createChat({
        webhookUrl: SITE_CONFIG.chatWebhookUrl,
        mode: "window",
        showWelcomeScreen: false,
        loadPreviousSession: true,
        initialMessages: [
          "Hello! I'm the assistant for Shaikh Sayeed Ahmed, civil engineer.",
          "Ask me about services, past projects, or how to hire Sayeed.",
        ],
        i18n: {
          en: {
            title: "Ask about my engineering work",
            subtitle: "Highways · Drainage · QA/QC",
            footer: "",
            getStarted: "New conversation",
            inputPlaceholder: "Type your question…",
          },
        },
      });
    })
    .catch(() => {
      // Chat is optional: if the CDN fails the rest of the site still works
    });
}
