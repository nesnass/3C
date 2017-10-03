import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ListingService} from '../services/listing.service';
import {Contribution, InputData} from '../models';
import 'rxjs/add/operator/take';
import {NettskjemaService} from '../services/nettskjema.service';

@Component({
  selector: 'app-voting-view',
  templateUrl: './voting-view.component.html',
  styleUrls: ['./voting-view.component.css'],
  providers: [NettskjemaService]
})
export class VotingViewComponent implements OnInit {
  showVoting = false;
  showResults = false;
  contributionVisibleState = 'invisible';
  position: string;

  contribution1: Contribution;
  contribution2: Contribution;

  inputData: InputData;

  constructor(private route: ActivatedRoute, private listingService: ListingService, private nettskjemaService: NettskjemaService) {
    this.position = 'none';
    this.inputData = new InputData();
    this.route.params.subscribe( params => this.position = params.position );
    this.nettskjemaService.attemptToGetToken()
      .subscribe( res => {
          console.log('Got Nettskjema token: ' + res);
          this.nettskjemaService.setToken(res);
          this.submitForm();
        }
      );
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
    console.log('Inputdata: ' + this.inputData.text);
    console.log('bor: ' + this.inputData.living);

    if (!(this.inputData.text === '')) {
      this.nettskjemaService.postData(this.inputData, (data) => {
        console.log('Attempted Nettskjema submission: ' + data);
      });
    }
  }

}
