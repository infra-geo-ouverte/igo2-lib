export interface IUser {
  id: number;
  defaultContextId: number | null;
  preference: IUserPreference | null;
  externalId: number;
  guides?: string[];
  hasOsrmPrivateAccess?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IUserPreference = Record<string, unknown>;
