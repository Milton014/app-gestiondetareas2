export function isValidTaskTitle(title: string): boolean {
  const length = title.trim().length;
  return length > 0 && length <= 100;
}
