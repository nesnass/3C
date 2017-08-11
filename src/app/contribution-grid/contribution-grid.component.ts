import { Component, OnInit } from '@angular/core';

// import the Freewall provider
import {Freewall} from '../freewallRef';
import {Contribution, displayModes, Grouping} from '../models';
import {Observable} from 'rxjs/Observable';
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
    this.wall.fitWidth();
    this.wall.reset({
      selector: '.brick',
      animate: true,
      cellW: 200,
      cellH: 'auto',
      onResize: () => {
        this.wall.fitWidth();
      }
    });

    this.contributions = this.listingService.contributionsAsValue;
    this.showGrid = true;
    this.wall.fitWidth();
    if (this.grouping.displayMode === 'Voting') {
      setTimeout(() => {        // Largest to smallest
        this.wall.sortBy((a, z) => {
          return parseInt(z['data-voting'], 10) - parseInt(a['data-voting'], 10);
        });
      }, 100);
    }
  }

  zoomContribution(contribution: Contribution) {
    if (this.zoomedContribution === null) {
      this.zoomedContribution = contribution;
    }
  }

}
