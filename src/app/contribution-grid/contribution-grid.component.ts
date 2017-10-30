import { Component, OnInit } from '@angular/core';

// import the Freewall provider
import {Freewall} from '../freewallRef';
import {Contribution, Grouping, Voting} from '../models';
import {ListingService} from '../services/listing.service';

declare const jQuery: any;

@Component({
  selector: 'app-contribution-grid',
  templateUrl: './contribution-grid.component.html',
  styleUrls: ['./contribution-grid.component.css']
})
export class ContributionGridComponent implements OnInit {

  _contributions: Contribution[];
  zoomedContribution: Contribution = null;
  grouping: Grouping;
  showGrid: Boolean = false;
  trimmedCaption = '';
  wall: any;

  constructor(private listingService: ListingService,
              private freewall: Freewall) { }

  ngOnInit() {
    this.grouping = this.listingService.grouping;
    this.wall = this.freewall.freewall;
    this.listingService.contributions.subscribe((contributions) => {
      this._contributions = contributions;
      this.createAggregatedVoteCount();
    });
    this.showGrid = true;
    this.wall.reset({
      selector: '.contribution',
      animate: true,
      cellW: 300,
      cellH: 300,
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
      this.trimmedCaption = this.zoomedContribution.caption.length > 200 ? this.zoomedContribution.caption.substr(0, 100) + '...'
        : this.zoomedContribution.caption;
    }
  }

  get contributions(): Contribution[] {
    if (this.grouping.displayMode === 'Voting Results') {
      return this.contributionsFilteredByActiveGroupings;
    } else {
      return this._contributions;
    }
  }




  // -----------------   Votes Display ----------------------

  get contributionsFilteredByActiveGroupings(): Contribution[] {
    return this._contributions.filter((c) => {
      return c.groupingVoting.grouping_id === 'active';
    });
  }

  // In this case the Voting class is used to accumulate voting results ACROSS grouping IDs.
  // Therefore the Contribution.groupingVoting.grouping_id will == '';
  createAggregatedVoteCount() {
    const selectedGroupingIds = this.grouping.votingResultsOptions.groupings;

    this._contributions.map((c) => {
      c.groupingVoting = new Voting({votes: 0, exposures: 0, grouping_id: 'inactive'});
      c.voting.forEach((v) => {
        if (selectedGroupingIds.indexOf(v.grouping_id) > -1) {
          c.groupingVoting.votes += v.votes;
          c.groupingVoting.exposures += v.exposures;
          c.groupingVoting.grouping_id = 'active';
        }
      });
    });
  }

}
