import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { IgoCoreModule } from '@igo/core';
import { IgoAuthModule } from '@igo/auth';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IgoCoreModule.forRoot(), IgoAuthModule.forRoot()],
  bootstrap: [AppComponent]
})
export class AppModule {}
