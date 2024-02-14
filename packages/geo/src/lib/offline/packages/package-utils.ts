import { DownloadedPackage, PackageMetadata } from './package-info.interface';

export const packageMetadataToDownloadedPackage = (
  metadata: PackageMetadata
): DownloadedPackage => {
  const { files, ...other } = metadata;
  return {
    ...other,
    totalFiles: files.length
  };
};
