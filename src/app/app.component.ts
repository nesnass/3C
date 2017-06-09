import { Component, OnInit } from '@angular/core';
import {ContributionsService} from "./contributions.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [
    ContributionsService
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

  toggleDetail($event) {
    this.showCarousel = false;
    this.showDetail = true;

    this.showDetailTimer = setTimeout(() => {
      this.showDetail = false;
      this.showCarousel = true;
    }, 20000)
  }

}
