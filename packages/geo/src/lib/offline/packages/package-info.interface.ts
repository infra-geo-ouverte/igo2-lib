export interface PackageInfo {
  id: string;
  url: string;
  title: string;
  expiration: Date;
  size: number;
}

export interface PackageMetadata extends PackageInfo {
  files: FileMetadata[];
}

export interface DownloadingPackage extends PackageInfo {
  type: DownloadedPackageStatus.DOWNLOADING;
}

// TODO add to DownloadedPackage
export enum DownloadedPackageStatus {
  IN_QUEUE = 'IN_QUEUE',
  DOWNLOADING = 'DOWNLOADING',
  INSTALLING = 'INSTALLING',
  INSTALLED = 'INSTALLED'
}

export interface DownloadedPackage extends PackageInfo {
  type: DownloadedPackageStatus.INSTALLING | DownloadedPackageStatus.INSTALLED;
  totalFiles: number;
}

export type DevicePackageInfo = DownloadedPackage | DownloadingPackage;

export interface FileMetadata {
  url: string;
  fileName: string;
}
