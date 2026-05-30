export type ApiErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
};

export function formatApiErrorMessage(body: ApiErrorBody): string {
  if (Array.isArray(body.message)) {
    return body.message.join(', ');
  }

  return body.message;
}

export async function parseApiError(response: Response): Promise<string> {
  const text = await response.text();
  if (!text) {
    return `Ошибка запроса: ${response.status}`;
  }

  try {
    const body = JSON.parse(text) as ApiErrorBody;
    if (body.message) {
      return formatApiErrorMessage(body);
    }
  } catch {
    // ответ не в формате JSON — возвращаем как есть
  }

  return text;
}
