import { JwtPayload } from 'jwt-decode';

import { User } from './auth.interface';

export interface IgoJwtPayload extends JwtPayload {
  user: User;
}
