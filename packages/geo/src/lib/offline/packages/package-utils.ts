import {
  DownloadedPackage,
  DownloadedPackageStatus,
  PackageMetadata
} from './package-info.interface';

export const packageMetadataToDownloadedPackage = (
  metadata: PackageMetadata
): DownloadedPackage => {
  const { files, ...other } = metadata;
  return {
    type: DownloadedPackageStatus.INSTALLED,
    ...other,
    totalFiles: files.length
  };
};
