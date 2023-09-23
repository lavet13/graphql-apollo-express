import { IncomingHttpHeaders } from 'http';
import { RoleModel } from './db/models/role.models';

declare module 'http' {
  interface IncomingHttpHeaders {
    'x-token'?: string;
  }
}

export type MappedRoleModel = {
  [K in keyof RoleModel]: K extends 'name' ? 'User' | 'Admin' : RoleModel[K];
};

declare module 'jsonwebtoken' {
  export interface MeJwtPayload extends JwtPayload {
    id: number;
    username: string;
    email: string;
    roles: MappedRoleModel[];
  }
}
