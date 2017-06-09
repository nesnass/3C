import { Component, OnInit } from '@angular/core';
import {ContributionsService} from "../contributions.service";
import {Contribution} from "../models";

@Component({
  selector: '[app-carousel]',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent implements OnInit {

  standardRotationIntervalSeconds = 5;
  longRotationIntervalSeconds = 10;
  latestContribution: Contribution = null;
  selectedContribution: Contribution = null;
  contributions: Contribution[];

  constructor(private contributionService: ContributionsService) { }

  ngOnInit() {
    this.contributionService.contributions.subscribe(
      contributions => {
        this.contributions = contributions;

        // First time run, begin rotation
        if (this.selectedContribution === null) {
          this.rotateCarousel();
        }
      }
    );
  }

  rotateCarousel() {
    if (this.contributions.length > 0) {

      // A new contribution is shown for a longer time
      if (this.latestContribution === null || this.latestContribution._id !== this.contributions[0]._id) {
        this.latestContribution = this.contributions[0];
        this.selectedContribution = this.latestContribution;
        setTimeout(() => this.rotateCarousel(), this.longRotationIntervalSeconds * 1000);

      // Otherwise show a random contribution for a standard length of time
      } else {
        this.selectedContribution = this.contributions[Math.floor(Math.random() * this.contributions.length)];
        setTimeout(() => this.rotateCarousel(), this.standardRotationIntervalSeconds * 1000);
      }
    } else {
      setTimeout(() => this.rotateCarousel(), this.longRotationIntervalSeconds * 1000);
    }
  }

}
