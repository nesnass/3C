import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ListingService} from '../services/listing.service';
import {Contribution} from '../models';


@Component({
  selector: 'app-voting-view',
  templateUrl: './voting-view.component.html',
  styleUrls: ['./voting-view.component.css']
})
export class VotingViewComponent implements OnInit {
  showVoting = false;
  showResults = false;
  position: string;

  contribution1: Contribution;
  contribution2: Contribution;

  constructor(private route: ActivatedRoute, private listingService: ListingService) {
    this.position = 'none';
    this.route.params.subscribe( params => this.position = params.position );
  }

  ngOnInit() {
    if (this.position !== 'none') {
      let selectedGrouping = null;
      this.listingService.groupings.subscribe( (groupings) => {
        groupings.forEach((grouping) => {
          if (grouping.urlSlug === this.position) {
            selectedGrouping = grouping;
          }
        });
        if (selectedGrouping !== null) {
          this.listingService.grouping = selectedGrouping;
          this.listingService.contributions.subscribe(
            (contributions) => {
              if (contributions.length > 0) {
                this.listingService.setRandomVotingContributions();
                this.contribution1 = this.listingService.votingContribution1;
                this.contribution2 = this.listingService.votingContribution2;
                this.showVoting = true;
              }
            }
          );
        }
      });
    }
  }

  castVote(c1: boolean, c2: boolean) {
    this.listingService.castVote(c1, c2);
    this.listingService.setRandomVotingContributions();
    this.contribution1 = this.listingService.votingContribution1;
    this.contribution2 = this.listingService.votingContribution2;
  }


}
