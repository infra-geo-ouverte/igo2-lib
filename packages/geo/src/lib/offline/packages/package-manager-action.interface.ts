import { PackageInfo } from '@igo2/geo';

export enum PackageManagerActionType {
  DOWNLOADING,
  INSTALLING,
  DELETING
}

export interface BaseAction {
  package: PackageInfo;
}

export interface DownloadAction extends BaseAction {
  type: PackageManagerActionType.DOWNLOADING;
  progress?: number;
}

export interface InstallAction extends BaseAction {
  type: PackageManagerActionType.INSTALLING;
  progress: number;
}

export interface DeleteAction extends BaseAction {
  type: PackageManagerActionType.DELETING;
}

export type PackageManagerAction =
  | DownloadAction
  | InstallAction
  | DeleteAction;
