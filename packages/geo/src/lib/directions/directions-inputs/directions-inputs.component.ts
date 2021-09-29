import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { map } from 'rxjs/operators';
import { Subscription, zip } from 'rxjs';

import { EntityStore } from '@igo2/common';

import { Stop } from '../shared/directions.interface';

import { SearchService } from '../../search/shared/search.service';
import { SearchResult } from '../../search/shared/search.interfaces';
import { Feature } from '../../feature/shared/feature.interfaces';
import pointOnFeature from '@turf/point-on-feature';
import { computeRelativePosition, updateStoreSorting } from '../shared/directions.utils';

@Component({
  selector: 'igo-directions-inputs',
  templateUrl: './directions-inputs.component.html',
  styleUrls: ['./directions-inputs.component.scss']
})
export class DirectionsInputsComponent {


  get allStops() {
    return this.stopsStore.view.all();
  }
  private readonly invalidKeys = ['Control', 'Shift', 'Alt'];

  private search$$: Subscription;
  @Input() stopsStore: EntityStore<Stop>;

  @Input() debounce: number = 200;
  @Input() length: number = 2;

  constructor(
    private searchService: SearchService,
    private cdRef: ChangeDetectorRef
  ) { }


  private computeSearchProposal(term: string, stop: Stop) {
    if (term !== undefined || term.length !== 0) {
      if (this.search$$) {
        this.search$$.unsubscribe();
      }
      const researches = this.searchService.search(term, { searchType: 'Feature' });
      const requests$ = researches.map(
        res => res.request
          .pipe(
            map((results: SearchResult[]) => results.filter(r => r.data.geometry)))
      );
      this.search$$ = zip(...requests$)
        .pipe(
          map((searchRequests: SearchResult[][]) => [].concat.apply([], searchRequests)),
          map((searchResults: SearchResult[]) => {
            const searchProposals = [];
            [...new Set(searchResults.map(item => item.source))].map(source => {
              searchProposals.push({
                source,
                meta: searchResults.find(sr => sr.source === source).meta,
                results: searchResults.filter(sr => sr.source === source).map(r => r.data)
              });
            });
            stop.searchProposals = searchProposals;
          })
        ).subscribe(() => this.cdRef.detectChanges());
    }

  }

  chooseProposal(result: Feature, stop: Stop) {
    if (result) {
      let geomCoord;
      const geom = result.geometry;
      if (geom.type === 'Point') {
        geomCoord = geom.coordinates;
      } else {
        const point = pointOnFeature(result.geometry);
        geomCoord = [
          point.geometry.coordinates[0],
          point.geometry.coordinates[1]
        ];
      }
      if (geomCoord) {
        stop.coordinates = geomCoord;
        stop.text = result.meta.title;
        this.stopsStore.update(stop);
      }
    }
  }

  setStopText(event: KeyboardEvent, stop: Stop) {
    const term = (event.target as HTMLInputElement).value;
    if (this.validateTerm(term)) {
      stop.text = term;
      this.computeSearchProposal(term, stop);
      this.stopsStore.update(stop);
    }
  }

  validateTerm(term: string) {
    if (
      this.keyIsValid(term) &&
      (term.length >= this.length || term.length === 0)
    ) {
      return true;
    }
    return false;
  }

  private keyIsValid(key: string) {
    return this.invalidKeys.find(value => value === key) === undefined;
  }

  removeStop(stop: Stop) {
    this.stopsStore.delete(stop);
    // todo state de lui + suivant
  }

  clearStop(stop: Stop) {
    this.stopsStore.update({ id: stop.id });   
  }


  drop(event: CdkDragDrop<string[]>) {
    this.moveStops(event.previousIndex, event.currentIndex);
  }

  private moveStops(fromIndex, toIndex) {
    if (fromIndex !== toIndex) {
      const stopsWithState = [...this.stopsStore.stateView.all()];
      moveItemInArray(stopsWithState, fromIndex, toIndex);
      stopsWithState.map((stopWithState, i) => {
        const relativePosition = computeRelativePosition(i,stopsWithState.length)
        this.stopsStore.state.update(stopWithState.entity, { position : i, relativePosition})
      });
      updateStoreSorting(this.stopsStore);
    }
  }

}
