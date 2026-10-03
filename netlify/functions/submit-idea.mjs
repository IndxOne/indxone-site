import { handler, isObject, clean, text, email, iso } from "./_shared/forms.mjs";
const types = ["pilotage", "besoin", "solution", "processus", "mariage", "site", "application", "activite", "idee_floue"];
const starts = ["J'explore encore", "Dans le mois", "Dans les 3 mois", "Ce trimestre", "À une date précise"];
const supports = [
  "Cadrer le besoin",
  "Piloter la mise en œuvre",
  "Jusqu'à la mise en production",
  "Clarifier l'idée et démarrer",
  "Construire une première version",
  "Jusqu'à la mise en ligne",
  "Je ne sais pas encore",
];
const budgets = ["", "Moins de 1 500 €", "1 500–5 000 €", "5 000–15 000 €", "Budget à définir ensemble"];
export function validatePayload(body) {
  const errors = [];
  if (body.form_version !== "1.0.0") errors.push("form_version invalide");
  if (!types.includes(body.project_type)) errors.push("project_type invalide");
  const contact = body.contact;
  if (
    !isObject(contact) ||
    !text(contact.nom, 200, true) ||
    !text(clean(contact.nom), 200, true) ||
    !text(contact.email, 200, true) ||
    !email(clean(contact.email))
  )
    errors.push("Nom et email valides requis");
  if (isObject(contact) && (!text(contact.prenom ?? "", 200) || !text(contact.phone ?? "", 50)))
    errors.push("Prénom ou téléphone invalide");
  if (
    !isObject(body.consent) ||
    body.consent.accepted !== true ||
    !iso(body.consent.accepted_at) ||
    Math.abs(Date.now() - Date.parse(body.consent.accepted_at)) > 300000
  )
    errors.push("Consentement horodaté requis");
  const responses = body.responses;
  if (!isObject(responses) || !isObject(responses.trunk) || !isObject(responses.conditional))
    return [...errors, "Réponses requises"];
  const trunk = responses.trunk;
  const conditional = responses.conditional;
  if (!text(trunk.goal, 2000, true) || !text(clean(trunk.goal), 2000, true))
    errors.push("goal requis (2000 caractères maximum)");
  for (const key of ["audience", "style", "examples"])
    if (!text(trunk[key] ?? "", 2000)) errors.push(`${key} invalide (2000 caractères maximum)`);
  if (!text(trunk.budget ?? "", 200)) errors.push("Exemples ou budget invalide");
  if (
    !["", ...starts].includes(trunk.start ?? "") ||
    !["", ...supports].includes(trunk.support ?? "") ||
    !budgets.includes(trunk.budget ?? "")
  )
    errors.push("Option de projet invalide");
  if (
    Object.keys(trunk).some(
      (key) => !["goal", "audience", "style", "start", "support", "examples", "budget"].includes(key)
    ) ||
    Object.keys(conditional).some((key) => !["branch_one", "branch_two"].includes(key))
  )
    errors.push("Champ de réponse inconnu");
  for (const key of ["branch_one", "branch_two"])
    if (!text(conditional[key] ?? "", 2000)) errors.push(`${key} invalide (2000 caractères maximum)`);
  if (
    body.meta !== undefined &&
    (!isObject(body.meta) ||
      !text(body.meta.origin ?? "", 2000) ||
      !text(body.meta.referrer ?? "", 2000) ||
      !text(body.meta.language ?? "", 20))
  )
    errors.push("Métadonnées invalides");
  return errors;
}
const fields = (body) => {
  const trunk = body.responses.trunk;
  const branch = body.responses.conditional;
  return Object.fromEntries(
    Object.entries({
      "form-version": body.form_version,
      "created-at": body.created_at,
      "project-type": body.project_type,
      "project-type-choice": body.project_type,
      ...trunk,
      "branch-one": branch.branch_one,
      "branch-two": branch.branch_two,
      name: body.contact.nom,
      firstname: body.contact.prenom || "",
      email: body.contact.email,
      phone: body.contact.phone || "",
      consent: "true",
      "consent-at": body.consent.accepted_at,
      origin: body.meta?.origin || "",
      referrer: body.meta?.referrer || "",
      language: body.meta?.language || "fr",
      company_name: "",
      "bot-field": "",
    }).map(([key, value]) => [key, clean(value)])
  );
};
export default handler(validatePayload, fields, "soumission-votre-idee", "company_name");
