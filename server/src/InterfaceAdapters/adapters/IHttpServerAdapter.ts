import { HttpRequest, HttpResponse } from '../gateway/http/Http.types'

export default interface IHttpServerAdapter<Req, Res> {
  start(port: number): Promise<void>
  stop(): Promise<void>
  toHttpRequest(req: Req): Promise<HttpRequest>
  toHttpResponse(res: HttpResponse, originalRes?: Res): Promise<Res>
}
