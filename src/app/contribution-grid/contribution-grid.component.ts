import { Component, OnInit } from '@angular/core';

// import the Freewall provider
import {Freewall} from '../freewallRef';
import {Contribution, Grouping} from '../models';
import {ListingService} from '../services/listing.service';

declare const jQuery: any;

@Component({
  selector: 'app-contribution-grid',
  templateUrl: './contribution-grid.component.html',
  styleUrls: ['./contribution-grid.component.css']
})
export class ContributionGridComponent implements OnInit {

  contributions: Contribution[];
  zoomedContribution: Contribution = null;
  grouping: Grouping;
  showGrid: Boolean = false;
  wall: any;

  constructor(private listingService: ListingService,
              private freewall: Freewall) { }

  ngOnInit() {
    this.grouping = this.listingService.grouping;
    this.wall = this.freewall.freewall;
    this.contributions = this.listingService.contributionsAsValue;
    this.showGrid = true;
    this.wall.reset({
      selector: '.contribution',
      animate: true,
      cellW: 200,
      cellH: 'auto',
      onResize: () => {
        this.wall.fitWidth();
      }
    });
    this.wall.sortBy(function(a, z) {
      return parseInt(z.attributes['data-votes'].value, 10) - parseInt(a.attributes['data-votes'].value, 10);
    });
    setTimeout(() => {        // Largest to smallest
      this.wall.fitWidth();
    }, 1000);
  }

  zoomContribution(contribution: Contribution) {
    if (this.zoomedContribution === null) {
      this.zoomedContribution = contribution;
    }
  }

}
