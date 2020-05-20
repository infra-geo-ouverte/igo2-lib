import {
  Component,
  Input,
  ChangeDetectionStrategy,
  HostBinding
} from '@angular/core';
import { InteractiveTourService } from './../interactive-tour/interactive-tour.service';

@Component({
  selector: 'igo-panel',
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PanelComponent {

  @Input()
  get title() {
    return this._title;
  }
  set title(value: string) {
    this._title = value;
  }
  private _title: string;

  @Input()
  @HostBinding('class.igo-panel-with-header')
  get withHeader(): boolean {
    return this._withHeader;
  }
  set withHeader(value: boolean) {
    this._withHeader = value;
  }
  private _withHeader = true;

  constructor(private interactiveTourService: InteractiveTourService) {}

  startInteractiveTour() {
    console.log('tour tool partie');
    debugger;
    const title = this.title;
    console.log('titre de loutil:');
    // meilleur idée que d'utiliser le titre pour faire ceci??? le titre va changer si on change dans le fichier traduction
    // nb par contre c'est peut être une facon d'avoir un tour en anglais et un en francais..

    console.log(title);
    this.interactiveTourService.startTour(title);

  }
}
