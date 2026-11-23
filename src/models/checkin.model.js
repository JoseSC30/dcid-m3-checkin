export function validateCheckin({ code, event_id } = {}) {
  if (
    typeof code !== "string" ||
    !code.trim() ||
    !Number.isInteger(Number(event_id)) ||
    Number(event_id) < 1
  )
    throw new Error("Código y evento válidos requeridos");
  return true;
}
