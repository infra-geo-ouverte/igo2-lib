import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { BehaviorSubject, Observable } from 'rxjs';

import { PackageInfo } from './package-info.interface';

@Injectable({
  providedIn: 'root'
})
export class PackageManagerService {
  private packagesSubject: BehaviorSubject<PackageInfo[]> = new BehaviorSubject(
    []
  );

  get packages$(): Observable<PackageInfo[]> {
    return this.packagesSubject;
  }

  get packages() {
    return this.packagesSubject.value;
  }

  constructor(private http: HttpClient) {
    this.actualizePackages();
  }

  actualizePackages() {
    this.http
      .get<PackageInfo[]>('assets/packages/tile-packages.json')
      .subscribe((newPackages) => {
        console.log('new packages', newPackages);
        this.packagesSubject.next(newPackages);
      });
  }
}
