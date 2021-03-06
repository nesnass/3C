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
    ]),
    trigger('carouselCaptionState', [
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
  currentContributionIndex = 0;
  timeoutPointer = null;
  trimmedCaption = '';
  imageActive = 'active';
  captionActive = 'inactive';
  viewMode = 'standard';

  constructor(private listingService: ListingService) {
    this.viewMode = this.listingService.options.viewMode;
  }

  ngOnInit() {
    this.listingService.contributions.subscribe(
      contributions => {
        this.contributions = contributions;
        this.currentContributionIndex = 0;

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
    this.captionActive = 'inactive';
    setTimeout(() => {
      if (this.contributions.length > 0) {

        // A new contribution is shown for a longer time
        if (this.latestContribution === null || this.latestContribution._id !== this.contributions[0]._id) {
          this.latestContribution = this.contributions[0];
          this.selectedContribution = this.latestContribution;
          this.timeoutPointer = setTimeout(() => this.rotateCarousel(), this.longRotationIntervalSeconds * 1000);

          // Otherwise show a pseudo-random contribution for a standard length of time (don't show same image twice)
        } else if (this.listingService.grouping.serendipitousOptions.randomSelection) {
          let newContribution = null;
          while (newContribution === null || newContribution._id === this.selectedContribution._id) {
            newContribution = this.contributions[Math.floor(Math.random() * this.contributions.length)];
          }
          this.selectedContribution = newContribution;
          this.timeoutPointer = setTimeout(() => this.rotateCarousel(), this.standardRotationIntervalSeconds * 1000);

          // Otherwise choose the next in sorted order
        } else {
          this.currentContributionIndex = this.currentContributionIndex === this.contributions.length - 1 ?
            0 : this.currentContributionIndex + 1;
          this.selectedContribution = this.contributions[this.currentContributionIndex];
          this.timeoutPointer = setTimeout(() => this.rotateCarousel(), this.standardRotationIntervalSeconds * 1000);
        }
        this.listingService.serendipitousContribution = this.selectedContribution;
        this.trimmedCaption = this.selectedContribution.caption.length > 200 ? this.selectedContribution.caption.substr(0, 100) + '...'
          : this.selectedContribution.caption;
      } else {
        this.timeoutPointer = setTimeout(() => this.rotateCarousel(), this.longRotationIntervalSeconds * 1000);
      }
      this.imageActive = 'active';
      setTimeout(() => {
        this.captionActive = 'active';
      }, 1500);
    }, 1000);
  }

}
