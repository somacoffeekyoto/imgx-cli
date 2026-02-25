export function success(data: Record<string, unknown>): never {
  console.log(JSON.stringify({ success: true, ...data }));
  process.exit(0);
}

export function fail(error: string): never {
  console.log(JSON.stringify({ success: false, error }));
  process.exit(1);
}
