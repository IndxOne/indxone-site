(() => {
  const form = document.querySelector('#idea-form');
  if (!form) return;

  const STORAGE_KEY = 'indxone:votre-idee:draft:v1';
  const steps = [...form.querySelectorAll('[data-step]')];
  const progressBar = document.querySelector('#idea-progress-bar');
  const progressLabel = document.querySelector('#idea-progress-label');
  const status = document.querySelector('#idea-form-status');
  const projectTypeInput = form.querySelector('[data-serialized="project-type"]');
  const projectTypeChoices = [...form.querySelectorAll('input[name="project-type-choice"]')];
  const submitButton = form.querySelector('button[type="submit"]');
  const projectTypeMap = {
    'mariage ou événement': 'mariage',
    'site internet': 'site',
    application: 'application',
    'activité à développer': 'activite',
    'idée encore floue': 'idee_floue',
  };
  const queryTypeMap = {
    mariage: 'mariage ou événement',
    site: 'site internet',
    application: 'application',
    activite: 'activité à développer',
    organisation: 'application',
    floue: 'idée encore floue',
    idee_floue: 'idée encore floue',
    collectivite: 'site internet',
  };
  const branch = {
    title: form.querySelector('[data-branch-title]'),
    hint: form.querySelector('[data-branch-hint]'),
    oneLabel: form.querySelector('[data-branch-one-label]'),
    twoLabel: form.querySelector('[data-branch-two-label]'),
  };

  const branchCopy = {
    'mariage ou événement': {
      title: 'Votre événement',
      hint: 'Quelques repères pour imaginer l’expérience à proposer aux invités.',
      one: 'Quelle date et quel lieu envisagez-vous ? *',
      two: 'Quelles informations ou services devront trouver les invités ? *',
    },
    'site internet': {
      title: 'Votre site',
      hint: 'Pensons d’abord à ce que vos visiteurs doivent comprendre et faire.',
      one: 'Quelle activité ou quel sujet le site présentera-t-il ? *',
      two: 'Quelles pages ou informations sont indispensables ? *',
    },
    application: {
      title: 'Votre application',
      hint: 'Décrivons le problème à résoudre avant de parler de technologie.',
      one: 'Quelle action ou quel problème souhaitez-vous simplifier ? *',
      two: 'Qui l’utilisera et sur quel support : mobile, web ou les deux ? *',
    },
    'activité à développer': {
      title: 'Votre activité',
      hint: 'Quelques éléments sur votre offre et votre priorité immédiate.',
      one: 'Que proposez-vous et à qui ? *',
      two: 'Quelle tâche ou quel point souhaitez-vous simplifier en premier ? *',
    },
    'idée encore floue': {
      title: 'Votre point de départ',
      hint: 'Partons de la situation réelle, sans chercher la solution tout de suite.',
      one: 'D’où vient cette idée ? *',
      two: 'Quelle situation vous gêne aujourd’hui ? *',
    },
  };

  let currentStep = 0;

  function saveDraft() {
    const data = Object.fromEntries(new FormData(form).entries());
    data['project-type-choice'] = projectTypeChoices.find((choice) => choice.checked)?.value || '';
    try {
      const previous = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      data.started_at = previous?.started_at || new Date().toISOString();
    } catch {
      data.started_at = new Date().toISOString();
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {}
  }

  function restoreDraft() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      data = null;
    }
    if (!data) return;

    projectTypeChoices.forEach((choice) => {
      choice.checked = choice.value === data['project-type-choice'];
    });
    [...form.elements].forEach((element) => {
      if (!element.name || element.name === 'form-name' || element.name === 'bot-field') return;
      if (element.type === 'checkbox') element.checked = data[element.name] === 'on';
      else if (element.type === 'radio') return;
      else if (data[element.name] !== undefined) element.value = data[element.name];
    });
    syncBranch();
  }

  function applyQueryType() {
    const type = new URLSearchParams(window.location.search).get('type');
    const choiceValue = queryTypeMap[type];
    const choice = projectTypeChoices.find((candidate) => candidate.value === choiceValue);
    if (!choice) return;
    choice.checked = true;
    syncBranch();
    if (type === 'collectivite') {
      form.elements.goal.value = 'Un site officiel clair pour notre collectivité.';
      form.elements.audience.value = 'Habitants, élus et services municipaux';
    }
    saveDraft();
  }

  function getStartedAt() {
    try {
      const draft = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
      return draft?.started_at || new Date().toISOString();
    } catch {
      return new Date().toISOString();
    }
  }

  function createSubmissionId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
      const random = Math.random() * 16 | 0;
      const value = char === 'x' ? random : (random & 0x3 | 0x8);
      return value.toString(16);
    });
  }

  function buildPayload() {
    const selected = projectTypeChoices.find((choice) => choice.checked)?.value || '';
    const now = new Date().toISOString();
    return {
      form_version: '1.0.0',
      submission_id: createSubmissionId(),
      project_type: projectTypeMap[selected],
      created_at: getStartedAt(),
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
          branch_one: form.elements['branch-one'].value,
          branch_two: form.elements['branch-two'].value,
        },
      },
      meta: {
        origin: window.location.href,
        referrer: document.referrer,
        language: document.documentElement.lang || 'fr',
      },
    };
  }

  function syncBranch() {
    const selected = projectTypeChoices.find((choice) => choice.checked)?.value || '';
    projectTypeInput.value = selected;
    const copy = branchCopy[selected] || branchCopy['idée encore floue'];
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
    status.textContent = '';
    form.querySelectorAll('[data-error]').forEach((element) => { element.textContent = ''; });
  }

  function validateStep(stepIndex) {
    const step = steps[stepIndex];
    if (stepIndex === 0 && !projectTypeChoices.some((choice) => choice.checked)) {
      showError('Choisissez un type de projet pour continuer.');
      return false;
    }
    const fields = [...step.querySelectorAll('input, textarea, select')].filter((field) => !field.disabled && field.type !== 'hidden');
    const invalid = fields.find((field) => !field.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      showError('Vérifiez la réponse indiquée avant de continuer.', invalid);
      return false;
    }
    return true;
  }

  function renderSummary() {
    const summary = document.querySelector('#idea-summary');
    const labels = [
      ['Type de projet', projectTypeInput.value],
      ['Votre objectif', form.elements.goal.value],
      ['Pour qui', form.elements.audience.value],
      ['Précisions', form.elements['branch-one'].value + '\n' + form.elements['branch-two'].value],
      ['Votre vision', form.elements.style.value],
      ['Budget', form.elements.budget.value],
      ['Démarrage', form.elements.start.value],
      ['Accompagnement', form.elements.support.value],
      ['Contact', [form.elements.firstname.value, form.elements.name.value, form.elements.email.value].filter(Boolean).join(' · ')],
    ];
    summary.replaceChildren();
    labels.forEach(([label, value]) => {
      const wrapper = document.createElement('div');
      const term = document.createElement('dt');
      const description = document.createElement('dd');
      term.textContent = label;
      description.textContent = value || 'Non renseigné';
      wrapper.append(term, description);
      summary.append(wrapper);
    });
  }

  function updateProgress() {
    const visibleIndex = Math.min(currentStep, 5);
    progressBar.style.width = (Math.max(1, visibleIndex + 1) / 6 * 100) + '%';
    progressLabel.textContent = currentStep === 6 ? 'Récapitulatif' : 'Étape ' + (visibleIndex + 1) + ' sur 6';
  }

  function showStep(nextStep) {
    currentStep = nextStep;
    steps.forEach((step) => { step.hidden = Number(step.dataset.step) !== currentStep; });
    const review = form.querySelector('[data-step="6"]');
    if (review) review.hidden = currentStep !== 6;
    updateProgress();
    clearError();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const heading = (currentStep === 6 ? review : steps[currentStep]).querySelector('legend, h2');
    heading?.focus?.({ preventScroll: true });
  }

  projectTypeChoices.forEach((choice) => choice.addEventListener('change', () => { syncBranch(); saveDraft(); }));
  form.addEventListener('input', saveDraft);
  form.addEventListener('change', saveDraft);

  form.querySelectorAll('.idea-next').forEach((button) => {
    button.addEventListener('click', () => {
      if (!validateStep(currentStep)) return;
      syncBranch();
      if (currentStep === 5) renderSummary();
      showStep(Math.min(6, currentStep + 1));
    });
  });

  form.querySelectorAll('.idea-back').forEach((button) => {
    button.addEventListener('click', () => showStep(Math.max(0, currentStep - 1)));
  });

  form.addEventListener('submit', async (event) => {
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
    clearError();
    submitButton.disabled = true;
    submitButton.textContent = 'Envoi en cours…';
    status.textContent = 'Votre demande est en cours d’envoi…';
    try {
      const response = await fetch('/api/submit-idee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(buildPayload()),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.fallback || !result.ok) throw new Error('submission_failed');
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
      window.location.assign('/merci/');
    } catch {
      submitButton.disabled = false;
      submitButton.textContent = 'Envoyer ma demande';
      showError('La demande n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.');
    }
  });

  restoreDraft();
  applyQueryType();
  syncBranch();
  showStep(0);
})();
