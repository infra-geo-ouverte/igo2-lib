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
  status: DevicePackageStatus.DOWNLOADING;
}

// TODO add to DownloadedPackage
export enum DevicePackageStatus {
  // IN_QUEUE = 'IN_QUEUE',
  DOWNLOADING = 'DOWNLOADING',
  INSTALLING = 'INSTALLING',
  INSTALLED = 'INSTALLED',
  DELETING = 'DELETING'
}

export interface DownloadedPackage extends PackageInfo {
  status:
    | DevicePackageStatus.INSTALLING
    | DevicePackageStatus.INSTALLED
    | DevicePackageStatus.DELETING;
  totalFiles: number;
}

export type DevicePackageInfo = DownloadedPackage | DownloadingPackage;

export interface FileMetadata {
  url: string;
  fileName: string;
}
