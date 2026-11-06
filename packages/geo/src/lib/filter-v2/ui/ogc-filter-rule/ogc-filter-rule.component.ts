import {
  ChangeDetectionStrategy,
  Component,
  input,
  output
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { IgoLanguageModule } from '@igo2/core/language';

import {
  OgcFilterFieldOption,
  OgcFilterRuleOperator,
  OgcRuleNode,
  OgcRulePatch,
  getOgcRuleOperator
} from '../../model';

/** Operators editable from the UI (spatial rules are driven by map tools). */
const EDITABLE_RULE_OPERATORS: readonly OgcFilterRuleOperator[] = [
  'PropertyIsEqualTo',
  'PropertyIsNotEqualTo',
  'PropertyIsLike',
  'PropertyIsGreaterThan',
  'PropertyIsGreaterThanOrEqualTo',
  'PropertyIsLessThan',
  'PropertyIsLessThanOrEqualTo',
  'PropertyIsBetween',
  'PropertyIsNull',
  'During'
];

/**
 * Dumb editor of a single rule node of the AST. Emits flat patches; all
 * domain logic (including operator-driven kind conversion) lives in the
 * model layer.
 */
@Component({
  selector: 'igo-ogc-filter-rule',
  templateUrl: './ogc-filter-rule.component.html',
  styleUrls: ['./ogc-filter-rule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    IgoLanguageModule
  ]
})
export class OgcFilterRuleComponent {
  readonly rule = input.required<OgcRuleNode>();
  readonly fields = input<readonly OgcFilterFieldOption[]>([]);
  readonly removable = input(true);

  readonly patchRule = output<OgcRulePatch>();
  readonly removeRule = output<void>();

  readonly operators = EDITABLE_RULE_OPERATORS;

  get operator(): OgcFilterRuleOperator {
    return getOgcRuleOperator(this.rule());
  }

  get propertyName(): string {
    const rule = this.rule();
    return 'propertyName' in rule ? rule.propertyName : '';
  }

  get comparisonValue(): string | number {
    const rule = this.rule();
    return rule.kind === 'comparison' ? rule.value : '';
  }

  get likePattern(): string {
    const rule = this.rule();
    return rule.kind === 'like' ? rule.pattern : '';
  }

  get lowerBoundary(): number | '' {
    const rule = this.rule();
    return rule.kind === 'between' ? (rule.lowerBoundary ?? '') : '';
  }

  get upperBoundary(): number | '' {
    const rule = this.rule();
    return rule.kind === 'between' ? (rule.upperBoundary ?? '') : '';
  }

  get temporalBegin(): string {
    const rule = this.rule();
    return rule.kind === 'temporal' ? (rule.begin ?? '') : '';
  }

  get temporalEnd(): string {
    const rule = this.rule();
    return rule.kind === 'temporal' ? (rule.end ?? '') : '';
  }

  onPropertyNameInput(event: Event): void {
    this.patchRule.emit({
      propertyName: (event.target as HTMLInputElement).value
    });
  }

  onTextPatch(key: 'value' | 'pattern' | 'begin' | 'end', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.patchRule.emit({ [key]: value });
  }

  onNumberPatch(key: 'lowerBoundary' | 'upperBoundary', event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.patchRule.emit({ [key]: raw === '' ? undefined : Number(raw) });
  }
}
