export function encodeId(id: number | string): string {
  return btoa(String(id));
}

export function decodeId(token: string): string {
  return atob(token);
}
