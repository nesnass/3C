import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { ContributionGridComponent } from './contribution-grid/contribution-grid.component';
import { ContributionsService } from './contributions.service';
import {Freewall} from './freewallRef';
import { CarouselComponent } from './carousel/carousel.component';
import { SmallerViewComponent } from './smaller-view/smaller-view.component';
import { NormalViewComponent } from './normal-view/normal-view.component';

const appRoutes: Routes = [
  { path: '', component: NormalViewComponent },
  { path: 'smaller', component: SmallerViewComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    ContributionGridComponent,
    CarouselComponent,
    SmallerViewComponent,
    NormalViewComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    FormsModule,
    HttpModule,
    BrowserAnimationsModule,
    FlexLayoutModule
  ],
  providers: [
    ContributionsService,
    Freewall
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
