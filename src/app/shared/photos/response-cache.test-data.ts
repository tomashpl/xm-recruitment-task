import { HttpHeaders, HttpResponse } from '@angular/common/http';

export function apiResponse(
  body: unknown,
  headers: Record<string, string> = {},
): HttpResponse<unknown> {
  return new HttpResponse({
    body,
    headers: new HttpHeaders(headers),
    status: 200,
    statusText: 'OK',
  });
}
