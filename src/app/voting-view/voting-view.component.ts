import { Component, OnInit, NgZone } from '@angular/core';
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
  showCustomVoting = false;
  showResults = false;
  showThankyou = false;
  contributionVisibleState = 'invisible';
  voteSelected = 'small';
  position: string;

  contribution1: Contribution;
  contribution2: Contribution;

  inputData: InputData;
  voteSelectedStateC1: string;
  voteSelectedStateC2: string;
  backTimer = null;

  constructor(private route: ActivatedRoute, public listingService: ListingService) {
    this.position = 'none';
    this.inputData = new InputData();
    this.route.params.subscribe( params => this.position = params.position );
  }

  ngOnInit() {
    this.voteSelectedStateC1 = 'small';
    this.voteSelectedStateC2 = 'small';
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
    this.voteSelectedStateC1 = c1 ? 'large' : 'small';
    this.voteSelectedStateC2 = c2 ? 'large' : 'small';
    this.checkNeither(c1, c2);
    setTimeout(() => {
      this.voteSelectedStateC1 = 'small';
      this.voteSelectedStateC2 = 'small';
      this.contribution1.votedNeither = false;
      this.contribution2.votedNeither = false;
      this.listingService.castVote(c1, c2);
      this.getTwoContributions();
    }, 1000);
  }

  submitForm() {
    if (!(this.inputData.text === '')) {
      this.listingService.addOpinion(this.inputData, () => {
        // reset input field. TODO: reset whole page
        clearTimeout(this.backTimer);
        this.inputData = new InputData();
        this.showThankyou = true;
        this.showCustomVoting = false;
        setTimeout(() => {
          this.showThankyou = false;
          this.showVoting = true;
        }, 10000);
      });
    }
  }

  resetTimeout() {
    clearTimeout(this.backTimer);
    this.backTimer = setTimeout(() => {
      this.showCustomVoting = false;
      this.showVoting = true;
    }, 20000);
  }

  toggleCustomVote() {
    if (!this.showCustomVoting) {
      this.showVoting = false;
      this.showCustomVoting = true;
      this.resetTimeout();
    } else {
      clearTimeout(this.backTimer);
      this.showCustomVoting = false;
      this.showVoting = true;
    }
  }

  checkNeither(c1: boolean, c2: boolean) {
    if (c1 === false && c2 === false) {
      this.contribution1.votedNeither = true;
      this.contribution2.votedNeither = true;
    }
  }

  showVotingResults() {
    this.listingService.redirectToVotingResultsView();
  }
}
