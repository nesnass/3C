import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppComponent } from './app.component';
import { ContributionComponent } from './contribution/contribution.component';
import { ContributionGridComponent } from './contribution-grid/contribution-grid.component';
import { ContributionsService } from "./contributions.service";
import {Freewall} from "./freewallRef";

@NgModule({
  declarations: [
    AppComponent,
    ContributionComponent,
    ContributionGridComponent
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
