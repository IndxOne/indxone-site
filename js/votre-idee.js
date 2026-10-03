(() => {
  const form = document.querySelector("#idea-form");
  if (!form) return;

  const STORAGE_KEY = "indxone:votre-idee:draft:v1";
  const steps = [...form.querySelectorAll("[data-step]")];
  const progressBar = document.querySelector("#idea-progress-bar");
  const progressLabel = document.querySelector("#idea-progress-label");
  const status = document.querySelector("#idea-form-status");
  const projectTypeInput = form.querySelector('[data-serialized="project-type"]');
  const projectTypeChoices = [...form.querySelectorAll('input[name="project-type-choice"]')];
  const submitButton = form.querySelector('button[type="submit"]');
  const projectTypeMap = {
    "piloter un projet SI": "pilotage",
    "structurer un besoin": "besoin",
    "créer une solution numérique": "solution",
    "automatiser un processus": "processus",
  };
  const queryTypeMap = {
    pilotage: "piloter un projet SI",
    besoin: "structurer un besoin",
    solution: "créer une solution numérique",
    processus: "automatiser un processus",
    collectivite: "créer une solution numérique",
  };
  const branch = {
    title: form.querySelector("[data-branch-title]"),
    hint: form.querySelector("[data-branch-hint]"),
    oneLabel: form.querySelector("[data-branch-one-label]"),
    twoLabel: form.querySelector("[data-branch-two-label]"),
  };

  const branchCopy = {
    "piloter un projet SI": {
      title: "Votre projet",
      hint: "Quelques repères sur le périmètre et la gouvernance.",
      one: "Quel est le périmètre et l’état d’avancement du projet ? *",
      two: "Quelles sont les principales contraintes (délais, budget, prestataires) ? *",
    },
    "structurer un besoin": {
      title: "Votre besoin",
      hint: "Partons de la situation réelle avant de choisir une solution.",
      one: "Quelle situation ou quel dysfonctionnement motive ce besoin ? *",
      two: "Qui sont les parties prenantes et que doit permettre la solution ? *",
    },
    "créer une solution numérique": {
      title: "Votre solution",
      hint: "Décrivons l’usage attendu avant de parler de technologie.",
      one: "Quel site, application, service ou outil souhaitez-vous concevoir ? *",
      two: "Qui l’utilisera et à quoi reconnaîtra-t-on que c’est réussi ? *",
    },
    "automatiser un processus": {
      title: "Votre processus",
      hint: "Décrivons le processus actuel avant d’envisager l’outil.",
      one: "Quelles tâches, données ou outils souhaitez-vous connecter ou automatiser ? *",
      two: "Quels gains attendez-vous (temps, fiabilité, qualité) ? *",
    },
  };

  let currentStep = 0;
  let startedAt = new Date().toISOString();
  let submissionId = createSubmissionId();
  let submitting = false;

  function saveDraft() {
    const data = Object.fromEntries(new FormData(form).entries());
    data["project-type-choice"] = projectTypeChoices.find((choice) => choice.checked)?.value || "";
    data.started_at = startedAt;
    data.submission_id = submissionId;
    // Never persist a trap value or a previous consent decision.
    delete data.company_name;
    delete data.consent;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  function restoreDraft() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    } catch {
      data = null;
    }
    if (!data || typeof data !== "object" || Array.isArray(data)) return;
    if (
      typeof data.started_at === "string" &&
      Number.isFinite(Date.parse(data.started_at)) &&
      Date.parse(data.started_at) <= Date.now()
    )
      startedAt = data.started_at;
    if (
      typeof data.submission_id === "string" &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submission_id)
    )
      submissionId = data.submission_id;

    projectTypeChoices.forEach((choice) => {
      choice.checked = choice.value === data["project-type-choice"];
    });
    [...form.elements].forEach((element) => {
      if (
        !element.name ||
        element.name === "form-name" ||
        element.name === "bot-field" ||
        element.name === "company_name" ||
        element.name === "consent"
      )
        return;
      if (element.type === "checkbox") element.checked = data[element.name] === "on";
      else if (element.type === "radio") return;
      else if (data[element.name] !== undefined) element.value = data[element.name];
    });
    syncBranch();
  }

  function applyQueryType() {
    const type = new URLSearchParams(window.location.search).get("type");
    const choiceValue = queryTypeMap[type];
    const choice = projectTypeChoices.find((candidate) => candidate.value === choiceValue);
    if (!choice) return;
    choice.checked = true;
    syncBranch();
    if (type === "collectivite") {
      form.elements.goal.value = "Un site officiel clair pour notre collectivité.";
      form.elements.audience.value = "Habitants, élus et services municipaux";
    }
    saveDraft();
  }

  function createSubmissionId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    const bytes = window.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0")).join("");
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function buildPayload() {
    const selected = projectTypeChoices.find((choice) => choice.checked)?.value || "";
    const now = new Date().toISOString();
    return {
      form_version: "1.0.0",
      submission_id: submissionId,
      project_type: projectTypeMap[selected],
      created_at: now,
      started_at: startedAt,
      company_name: form.elements.company_name.value,
      contact: {
        nom: form.elements.name.value,
        prenom: form.elements.firstname.value,
        email: form.elements.email.value,
        phone: form.elements.phone.value,
      },
      consent: { accepted: form.elements.consent.checked, accepted_at: now },
      responses: {
        trunk: {
          goal: form.elements.goal.value,
          audience: form.elements.audience.value,
          style: form.elements.style.value,
          examples: form.elements.examples.value,
          start: form.elements.start.value,
          budget: form.elements.budget.value,
          support: form.elements.support.value,
        },
        conditional: {
          branch_one: form.elements["branch-one"].value,
          branch_two: form.elements["branch-two"].value,
        },
      },
      meta: {
        origin: window.location.href,
        referrer: document.referrer,
        language: document.documentElement.lang || "fr",
      },
    };
  }

  function syncBranch() {
    const selected = projectTypeChoices.find((choice) => choice.checked)?.value || "";
    projectTypeInput.value = selected;
    const copy = branchCopy[selected] || branchCopy["structurer un besoin"];
    branch.title.textContent = copy.title;
    branch.hint.textContent = copy.hint;
    branch.oneLabel.textContent = copy.one;
    branch.twoLabel.textContent = copy.two;
  }

  function showError(message, focusElement) {
    status.textContent = message;
    if (focusElement) focusElement.focus({ preventScroll: false });
  }

  function clearError() {
    status.textContent = "";
    form.querySelectorAll("[data-error]").forEach((element) => {
      element.textContent = "";
    });
  }

  function validateStep(stepIndex) {
    const step = steps[stepIndex];
    if (stepIndex === 0 && !projectTypeChoices.some((choice) => choice.checked)) {
      showError("Choisissez un type de projet pour continuer.");
      return false;
    }
    const fields = [...step.querySelectorAll("input, textarea, select")].filter(
      (field) => !field.disabled && field.type !== "hidden"
    );
    const invalid = fields.find((field) => !field.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      showError("Vérifiez la réponse indiquée avant de continuer.", invalid);
      return false;
    }
    return true;
  }

  function renderSummary() {
    const summary = document.querySelector("#idea-summary");
    const labels = [
      ["Type de projet", projectTypeInput.value],
      ["Votre objectif", form.elements.goal.value],
      ["Pour qui", form.elements.audience.value],
      ["Précisions", form.elements["branch-one"].value + "\n" + form.elements["branch-two"].value],
      ["Votre vision", form.elements.style.value],
      ["Budget", form.elements.budget.value],
      ["Démarrage", form.elements.start.value],
      ["Accompagnement", form.elements.support.value],
      [
        "Contact",
        [form.elements.firstname.value, form.elements.name.value, form.elements.email.value]
          .filter(Boolean)
          .join(" · "),
      ],
    ];
    summary.replaceChildren();
    labels.forEach(([label, value]) => {
      const wrapper = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = value || "Non renseigné";
      wrapper.append(term, description);
      summary.append(wrapper);
    });
  }

  function updateProgress() {
    const visibleIndex = Math.min(currentStep, 5);
    progressBar.style.width = (Math.max(1, visibleIndex + 1) / 6) * 100 + "%";
    progressLabel.textContent = currentStep === 6 ? "Récapitulatif" : "Étape " + (visibleIndex + 1) + " sur 6";
  }

  function showStep(nextStep) {
    currentStep = nextStep;
    steps.forEach((step) => {
      step.hidden = Number(step.dataset.step) !== currentStep;
    });
    const review = form.querySelector('[data-step="6"]');
    if (review) review.hidden = currentStep !== 6;
    updateProgress();
    clearError();
    window.scrollTo({ top: 0, behavior: "smooth" });
    const heading = (currentStep === 6 ? review : steps[currentStep]).querySelector("legend, h2");
    heading?.focus?.({ preventScroll: true });
  }

  projectTypeChoices.forEach((choice) =>
    choice.addEventListener("change", () => {
      syncBranch();
      saveDraft();
    })
  );
  form.addEventListener("input", saveDraft);
  form.addEventListener("change", saveDraft);

  form.querySelectorAll(".idea-next").forEach((button) => {
    button.addEventListener("click", () => {
      if (!validateStep(currentStep)) return;
      syncBranch();
      if (currentStep === 5) renderSummary();
      showStep(Math.min(6, currentStep + 1));
    });
  });

  form.querySelectorAll(".idea-back").forEach((button) => {
    button.addEventListener("click", () => showStep(Math.max(0, currentStep - 1)));
  });

  form.addEventListener("submit", async (event) => {
    if (currentStep !== 6) {
      event.preventDefault();
      return;
    }
    if (!validateStep(5)) {
      event.preventDefault();
      showStep(5);
      return;
    }
    event.preventDefault();
    if (submitting) return;
    submitting = true;
    saveDraft();
    clearError();
    submitButton.disabled = true;
    submitButton.textContent = "Envoi en cours…";
    status.textContent = "Votre demande est en cours d’envoi…";
    try {
      const response = await fetch("/api/submit-idee", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const result = await response.json().catch(() => ({}));
      if (result.simulated) {
        showError(result.message || "Mode Preview : demande validée, aucun envoi effectué.");
        return;
      }
      if (!response.ok || result.fallback || !result.ok)
        throw new Error(result.error || "La demande n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.");
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {}
      window.location.assign("/merci/");
    } catch (error) {
      showError(error.message || "Connexion interrompue. Réessayez sans modifier votre demande.");
    } finally {
      submitting = false;
      submitButton.disabled = false;
      submitButton.textContent = "Envoyer ma demande";
    }
  });

  restoreDraft();
  saveDraft();
  applyQueryType();
  syncBranch();
  showStep(0);
})();
