import { handler, clean, text, email } from "./_shared/forms.mjs";
const subjects = {
  fr: [
    "Projet AMOA / Architecture SI",
    "Automatisation / No-code",
    "Infrastructure / Cloud",
    "Intégration ERP / CRM",
    "Kit de lancement",
    "IndxOne Hub / cockpit de pilotage",
    "Site mairie / Collectivité",
    "Autre demande",
  ],
  en: [
    "AMOA / IT Architecture project",
    "Automation / No-code",
    "Infrastructure / Cloud",
    "ERP / CRM Integration",
    "Kit de lancement",
    "IndxOne Hub / steering cockpit",
    "Municipality website",
    "Other request",
  ],
};
export function validatePayload(body) {
  const errors = [];
  if (
    !text(body.nom, 200, true) ||
    !text(clean(body.nom), 200, true) ||
    !text(body.email, 200, true) ||
    !email(clean(body.email))
  )
    errors.push("Nom et email valides requis");
  if (!text(body.message, 2000, true) || !text(clean(body.message), 2000, true) || clean(body.message).length < 10)
    errors.push("Message requis (10–2000 caractères)");
  if (!Object.hasOwn(subjects, body.lang) || !subjects[body.lang].includes(body.sujet))
    errors.push("Langue ou sujet invalide");
  for (const key of ["prenom", "budget", "delai"]) if (!text(body[key] ?? "", 200)) errors.push(`${key} invalide`);
  if (body.consent !== true && body.consent !== "true" && body.consent !== "on") errors.push("Consentement requis");
  return errors;
}
const fields = (body) =>
  Object.fromEntries(
    ["nom", "prenom", "email", "sujet", "message", "budget", "delai"]
      .map((key) => [key, clean(body[key] || "")])
      .concat([["consent", "true"]])
  );
export default handler(
  validatePayload,
  fields,
  (body) => (body.lang === "en" ? "contact-indxone-en" : "contact-indxone"),
  "bot_field"
);
