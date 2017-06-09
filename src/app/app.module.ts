import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { ContributionGridComponent } from './contribution-grid/contribution-grid.component';
import { ContributionsService } from "./contributions.service";
import {Freewall} from "./freewallRef";
import { CarouselComponent } from './carousel/carousel.component';

@NgModule({
  declarations: [
    AppComponent,
    ContributionGridComponent,
    CarouselComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    FlexLayoutModule
  ],
  providers: [
    ContributionsService,
    Freewall
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
