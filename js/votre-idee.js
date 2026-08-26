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

  form.addEventListener('submit', (event) => {
    if (currentStep !== 6) {
      event.preventDefault();
      return;
    }
    if (!validateStep(5)) {
      event.preventDefault();
      showStep(5);
      return;
    }
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  });

  restoreDraft();
  syncBranch();
  showStep(0);
})();

