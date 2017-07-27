import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import 'rxjs/add/operator/catch'; import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Contribution, Grouping, Options} from '../models';
import { LocationStrategy } from '@angular/common';
import {ListingBackendService} from './listingBackend.service';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ListingService {
  private ngUnsubscribe: Subject<void> = new Subject<void>();

  private serverRefreshIntervalSeconds = 10;

  private _contributions: BehaviorSubject<Contribution[]> = <BehaviorSubject<Contribution[]>>new BehaviorSubject([]);
  private _groupings: BehaviorSubject<Grouping[]> = <BehaviorSubject<Grouping[]>>new BehaviorSubject([]);
  private requestContributionsInterval = null;
  private errorMessage: any;
  private _options: Options;


  constructor(private listingBackendService: ListingBackendService) {
    this.options = {
        viewMode: 'standard'
    };
    this.refreshContributions();
  }

  get contributions() {
    return this._contributions.asObservable();
  }

  get contributionsAsValue() {
    return this._contributions.getValue();
  }

  get groupings() {
    return this._groupings.asObservable();
  }

  get groupingsAsValue() {
    return this._groupings.getValue();
  }

  addGrouping(newGrouping: Grouping): Observable<Grouping> {
    const obs = this.listingBackendService.createGrouping(newGrouping);
    obs.subscribe(
      res => {
        const newGroupingList: Grouping[] = this._groupings.getValue();
        newGroupingList.push(res);                // Response Grouping will contain _id created at server
        this._groupings.next(newGroupingList);
      });

    return obs;
  }

  updateGrouping(grouping: Grouping): Observable<Grouping> {
    const obs = this.listingBackendService.updateGrouping(grouping);
    obs.subscribe(
      res => {
        const newGroupingList: Grouping[] = this._groupings.getValue();
        newGroupingList.push(res);                // Response Grouping will contain _id created at server
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
   * Check for new contributions
   */
  refreshContributions() {
    this.listingBackendService.getAllContributions().subscribe(
      res => {
        const newContributions = (<Object[]>res.data).map((contribution: any) => new Contribution(contribution));

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
        const newGroupings = (<Object[]>res.json()).map((grouping: any) => new Grouping(grouping));
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


}
