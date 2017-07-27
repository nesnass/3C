import { Component, OnInit } from '@angular/core';
import {LocationStrategy, PathLocationStrategy} from '@angular/common';
import {ActivatedRoute, Params} from '@angular/router';
import {Options} from './models';
import {ListingService} from './services/listing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    ListingService, Location, {provide: LocationStrategy, useClass: PathLocationStrategy}
  ]
})
export class AppComponent implements OnInit {
  constructor(private listingService: ListingService, private activatedRoute: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params.hasOwnProperty('viewmode')) {
        const newOptions: Options = this.listingService.options;
        newOptions.viewMode = params['viewmode'];   // Set options here based on the route called
        this.listingService.options = newOptions;
      }
    });
    // this.contributionService.startServerPolling();
  }

}
