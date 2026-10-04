let counter = 0;

export function nextFactId(): string {
  counter += 1;
  return `F${counter}`;
}

export function resetGlobalFactIds(): void {
  counter = 0;
}
