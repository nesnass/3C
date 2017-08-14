import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/catch'; import 'rxjs/add/operator/map'; import 'rxjs/add/operator/filter';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Chip, Contribution, Grouping, GroupingResponse, Options} from '../models';
import {ListingBackendService} from './listingBackend.service';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class ListingService {

  private serverRefreshIntervalSeconds = 10;

  private _contributions: BehaviorSubject<Contribution[]> = <BehaviorSubject<Contribution[]>>new BehaviorSubject([]);
  private _groupings: BehaviorSubject<Grouping[]> = <BehaviorSubject<Grouping[]>>new BehaviorSubject([]);
  private _chips: Chip[];
  private _selectedGrouping: Grouping;
  private requestContributionsInterval;
  private errorMessage: any;
  private _options: Options;

  private _votingContribution1: Contribution;
  private _votingContribution2: Contribution;


  constructor(private listingBackendService: ListingBackendService) {
    this.options = {
        viewMode: 'standard'
    };
    this._selectedGrouping = null;
    this.requestContributionsInterval = null;
    this._votingContribution1 = null;
    this._votingContribution2 = null;
    this.retrieveChips();
    this.refreshGroupings();
  }

  get siteUrl() {
    return this.listingBackendService.appUrl;
  }

  get chips() {
    return this._chips;
  }

  get contributions(): Observable<Contribution[]> {
    return this.filterContributionsByGrouping().asObservable();
  }

  get contributionsAsValue(): Contribution[] {
    return this.filterContributionsByGrouping().getValue();
  }

  setRandomVotingContributions() {
    const c = this.filterContributionsByGrouping().getValue();
    if (c.length > 0) {
      this._votingContribution1 = c[Math.floor(Math.random()) * c.length];
      while (this._votingContribution2 === null || this._votingContribution2._id === this._votingContribution1._id) {
        this._votingContribution2 = c[Math.floor(Math.random() * c.length)];
      }
    }
  }

  get votingContribution1(): Contribution {
    return this._votingContribution1;
  }
  get votingContribution2(): Contribution {
    return this._votingContribution2;
  }

  filterContributionsByGrouping(): BehaviorSubject<Contribution[]> {
    if (this._selectedGrouping === null || this._selectedGrouping.contributionMode === 'All') {
      // Return all Contributions
      return this._contributions;
    } else if (this._selectedGrouping.contributionMode === 'Chips') {
      // Use Chips to determine which images are shown - match Grouping chips to Contribution chips
      return <BehaviorSubject<Contribution[]>>this._contributions.map((contributions) => {
        return contributions.filter((c) => {
          return c.chips.some((chip) => {
            return this._selectedGrouping.chips.indexOf(chip) > -1;
          });
        });
      });
    } else if (this._selectedGrouping.contributionMode === 'Feed') {
      // Show images that were taken from a Feed
      return <BehaviorSubject<Contribution[]>>this._contributions.map((contributions) => {
        return contributions.filter((c) => {
          return c.origin === 'facebook-feed';
        });
      });
    }
  }

  get groupings() {
    return this._groupings.asObservable();
  }

  get groupingsReverseSortedByCreationDate() {
    return this._groupings.asObservable().map((data) => {
      data.sort((a, b) => {
        if (typeof a.created === 'string' || typeof b.created === 'string' ) {
          return;
        }
        return a.created.getTime() < b.created.getTime() ? -1 : 1;
      });
      return data;
    });
  }

  get groupingsAsValue() {
    return this._groupings.getValue();
  }

  set grouping(grouping: Grouping) {
    this._selectedGrouping = grouping;
    this.refreshContributions();
  }

  get grouping(): Grouping {
    return this._selectedGrouping;
  }

  addGrouping(newGrouping: Grouping): Observable<GroupingResponse> {
    const obs = this.listingBackendService.createGrouping(newGrouping);
    obs.subscribe(
      res => {
        const newGroupingList: Grouping[] = this._groupings.getValue();
        newGroupingList.push(new Grouping(res.data));                // Response Grouping will contain _id created at server
        this._groupings.next(newGroupingList);
      });

    return obs;
  }

  updateGrouping(grouping: Grouping): void {
    this.listingBackendService.updateGrouping(grouping).subscribe();
  }

  updateContribution(contribution: Contribution): void {
    this.listingBackendService.updateContribution(contribution).subscribe();
  }

  deleteGrouping(grouping: Grouping): Observable<Grouping> {
    const obs = this.listingBackendService.deleteGrouping(grouping);
    obs.subscribe(
      () => {
        const newGroupingList: Grouping[] = this._groupings.getValue();
        newGroupingList.splice(newGroupingList.indexOf(grouping), 1);
        this._groupings.next(newGroupingList);
      });

    return obs;
  }

  get options(): Options {
    return this._options;
  }

  set options(options: Options) {
    this._options = options;
  }

  // Public member functions to interface to data

  /**
   * Begin regular polls to the server lookin for new contributions
   */
  startServerPolling() {
    this.requestContributionsInterval = setInterval(() => {
      this.refreshContributions();
    }, this.serverRefreshIntervalSeconds * 1000);
  }

  /**
   * Retrieve 'chips' from the server
   */
  retrieveChips() {
    this.listingBackendService.getChips().subscribe(
      res => {
        this._chips = res.data;
      }
    );
  }

  /**
   * Check for new contributions
   */
  refreshContributions() {
    this.listingBackendService.getAllContributions().subscribe(
      res => {
        const newContributions = (<Object[]>res.data).map((contribution: any) => new Contribution(contribution, this._selectedGrouping));

        // Are there new contributions available? If so, update the collection
        const oldContributions = this._contributions.getValue();
        if (newContributions.length > 0
          && ((oldContributions.length > 0 && oldContributions[0]._id !== newContributions[0]._id)
            || (oldContributions.length === 0) )) {
          this._contributions.next(newContributions);
        }
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log('An error occurred:', err.error.message);
        } else {
          console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
          this.errorMessage = <any>err;
        }
      }
    );
  }

  /**
   * Check for new groupings
   */
  refreshGroupings() {
    this.listingBackendService.getAllGroupings().subscribe(
      res => {
        const newGroupings = (<Object[]>res.data).map((grouping: any) => new Grouping(grouping));
        this._groupings.next(newGroupings);
      },
      (err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          console.log('An error occurred:', err.error.message);
        } else {
          console.log(`Backend returned code ${err.status}, body was: ${err.error}`);
          this.errorMessage = <any>err;
        }
      }
    );
  }

  getTwoVotingContributions() {

  }


}
