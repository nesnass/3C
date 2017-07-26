import { Component, OnInit } from '@angular/core';
import {ContributionsService} from './contributions.service';
import {LocationStrategy, PathLocationStrategy} from '@angular/common';
import {ActivatedRoute, Params} from '@angular/router';
import {Options} from './models';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    ContributionsService, Location, {provide: LocationStrategy, useClass: PathLocationStrategy}
  ]
})
export class AppComponent implements OnInit {
  constructor(private contributionService: ContributionsService, private activatedRoute: ActivatedRoute) {

  }

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      if (params.hasOwnProperty('viewmode')) {
        const newOptions: Options = this.contributionService.options;
        newOptions.viewMode = params['viewmode'];   // Set options here based on the route called
        this.contributionService.options = newOptions;
      }
    });
    this.contributionService.startServerPolling();
  }

}
