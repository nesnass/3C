import { Component, OnInit } from '@angular/core';
import {ContributionsService} from "./contributions.service";
import {LocationStrategy, PathLocationStrategy} from "@angular/common";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    ContributionsService, Location, {provide: LocationStrategy, useClass: PathLocationStrategy}
  ]
})
export class AppComponent implements OnInit {
  showDetail = false;
  showCarousel = true;
  showDetailTimer = null;

  constructor(private contributionService: ContributionsService) {

  }

  ngOnInit(): void {
    this.contributionService.startServerPolling();
  }

  toggleDetail() {
    this.showCarousel = false;
    this.showDetail = true;

    this.showDetailTimer = setTimeout(() => {
      this.showDetail = false;
      this.showCarousel = true;
    }, 20000)
  }

}
