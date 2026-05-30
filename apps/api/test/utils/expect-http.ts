import { Response } from 'supertest';

export function expectError(
  response: Response,
  statusCode: number,
  message?: string | RegExp,
): void {
  expect(response.status).toBe(statusCode);
  expect(response.body).toMatchObject({ statusCode });
  if (message === undefined) {
    return;
  }
  const bodyMessage = response.body.message;
  if (typeof message === 'string') {
    if (Array.isArray(bodyMessage)) {
      expect(bodyMessage.join(' ')).toContain(message);
    } else {
      expect(bodyMessage).toContain(message);
    }
  } else {
    const text = Array.isArray(bodyMessage)
      ? bodyMessage.join(' ')
      : String(bodyMessage);
    expect(text).toMatch(message);
  }
}

export function expectMessageIncludes(
  response: Response,
  fragment: string,
): void {
  const bodyMessage = response.body.message;
  const text = Array.isArray(bodyMessage)
    ? bodyMessage.join(' ')
    : String(bodyMessage);
  expect(text).toContain(fragment);
}
