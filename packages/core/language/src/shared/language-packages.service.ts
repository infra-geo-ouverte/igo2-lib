import { Injectable } from '@angular/core';

import { LanguagePackage } from './language.interface';

@Injectable({
  providedIn: 'root'
})
export class LanguagePackagesService {
  private readonly packages = new Set<LanguagePackage>();

  register(packageName: LanguagePackage): void {
    if (!packageName) {
      return;
    }

    this.packages.add(packageName);
  }

  registerMany(packageNames: readonly LanguagePackage[]): void {
    packageNames.forEach((packageName) => this.register(packageName));
  }

  getAll(): LanguagePackage[] {
    return Array.from(this.packages);
  }
}
