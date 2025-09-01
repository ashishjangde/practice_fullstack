import { ZodError } from "zod";

export function zodErrorFormator(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    result[path] = issue.message;
  }

  return result;
}
