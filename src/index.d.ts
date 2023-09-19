import { IncomingHttpHeaders } from 'http';

declare module 'http' {
  interface IncomingHttpHeaders {
    'x-token'?: string;
  }
}

declare module 'jsonwebtoken' {
  export interface MeJwtPayload extends JwtPayload {
    id: string;
    username: string;
    emal: string;
  }
}