import plans from "../data/plans.json" with { type: "json" };
export type Plan = (typeof plans)[number];
export type Focus = "standard" | "kitchen" | "bathroom";
export function selectedGroups(plan: Plan, focus: Focus) {
  const deep = plans.find((p) => p.id === "deep")!;
  return plan.groups.map((g) => {
    if (
      plan.id === "maintenance" &&
      focus === "kitchen" &&
      g.title === "Kitchen"
    )
      return {
        ...deep.groups.find((g) => g.title === "Kitchen")!,
        title: "Kitchen+",
      };
    if (
      plan.id === "maintenance" &&
      focus === "bathroom" &&
      g.title === "Bathrooms"
    )
      return {
        ...deep.groups.find((g) => g.title === "Bathrooms")!,
        title: "Bathrooms+",
      };
    return g;
  });
}
const escape = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export function checklist(plan: Plan, focus: Focus = "standard") {
  return `<div class="hc-grid hc-grid-approved">${selectedGroups(plan, focus)
    .map(
      (g) =>
        `<section class="hc-group hc-group-approved ${"conditional" in g ? "hc-conditional" : ""}"><h4>${escape(g.title)}${"conditional" in g ? " · if included" : ""}</h4><ul>${g.items.map((s, i) => `<li data-task-id="${g.taskIds[i]}">${escape(s)}</li>`).join("")}</ul></section>`,
    )
    .join(
      "",
    )}${plan.extras.length ? `<aside class="hc-extras"><h4>Available additions</h4><p class="hc-extras-caption">Optional work · selected and quoted separately</p><ul class="hc-extras-list">${plan.extras.map((s) => `<li>${escape(s)}</li>`).join("")}</ul></aside>` : ""}</div><p class="hc-footnote">${escape(plan.note)}</p>`;
}
export function focusControls() {
  return `<section class="hc-focus-wrap"><label class="hc-focus-label" for="essential-focus"><span class="hc-v101-desktop-copy">Choose an Essential focus</span><span class="hc-v101-mobile-copy">Optional: Partial deep clean</span></label><select class="hc-v93-focus-select" id="essential-focus" aria-label="Choose an Essential focus">${["Essential Clean", "Essential+ · Kitchen", "Essential+ · Bathrooms"].map((s, i) => `<option value="${["standard", "kitchen", "bathroom"][i]}">${s}</option>`).join("")}</select><div class="hc-focus-controls" role="group" aria-label="Essential checklist focus">${["standard", "kitchen", "bathroom"].map((f, i) => `<button class="hc-focus-btn" type="button" data-focus="${f}" aria-pressed="${i === 0}"><span class="hc-v101-desktop-copy">${["Essential Clean", "Essential+ · Kitchen", "Essential+ · Bathrooms"][i]}</span><span class="hc-v101-mobile-copy">${["Essential", "Kitchen +", "Bathrooms +"][i]}</span></button>`).join("")}</div><p class="hc-focus-help"><span class="hc-v101-desktop-copy">Essential+ replaces only the selected room group with the detailed checklist.</span><span class="hc-v101-mobile-copy">Selected rooms receive the Essential+ checklist; all other rooms remain Essential.</span></p></section>`;
}
export function bindServices() {
  const cards = [
    ...document.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
  ];
  let active = plans[0],
    focus: Focus = "standard";
  const dock = document.querySelector<HTMLElement>("#hc-focus-dock")!;
  const render = () => {
    cards.forEach((b) => {
      const selected = b.dataset.plan === active.id;
      b.setAttribute("aria-selected", String(selected));
      b.tabIndex = selected ? 0 : -1;
    });
    document.querySelector("#hc-name")!.textContent =
      active.name +
      (active.id === "maintenance" && focus !== "standard"
        ? ` · ${focus === "kitchen" ? "Kitchen" : "Bathrooms"} focus`
        : "");
    document.querySelector("#hc-description")!.textContent = active.description;
    document.querySelector("#hc-detail-body")!.innerHTML = checklist(
      active,
      focus,
    );
    dock.hidden = active.id !== "maintenance";
    document
      .querySelector("#hc-details")!
      .setAttribute("aria-labelledby", "hc-tab-" + active.id);
    dock
      .querySelectorAll<HTMLButtonElement>("[data-focus]")
      .forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.focus === focus)),
      );
    dock.querySelector("select")!.value = focus;
  };
  cards.forEach((b, i) => {
    b.addEventListener("click", () => {
      active = plans.find((p) => p.id === b.dataset.plan)!;
      render();
    });
    b.addEventListener("keydown", (e) => {
      if (
        ![
          "ArrowRight",
          "ArrowDown",
          "ArrowLeft",
          "ArrowUp",
          "Home",
          "End",
        ].includes(e.key)
      )
        return;
      e.preventDefault();
      const n =
        e.key === "Home"
          ? 0
          : e.key === "End"
            ? cards.length - 1
            : (i +
                (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) +
                cards.length) %
              cards.length;
      cards[n].focus();
      cards[n].click();
    });
  });
  dock.addEventListener("click", (e) => {
    const b = (e.target as Element).closest<HTMLElement>("[data-focus]");
    if (b) {
      focus = b.dataset.focus as Focus;
      render();
    }
  });
  dock.querySelector("select")!.addEventListener("change", (e) => {
    focus = (e.target as HTMLSelectElement).value as Focus;
    render();
  });
  render();
}
