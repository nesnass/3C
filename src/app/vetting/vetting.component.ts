import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ListingService} from '../services/listing.service';
import {Contribution, Grouping} from '../models';

@Component({
  selector: 'app-vetting',
  templateUrl: './vetting.component.html',
  styleUrls: ['./vetting.component.css']
})
export class VettingComponent implements OnInit {

  groupings: Grouping[];
  selectedGrouping: Grouping = null;
  contributions: Contribution[];
  includeApprovedItems: boolean;

  constructor(private route: ActivatedRoute, public listingService: ListingService) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe(
      paramsMap => {
        if (paramsMap.has('pw')) {
          this.listingService.routePassword = paramsMap.get('pw');
          this.listingService.auth().subscribe((response) => {
            console.log(response['data']);
            if (response['data'] !== 'ok') {
              this.listingService.navigateToView('');
            }
          }, () => {
            this.listingService.navigateToView('');
          });
        } else {
          this.listingService.navigateToView('');
        }
      }
    );

    this.listingService.showUnvettedContributions = true;
    this.groupings = this.listingService.groupingsAsValue;
    this.listingService.contributions.subscribe(
      contributions => {
        this.contributions = contributions;
      }
    );

  }

  get contributionsFilteredByApproval() {
    return this.contributions.filter((c) => {
      return this.includeApprovedItems ? true : !c.vetted;
    });
  }

  refresh() {
    this.groupings = this.listingService.groupingsAsValue;
  }

  showContributionsFor(group: Grouping) {
    this.selectedGrouping = group;
    this.listingService.grouping = group;
  }

  deleteContribution(c: Contribution) {
    this.listingService.deleteContribution(c);
  }

  approveContribution(c: Contribution) {
    c.vetted = true;
    this.listingService.updateContribution(c);
  }

}
