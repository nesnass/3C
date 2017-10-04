import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ListingService} from '../services/listing.service';
import {Contribution, InputData} from '../models';
import 'rxjs/add/operator/take';

@Component({
  selector: 'app-voting-view',
  templateUrl: './voting-view.component.html',
  styleUrls: ['./voting-view.component.css'],
})
export class VotingViewComponent implements OnInit {
  showVoting = false;
  showResults = false;
  contributionVisibleState = 'invisible';
  position: string;

  contribution1: Contribution;
  contribution2: Contribution;

  inputData: InputData;

  constructor(private route: ActivatedRoute, private listingService: ListingService) {
    this.position = 'none';
    this.inputData = new InputData();
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
          this.listingService.contributions.take(2).subscribe(      // take(2) will get the first two values, then unsubscribe
            (contributions) => {
              if (contributions.length > 0) {
                this.showVoting = true;
                this.getTwoContributions();
              }
            }
          );
        }
      });
    }
  }

  getTwoContributions() {
    this.contributionVisibleState = 'invisible';
    setTimeout(() => {
      this.listingService.setRandomVotingContributions();
      this.contribution1 = this.listingService.votingContribution1;
      this.contribution2 = this.listingService.votingContribution2;
      this.contributionVisibleState = 'visible';
    }, 1000);
  }

  castVote(c1: boolean, c2: boolean) {
    this.listingService.castVote(c1, c2);
    this.getTwoContributions();
  }

  submitForm() {
    if (!(this.inputData.text === '')) {
      this.listingService.addOpinion(this.inputData, () => {
        // reset input field. TODO: reset whole page
        this.inputData = new InputData();
      });
    }
  }

}
