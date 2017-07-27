import { Component, OnInit } from '@angular/core';
import {Contribution} from '../models';

import { trigger, state, style, animate, transition } from '@angular/animations';
import {ListingService} from '../services/listing.service';


@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css'],
  animations: [
    trigger('carouselImageState', [
      state('inactive', style({
        opacity: 0
      })),
      state('active',   style({
        opacity: 1
      })),
      transition('inactive => active', animate('500ms ease-in')),
      transition('active => inactive', animate('500ms ease-out'))
    ])
  ]

})
export class CarouselComponent implements OnInit {

  standardRotationIntervalSeconds = 10;
  longRotationIntervalSeconds = 20;
  latestContribution: Contribution = null;
  selectedContribution: Contribution = null;
  contributions: Contribution[];
  timeoutPointer = null;
  imageActive = 'active';
  viewMode = 'standard';

  constructor(private listingService: ListingService) {
    this.viewMode = this.listingService.options.viewMode;
  }

  ngOnInit() {
    this.listingService.contributions.subscribe(
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
    clearTimeout(this.timeoutPointer);
    this.imageActive = 'inactive';
    setTimeout(() => {
      if (this.contributions.length > 0) {

        // A new contribution is shown for a longer time
        if (this.latestContribution === null || this.latestContribution._id !== this.contributions[0]._id) {
          this.latestContribution = this.contributions[0];
          this.selectedContribution = this.latestContribution;
          this.timeoutPointer = setTimeout(() => this.rotateCarousel(), this.longRotationIntervalSeconds * 1000);

          // Otherwise show a random contribution for a standard length of time
        } else {
          this.selectedContribution = this.contributions[Math.floor(Math.random() * this.contributions.length)];
          this.timeoutPointer = setTimeout(() => this.rotateCarousel(), this.standardRotationIntervalSeconds * 1000);
        }
      } else {
        this.timeoutPointer = setTimeout(() => this.rotateCarousel(), this.longRotationIntervalSeconds * 1000);
      }
      this.imageActive = 'active';
    }, 1000);
  }

}
