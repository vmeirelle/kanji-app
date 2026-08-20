import queryString from 'qs'
import { IncomingMessage, ServerResponse } from 'http'
import IHttpServerAdapter from '../../InterfaceAdapters/adapters/IHttpServerAdapter'
import {
  HttpHeaders,
  HttpMethod,
  HttpQuery,
  HttpRequest,
  HttpResponse,
} from '../../InterfaceAdapters/gateway/http/Http.types'

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk.toString()
    })
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'))
      } catch {
        resolve({})
      }
    })
  })
}

export default class HttpServerAdapter
  implements IHttpServerAdapter<IncomingMessage, ServerResponse>
{
  constructor(readonly httpServer: import('http').Server) {}

  start(port: number): Promise<void> {
    if (!this.httpServer.listening) this.httpServer.listen(port)
    return Promise.resolve()
  }

  stop(): Promise<void> {
    this.httpServer.close()
    return Promise.resolve()
  }

  async toHttpRequest(req: IncomingMessage): Promise<HttpRequest> {
    const body = await readBody(req)
    const [url, queryStr] = (req.url || '').split('?')
    const query = queryString.parse(queryStr || '')
    return {
      url: url || '',
      body,
      params: {},
      headers: req.headers as HttpHeaders,
      method: req.method as HttpMethod,
      query: query as HttpQuery,
    }
  }

  toHttpResponse(res: HttpResponse, originalRes?: ServerResponse): Promise<ServerResponse> {
    const response = originalRes as ServerResponse
    const headers = res.headers || {}
    response.statusCode = res.status
    Object.entries(headers).forEach(([key, value]) => response.setHeader(key, value))
    if (res.body) response.write(JSON.stringify(res.body))
    response.end()
    return Promise.resolve(response)
  }
}
