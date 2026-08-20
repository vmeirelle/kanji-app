import { Result } from 'ts-results'
import TagError from '../../../EnterpriseBusiness/errors/TagError'

export type HttpHeaders = { [key: string]: string }

export enum HttpStatus {
  ok = 200,
  created = 201,
  noContent = 204,
  badRequest = 400,
  unauthorized = 401,
  forbidden = 403,
  notFound = 404,
  conflict = 409,
  unprocessableEntity = 422,
  internalServerError = 500,
}

export type HttpQuery = { [key: string]: string | undefined | HttpQuery | HttpQuery[] }

export enum HttpMethod {
  get = 'GET',
  post = 'POST',
  put = 'PUT',
  delete = 'DELETE',
  options = 'OPTIONS',
}

export type HttpResponse<Body = unknown, Headers = HttpHeaders, Status = HttpStatus> = {
  body?: Body
  headers?: Headers
  status: Status
}

export type HttpResult<Body = unknown, Headers = HttpHeaders, Status = HttpStatus> = Result<
  HttpResponse<Body, Headers, Status>,
  TagError
>

export interface HttpRequest<Body = unknown, Query = HttpQuery, Headers = HttpHeaders> {
  body: Body
  params: { [key: string]: string }
  query: Query
  headers: Headers
  method: HttpMethod
  url: string
}
