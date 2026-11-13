import { bindServices } from "./components/services";
bindServices();
const toggle = document.querySelector<HTMLButtonElement>(".hc-float-toggle")!;
const dropdown = document.querySelector<HTMLElement>(".hc-float-dropdown")!;
function closeMenu(restore = false) {
  dropdown.hidden = true;
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open navigation");
  if (restore) toggle.focus();
}
toggle.addEventListener("click", () => {
  const open = dropdown.hidden;
  dropdown.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation",
  );
});
document.addEventListener("click", (e) => {
  if (!(e.target as Element).closest(".hc-nav-v7")) closeMenu();
  if ((e.target as Element).closest(".hc-float-dropdown a")) closeMenu();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !dropdown.hidden) closeMenu(true);
});
document
  .querySelector("#hc-b-footer-signup")!
  .addEventListener("submit", (e) => {
    e.preventDefault();
    const s = document.querySelector<HTMLElement>("#hc-b-footer-form-status")!;
    s.hidden = false;
    s.textContent =
      "Preview only — newsletter signup is not connected. No information has been sent.";
  });
const embed = document.querySelector("#hc-contact-jotform")!;
const titleFrame = () => {
  embed.querySelector("iframe")?.setAttribute("title", "Contact Hello Casa");
};
new MutationObserver(titleFrame).observe(embed, {
  childList: true,
  subtree: true,
});
titleFrame();
const aliases: Record<string, string> = {
  "comp-mvg8kq2o": "services",
  "hc-mobile-vertical": "services",
  "comp-mvl2qp7u": "services",
  "comp-mvjmg2wv": "standards",
  "comp-mvl5krfe": "standards",
  "comp-mvgugq2v": "contact",
  SITE_CONTAINER: "top",
  "comp-mvfzhbf2": "how-it-works",
};
function resolveHash() {
  const target = aliases[location.hash.slice(1)];
  if (target) document.getElementById(target)?.scrollIntoView();
}
addEventListener("hashchange", resolveHash);
resolveHash();
