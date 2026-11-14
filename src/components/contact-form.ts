/// <reference types="vite/client" />
/**
 * Shared native Contact form for Hello Casa and Confident Cleanings.
 * The server identifies the brand from an approved website origin.
 * Airtable credentials remain server-side. Never put a PAT in the browser.
 */
export function bindContactForm() {
  const form = document.querySelector<HTMLFormElement>("#hc-native-contact-form");
  if (!form) return;

  const button = form.querySelector<HTMLButtonElement>(".hc-contact-submit");
  const status = form.querySelector<HTMLElement>("#hc-contact-status");
  const verification = form.querySelector<HTMLElement>("#hc-contact-verification");
  const topic = form.querySelector<HTMLSelectElement>('select[name="topic"]');
  const message = form.querySelector<HTMLTextAreaElement>('textarea[name="message"]');
  if (!button || !status || !verification || !topic || !message) return;
  const defaultLabel = button.innerHTML;
  const defaultHint = "Tell us a little about what you need.";
  const hints: Record<string, string> = {
    "I have a question": "Is there something you'd like to know before getting started?",
    "Help me choose a cleaning service": "Tell us what you're hoping to accomplish. We can help you explore your options.",
    "My space needs something different": "A unique property or a special request? Tell us a little about it.",
    "Something else": "Whatever's on your mind, we're listening.",
  };
  topic.addEventListener("change", () => { message.placeholder = hints[topic.value] || defaultHint; });

  const endpoint = "https://hc-forms-api.hello-casa-usa.workers.dev/api/contact";
  const siteKey = "0x4AAAAAAGAOHqI8iezJxq7F";
  let turnstileToken = "";
  let widgetId: string | undefined;

  const show = (text: string, state: "success" | "error") => {
    status.textContent = text;
    status.dataset.state = state;
    status.hidden = false;
  };
  const disableVerification = (notice: string) => {
    turnstileToken = "";
    button.disabled = true;
    show(notice, "error");
  };
  button.disabled = true;
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
  script.async = true;
  script.onload = () => {
    const api = (window as Window & { turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string;
      reset: (id?: string) => void;
    } }).turnstile;
    if (!api?.render) {
      disableVerification("Verification is unavailable. Please try again later.");
      return;
    }
    try {
      widgetId = api.render(verification, {
        sitekey: siteKey,
        appearance: "interaction-only",
        callback: (value: string) => { turnstileToken = value; button.disabled = false; status.hidden = true; },
        "expired-callback": () => disableVerification("Please complete the security verification again."),
        "error-callback": () => disableVerification("Verification is unavailable. Please try again later."),
      });
    } catch { disableVerification("Verification is unavailable. Please try again later."); }
  };
  script.onerror = () => disableVerification("Verification is unavailable. Please try again later.");
  document.head.append(script);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || button.disabled) return;
    if (!turnstileToken) { show("Please complete the security verification first.", "error"); return; }
    const values = new FormData(form);
    const payload = {
      name: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      phone: String(values.get("phone") || "").trim(),
      topic: String(values.get("topic") || "").trim(),
      message: String(values.get("message") || "").trim(),
      website: String(values.get("website") || ""),
      replyConsent: true, // Contact details used only to respond to this inquiry.
      turnstileToken,
    };
    button.disabled = true;
    button.textContent = "Sending…";
    status.hidden = true;
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || result.ok !== true) throw new Error(result.message || "Unable to submit.");
      form.reset();
      message.placeholder = defaultHint;
      show("Thank you for reaching out. We've received your note.", "success");
    } catch {
      show("We couldn't confirm your message. Please try again later.", "error");
    } finally {
      turnstileToken = "";
      const api = (window as Window & { turnstile?: { reset: (id?: string) => void } }).turnstile;
      try { api?.reset(widgetId); } catch { /* Page may be unloading. */ }
      button.innerHTML = defaultLabel;
      button.disabled = true;
    }
  });
}
