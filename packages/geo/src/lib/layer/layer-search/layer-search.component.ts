import { Component, OnInit, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  FloatLabelType,
  MatFormFieldModule
} from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import { debounceTime } from 'rxjs';

@Component({
  selector: 'igo-layer-search',
  templateUrl: './layer-search.component.html',
  styleUrls: ['./layer-search.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatTooltipModule,
    MatIconModule,
    IgoLanguageModule
  ]
})
export class LayerSearchComponent implements OnInit {
  control = new FormControl();

  readonly initialValue = input<string>(undefined);
  readonly floatLabel = input<FloatLabelType>(undefined);
  readonly placeholder = input<string>(undefined);
  readonly tooltip = input<string>(undefined);

  readonly searchChange = output<string | undefined>();

  ngOnInit(): void {
    const initialValue = this.initialValue();
    if (initialValue) {
      this.control.setValue(initialValue, {
        emitEvent: false
      });
    }

    this.control.valueChanges.pipe(debounceTime(300)).subscribe((value) => {
      this.searchChange.emit(value);
    });
  }

  clearTerm(): void {
    this.control.reset();
  }
}
