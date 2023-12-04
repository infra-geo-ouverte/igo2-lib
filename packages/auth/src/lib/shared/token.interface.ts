import { BaseUser } from '@igo2/core';

import { JwtPayload } from 'jwt-decode';

export interface IgoJwtPayload extends JwtPayload {
  user: IgoUserInterface;
}

export interface IgoUserInterface extends BaseUser {
  sourceId?: string;
  locale?: string;
  isExpired?: boolean;
  isAdmin?: boolean;
}
