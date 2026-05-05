import { ContextProfils, TypePermission } from '../shared';

export interface ContextPermission {
  id?: string;
  contextId?: string;
  profil: string;
  profilTitle?: string;
  typePermission: TypePermission;
}

export interface ContextUserPermission {
  name: string;
  checked: boolean;
  indeterminate?: boolean;
}

export interface ContextUserOrProfils extends ContextProfils {
  id: number;
  type: 'user' | 'profil';
}

export type IAnyContextPermission =
  | IContextPermissionProfil
  | IContextPermissionUser;

export interface IContextPermissionUser extends IBaseContextPermission {
  userId: number;
  profilType: 'user';
  userSource: string;
  user: {
    id: number;
    externalId: number;
  };
}

export interface IContextPermissionProfil extends IBaseContextPermission {
  profilId: number;
  profilType: 'profil';
}

interface IBaseContextPermission {
  id: number;
  title: string;
  typePermission: TypePermission | null;
  contextId: number;
}
