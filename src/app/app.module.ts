import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';

import { OrderModule } from 'ngx-order-pipe';

import 'hammerjs';

import {
  MdInputModule,
  MdListModule,
  MdButtonModule,
  MdTabsModule,
  MdIconModule,
  MdCardModule,
  MdChipsModule,
  MdSelectModule,
  MdRadioModule, MdCheckboxModule
} from '@angular/material';

import { AppComponent } from './app.component';
import { ContributionGridComponent } from './contribution-grid/contribution-grid.component';
import { ListingBackendService } from './services/listingBackend.service';
import { ListingService } from './services/listing.service';
import { Freewall } from './freewallRef';
import { CarouselComponent } from './carousel/carousel.component';
import { SmallerViewComponent } from './smaller-view/smaller-view.component';
import { SerendipitousViewComponent } from './serendipitous-view/serendipitous-view.component';
import { CreatorComponent } from './creator/creator.component';
import {VotingViewComponent} from './voting-view/voting-view.component';
import { ContributionComponent } from './contribution/contribution.component';
import { HomepageComponent } from './homepage/homepage.component';

const appRoutes: Routes = [
  { path: 'display/:position', component: SerendipitousViewComponent },
  { path: 'vote/:position', component: VotingViewComponent },
  { path: 'smaller', component: SmallerViewComponent },
  { path: 'creator', component: CreatorComponent },
  { path: '', component: HomepageComponent },
  { path: '**', component: HomepageComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    ContributionGridComponent,
    CarouselComponent,
    SmallerViewComponent,
    SerendipitousViewComponent,
    VotingViewComponent,
    CreatorComponent,
    ContributionComponent,
    HomepageComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true, useHash: true } // <-- debugging purposes only
    ),
    BrowserModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    OrderModule,
    MdInputModule,
    MdListModule,
    MdButtonModule,
    MdTabsModule,
    MdIconModule,
    MdCardModule,
    MdChipsModule,
    MdSelectModule,
    MdRadioModule,
    MdCheckboxModule
  ],
  providers: [
    ListingBackendService,
    ListingService,
    Freewall
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
