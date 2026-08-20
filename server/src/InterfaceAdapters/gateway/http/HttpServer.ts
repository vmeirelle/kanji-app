import 'reflect-metadata'
import { Result } from 'ts-results'
import { IncomingMessage, ServerResponse } from 'http'
import { Key, pathToRegexp } from 'path-to-regexp'
import {
  HttpHeaders,
  HttpMethod,
  HttpRequest,
  HttpResponse,
  HttpResult,
  HttpStatus,
} from './Http.types'
import IHttpServerAdapter from '../../adapters/IHttpServerAdapter'
import TagError from '../../../EnterpriseBusiness/errors/TagError'

export type HttpControllerFunction = (req: HttpRequest<any, any, any>) => Promise<HttpResult<any, any, any>>

export interface IHttpController {
  baseUrl: string
  endpoints: { url: string; method: HttpMethod; fn: HttpControllerFunction }[]
  errorHandling(e: unknown): HttpResponse
  middleware?: (req: HttpRequest) => Promise<Result<unknown, TagError>>
}

interface ServerEndpoint {
  url: { regex: RegExp; keys: Key[] }
  method: HttpMethod
  fn: HttpControllerFunction
  controller: IHttpController
}

export class HttpServer<
  Req extends IncomingMessage = IncomingMessage,
  Res extends ServerResponse = ServerResponse,
> {
  endpoints: ServerEndpoint[] = []

  constructor(readonly httpServerAdapter: IHttpServerAdapter<Req, Res>) {}

  start(port: number): Promise<void> {
    return this.httpServerAdapter.start(port)
  }

  stop(): Promise<void> {
    return this.httpServerAdapter.stop()
  }

  registerController(controller: IHttpController): void {
    controller.endpoints.forEach((endpoint) => {
      const url = endpoint.url.endsWith('/') ? endpoint.url.slice(0, -1) : endpoint.url
      console.log(`Registering ${endpoint.method.padEnd(5, ' ')} ${endpoint.url}`)
      const keys: Key[] = []
      this.endpoints.push({
        url: { regex: pathToRegexp(url, keys), keys },
        method: endpoint.method,
        fn: endpoint.fn.bind(controller),
        controller,
      })
    })
  }

  corsHeaders(): HttpHeaders {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  }

  async onRequest(originalReq: Req, originalRes: Res): Promise<{ res: Res; found: boolean }> {
    const url = (originalReq.url || '').split('?')[0]
    const matching = this.endpoints.filter((end) => end.url.regex.exec(url) !== null)
    const endpoint = matching.find((item) => item.method === originalReq.method)

    const res: HttpResponse = {
      status: HttpStatus.ok,
      body: {},
      headers: { 'Content-Type': 'application/json', ...this.corsHeaders() },
    }

    if (originalReq.method === HttpMethod.options) {
      res.status = HttpStatus.noContent
      return { res: await this.httpServerAdapter.toHttpResponse(res, originalRes), found: true }
    }

    if (!endpoint) {
      return { res: originalRes, found: false }
    }

    const req = await this.httpServerAdapter.toHttpRequest(originalReq)
    req.params = this.parseUrlParams(url, endpoint)

    try {
      const endpointFnRes = await endpoint.fn(req)
      if (endpointFnRes.err) {
        const handled = endpoint.controller.errorHandling(endpointFnRes.val)
        res.body = handled.body
        res.status = handled.status
        res.headers = { ...this.corsHeaders(), ...(handled.headers || {}) }
      } else {
        const response = endpointFnRes.unwrap()
        res.body = response.body
        res.status = response.status
        res.headers = { 'Content-Type': 'application/json', ...this.corsHeaders(), ...(response.headers || {}) }
      }
    } catch (e) {
      const handled = endpoint.controller.errorHandling(e)
      res.body = handled.body
      res.status = handled.status
      res.headers = { ...this.corsHeaders(), ...(handled.headers || {}) }
    }

    return { res: await this.httpServerAdapter.toHttpResponse(res, originalRes), found: true }
  }

  private parseUrlParams(url: string, endpoint: ServerEndpoint): { [key: string]: string } {
    const urlParams = endpoint.url.regex.exec(url)
    if (!urlParams) return {}
    return Object.fromEntries(
      endpoint.url.keys.map((key, index) => [key.name, urlParams[index + 1]]),
    )
  }
}

const FormatMetadataKey = Symbol('format')

export function Route(url: string) {
  return <T extends { new (...args: any[]): object }>(constructor: T) => {
    const endpoints: IHttpController['endpoints'] =
      Reflect.getOwnMetadata(FormatMetadataKey, constructor.prototype) || []
    const normalizedEndpoints = endpoints.map((endpoint) => ({
      ...endpoint,
      url: url + endpoint.url,
    }))
    return class extends constructor {
      baseUrl = url
      endpoints = normalizedEndpoints
    }
  }
}

function defineEndpoint(method: HttpMethod, url: string) {
  return (target: IHttpController, _propertyKey: string, descriptor: PropertyDescriptor) => {
    const endpoints: IHttpController['endpoints'] =
      Reflect.getOwnMetadata(FormatMetadataKey, target) || []
    if (descriptor.value) {
      endpoints.push({ url, method, fn: descriptor.value })
      Reflect.defineMetadata(FormatMetadataKey, endpoints, target)
    }
    return descriptor
  }
}

export function Get(url: string) {
  return defineEndpoint(HttpMethod.get, url)
}

export function Post(url: string) {
  return defineEndpoint(HttpMethod.post, url)
}

export function Put(url: string) {
  return defineEndpoint(HttpMethod.put, url)
}

export function Delete(url: string) {
  return defineEndpoint(HttpMethod.delete, url)
}
