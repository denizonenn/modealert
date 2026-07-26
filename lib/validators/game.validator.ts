export function validateGameName(name: string) {
  return name.trim().length >= 2;
}