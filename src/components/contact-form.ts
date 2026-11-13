/// <reference types="vite/client" />
/**
 * Native Contact form. The public Vite settings contain ONLY an endpoint URL and
 * Turnstile site key, never Airtable credentials.
 */
export function bindContactForm() {
  const form = document.querySelector<HTMLFormElement>("#hc-native-contact-form");
  if (!form) return;

  const button = form.querySelector<HTMLButtonElement>(".hc-contact-submit")!;
  const status = form.querySelector<HTMLElement>("#hc-contact-status")!;
  const verification = form.querySelector<HTMLElement>("#hc-contact-verification")!;
  const endpoint = (import.meta.env.VITE_HC_CONTACT_API_URL || "").trim();
  const siteKey = (import.meta.env.VITE_HC_CONTACT_TURNSTILE_SITE_KEY || "").trim();

  function setStatus(message: string, state: "success" | "error" | "preview") {
    status.textContent = message;
    status.dataset.state = state;
    status.hidden = false;
  }

  // A review build must not falsely suggest that information has been sent.
  if (!endpoint || !siteKey || !/^https:\/\//.test(endpoint)) {
    button.disabled = true;
    setStatus("Preview only — this form is not connected to submissions yet.", "preview");
    return;
  }

  const widget = document.createElement("div");
  widget.className = "cf-turnstile";
  widget.dataset.sitekey = siteKey;
  verification.append(widget);
  const script = document.createElement("script");
  script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
  script.onload = () => { button.disabled = false; };
  script.async = true;
  script.defer = true;
  script.onerror = () => {
    button.disabled = true;
    setStatus("Verification is unavailable. Please try again later.", "error");
  };
  document.head.append(script);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity() || button.disabled) return;
    const values = new FormData(form);
    const turnstileToken = String(values.get("cf-turnstile-response") || "");
    if (!turnstileToken) {
      setStatus("Please complete the security verification first.", "error");
      return;
    }
    const payload = {
      name: String(values.get("name") || "").trim(),
      email: String(values.get("email") || "").trim(),
      phone: String(values.get("phone") || "").trim(),
      message: String(values.get("message") || "").trim(),
      website: String(values.get("website") || ""),
      replyConsent: values.has("replyConsent"),
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
      if (!response.ok || result.ok !== true) {
        throw new Error(result.message || "Submission unsuccessful.");
      }
      form.reset();
      setStatus("Thank you! Your message has been received.", "success");
    } catch {
      setStatus(
        "We couldn't confirm your message. Please try again later.",
        "error",
      );
    } finally {
      // Turnstile response tokens are one-time use, including after failures.
      const turnstile = (window as Window & {
        turnstile?: { reset: () => void };
      }).turnstile;
      turnstile?.reset();
      button.disabled = false;
      button.textContent = "Send my message";
    }
  });
}
