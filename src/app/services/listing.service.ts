import { Injectable, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/catch'; import 'rxjs/add/operator/map'; import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/first';  import 'rxjs/add/operator/last';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Chip, Contribution, Grouping, GroupingResponse, InputData, Options, Settings} from '../models';
import {Router} from '@angular/router';
import {ListingBackendService} from './listingBackend.service';
import {Observable} from 'rxjs/Observable';
import {isUndefined} from 'util';

@Injectable()
export class ListingService {

  private serverRefreshIntervalSeconds = 10;

  private _contributions: BehaviorSubject<Contribution[]> = <BehaviorSubject<Contribution[]>>new BehaviorSubject([]);
  private _allContributionsLength: number;
  private _groupings: BehaviorSubject<Grouping[]> = <BehaviorSubject<Grouping[]>>new BehaviorSubject([]);
  private _chips: Chip[];
  private _selectedGrouping: Grouping;
  private _defaultGrouping: Grouping;
  private requestContributionsInterval;
  private errorMessage: any;
  private _options: Options;
  private _settings: Settings;
  private _showUnvettedContributions: boolean;

  private _selectedSerendipitousContribution: Contribution;
  private _selectedSerendipitousChips: Chip[];    // Chips are not directly stores inside Contribution

  private _votingContribution1: Contribution;
  private _votingContribution2: Contribution;
  private _firstMatchingVotingChip: Chip;

  constructor(private listingBackendService: ListingBackendService,
              private ngZone: NgZone,
              private router: Router) {
    this.options = {
        viewMode: 'standard'
    };
    this.requestContributionsInterval = null;
    this._selectedGrouping = null;
    this._selectedSerendipitousContribution = null;
    this._votingContribution1 = null;
    this._votingContribution2 = null;
    this._selectedSerendipitousChips = [];
    this._firstMatchingVotingChip = null;
    this._allContributionsLength = 0;
    this._defaultGrouping = null;
    this._settings = new Settings();
    this._showUnvettedContributions = false;
    this.retrieveSettings();
  }

  set routePassword(pw: string) {
    this.listingBackendService.routePassword = pw;
  }

  get appUrl() {
    return this.listingBackendService.appUrl;
  }

  get chips() {
    return this._chips;
  }

  get contributions(): Observable<Contribution[]> {
    return this._contributions;
  }

  get contributionsAsValue(): Contribution[] {
    return this._contributions.getValue();
  }

  setRandomVotingContributions() {
    const v = this._contributions.getValue();
    let subV = [];
    if (v.length > 0) {

      // Select the first voting contribution
      this._votingContribution1 = v[Math.floor(Math.random() * v.length)];

      // Filter the collection based on the first selection's category
      subV = v.filter((c) => {
        return c.chips.some((cId) => {
          return this._votingContribution1.chips.indexOf(cId) > -1 && this._votingContribution1._id !== c._id;
        });
      });

      // Check for at least one more contribution available for this category
      if (subV.length === 0) {
        console.log('Not enough contributions to match with contribution id: ' + this._votingContribution1._id);
        this.setRandomVotingContributions();
      } else {

        // Select the second voting contribution based on the category of the first
        this._votingContribution2 = null;
        while (this._votingContribution2 === null || this._votingContribution2._id === this._votingContribution1._id) {
          this._votingContribution2 = subV[Math.floor(Math.random() * subV.length)];
        }

        // There is a case where still one of the contributions is null, in this case try again..
        if (this._votingContribution1 === null || this._votingContribution2 === null) {
          this.setRandomVotingContributions();
        }

        // Save the first Chip that matches both Contributions for use in the voting question
        const commonChipId = this._votingContribution1.chips.find((chipId) => {
          return this._votingContribution2.chips.indexOf(chipId) > -1;
        });
        this._firstMatchingVotingChip = null;
        this._firstMatchingVotingChip = this._chips.find((chip) => {
          return chip._id === commonChipId;
        });
      }

    }

  }

  set showUnvettedContributions(setting: boolean) {
    this._showUnvettedContributions = setting;
    this.refreshContributions(true);
  }

  get votingContribution1(): Contribution {
    return this._votingContribution1;
  }
  get votingContribution2(): Contribution {
    return this._votingContribution2;
  }
  get serendipitousContribution(): Contribution {
    return this._selectedSerendipitousContribution;
  }
  set serendipitousContribution(c: Contribution) {
    this._selectedSerendipitousContribution = c;
    this._selectedSerendipitousChips = this._chips.filter((chip) => {
      return c.chips.indexOf(chip._id) > -1;
    });
  }

  deleteContribution(contribution: Contribution): Observable<Contribution> {
    const obs = this.listingBackendService.deleteContribution(contribution);
    obs.subscribe(
      () => {
        const newContributionList: Contribution[] = this._contributions.getValue();
        newContributionList.splice(newContributionList.indexOf(contribution), 1);
        this._contributions.next(newContributionList);
      });

    return obs;
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
    this.refreshContributions(true);
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

  addOpinion(newOpinion: InputData, sFunc: any): string {
    newOpinion.setChip(this._firstMatchingVotingChip._id);
    this.listingBackendService.postOpinion(newOpinion)
      .subscribe(res => {
        if (!(isUndefined(sFunc))) {
          sFunc();
        }}, err => {
        return err;
      });
    return '';
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

  get serendipitousTitle(): string {
    return (this._selectedGrouping.titleDescriptionMode === 'Automatic' && this._selectedSerendipitousChips.length > 0) ?
      this._selectedSerendipitousChips[0].label : this._selectedGrouping.categoryTitle;
  }

  get serendipitousSubtitle(): string {
    return (this._selectedGrouping.titleDescriptionMode === 'Automatic' && this._selectedSerendipitousChips.length > 0) ?
      this._selectedSerendipitousChips[0].description : this._selectedGrouping.categorySubtitle;
  }

  // Using this method, the question asked will always be the first in the Chips array
  get votingQuestion(): string {
    return (this._selectedGrouping.titleDescriptionMode === 'Automatic' && this._firstMatchingVotingChip !== null) ?
      this._firstMatchingVotingChip.label : this._selectedGrouping.categoryTitle;
  }

  // Server stored settings

  get settings() {
    return this._settings;
  }

  set settings(settings: Settings) {
    this._settings = settings;
    this.updateSettings();
  }

  retrieveSettings(): void {
    this.listingBackendService.getSettings().subscribe(
      res => {
        this._settings = new Settings(res.data);
        this.retrieveChips();
        this.refreshGroupings();
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

  updateSettings(): void {
    this.listingBackendService.setSettings(this._settings).subscribe();
  }

  get defaultGrouping(): Grouping {
    return this._defaultGrouping;
  }

  set defaultGrouping(grouping: Grouping) {
    this._defaultGrouping = grouping;
    this._settings.defaultGroupingId = grouping._id;
    this._settings.defaultLoadPage = grouping.urlSlug;
    this.updateSettings();
  }

  // Public member functions to interface to data

  /**
   * Begin regular polls to the server lookin for new contributions
   */
  startServerPolling() {
    this.requestContributionsInterval = setInterval(() => {
      this.refreshContributions(false);
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

  filterContributionsByGrouping(contributionsIn: Contribution[]): Contribution[] {
    if (this._selectedGrouping === null || this._selectedGrouping.contributionMode === 'All') {
      // Return all Contributions
      return contributionsIn;
    } else if (this._selectedGrouping.contributionMode === 'Chips') {
      // Use Chips to determine which images are shown - match Grouping chips to Contribution chips
      return contributionsIn.filter((c) => c.chips.some((chip) => this._selectedGrouping.chips.indexOf(chip) > -1));
    } else if (this._selectedGrouping.contributionMode === 'Feed') {
      // Show images that were taken from a Feed
      return contributionsIn.filter((c) => {
        return c.origin === 'facebook-feed';
      });
    }
  }

  // Sorts against the FIRST chip id found
  sortContributionsByCategory(contributionsIn: Contribution[]) {
    const chipDictionary: { [id: string]: string } = {};
    this._chips.map((chip) => {
      chipDictionary[chip._id] = chip.label.toUpperCase();
    });
    contributionsIn.sort((a, b) => {
      if (a.chips.length > 0 && b.chips.length > 0) {
        if (chipDictionary[a.chips[0]] < chipDictionary[b.chips[0]]) {
          return -1;
        }
        if (chipDictionary[a.chips[0]] > chipDictionary[b.chips[0]]) {
          return 1;
        }
        return 0;
      }
    });
  }

  /**
   * Check for new contributions
   */
  refreshContributions(refreshAllRegardless: boolean) {
    const options = {
      iuv: this._showUnvettedContributions
    };
    this.listingBackendService.getAllContributions(options).subscribe(
      res => {
        const newContributions = (<Object[]>res.data)
          .map((contribution: any) => new Contribution(contribution, this._selectedGrouping));

        // Are there new contributions available? If so, update the collection
        if ((newContributions.length > 0 && this._allContributionsLength !== newContributions.length) || refreshAllRegardless) {
          this._allContributionsLength = newContributions.length;
          const filteredContributions = this.filterContributionsByGrouping(newContributions);
          if (this._selectedGrouping && !this._selectedGrouping.serendipitousOptions.randomSelection) {
            this.sortContributionsByCategory(filteredContributions);
          }
          this._contributions.next(filteredContributions);
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
        if (this._settings.defaultGroupingId !== '') {
          this._defaultGrouping = newGroupings.find( (g) => {
            return g._id === this._settings.defaultGroupingId;
          });
        } else {
          this._defaultGrouping = new Grouping();
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

  castVote(c1: boolean, c2: boolean) {
    return this.listingBackendService.castVote(this._selectedGrouping._id,
      this._votingContribution1._id, c1, this._votingContribution2._id, c2);
  }





  auth() {
    return this.listingBackendService.auth();
  }

  public navigateToView(viewPath) {
    this.ngZone.run(() => {
      this.router.navigate([viewPath]);
    });
  }


}
