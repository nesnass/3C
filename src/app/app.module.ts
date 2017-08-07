import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import 'hammerjs';

import {MdInputModule, MdListModule, MdButtonModule, MdTabsModule, MdIconModule, MdCardModule, MdChipsModule} from '@angular/material';

import { AppComponent } from './app.component';
import { ContributionGridComponent } from './contribution-grid/contribution-grid.component';
import { ListingBackendService } from './services/listingBackend.service';
import { ListingService } from './services/listing.service';
import { Freewall } from './freewallRef';
import { CarouselComponent } from './carousel/carousel.component';
import { SmallerViewComponent } from './smaller-view/smaller-view.component';
import { NormalViewComponent } from './normal-view/normal-view.component';
import { CreatorComponent } from './creator/creator.component';

const appRoutes: Routes = [
  { path: 'display', component: NormalViewComponent },
  { path: 'smaller', component: SmallerViewComponent },
  { path: 'creator', component: CreatorComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    ContributionGridComponent,
    CarouselComponent,
    SmallerViewComponent,
    NormalViewComponent,
    CreatorComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    ),
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    MdInputModule,
    MdListModule,
    MdButtonModule,
    MdTabsModule,
    MdIconModule,
    MdCardModule,
    MdChipsModule
  ],
  providers: [
    ListingBackendService,
    ListingService,
    Freewall
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
