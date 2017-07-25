import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable'; import 'rxjs/add/operator/catch'; import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import {Contribution, Options} from './models';
import { LocationStrategy } from '@angular/common';

@Injectable()
export class ContributionsService {

  private apiUrl = 'http://localhost:8000/';
  private serverRefreshIntervalSeconds = 10;

  private _contributions: BehaviorSubject<Contribution[]>;
  private requestContributionsInterval = null;
  private errorMessage: any;

  private dataStore: {
      contributions: Contribution[];
      options: Options
  };

  /**
   * General handler for server call errors
   * @param error
   * @returns {any}
   */
  static handleError (error: Response | any) { // In a real world app, you might use a remote logging infrastructure
    let errMsg: string;
    if (error instanceof Response) {
      const body = error.json() || '';
      const err = body.error || JSON.stringify(body);
      errMsg = `${error.status} - ${error.statusText || ''} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  constructor(private http: Http, private locationStrategy: LocationStrategy) {
    this.dataStore = {
      contributions: [],
      options: {
        viewMode: 'standard'
      }
    };
    this._contributions = <BehaviorSubject<Contribution[]>>new BehaviorSubject([]);

    // Switch server address for local development..
    if ((<any>locationStrategy)._platformLocation.location.href === 'http://localhost:4200/') {
      this.apiUrl = 'http://localhost:8000/';
    } else {
      this.apiUrl = '/';
    }
  }

  get contributions() {
    return this._contributions.asObservable();
  }

  get options(): Options {
    return this.dataStore.options;
  }

  set options(options: Options) {
    this.dataStore.options = options;
  }

  startServerPolling() {
    this.requestContributionsInterval = setInterval(() => {
      this.refreshContributions();
    }, this.serverRefreshIntervalSeconds * 1000);
    this.refreshContributions();
  }

  private requestContributionsFromServer(): Observable<Contribution[]> {
    return this.http.get(this.apiUrl + 'contributions').map(this.extractData).catch(ContributionsService.handleError);
  }

  /**
   * Extract Contribution data from the server result
   * @param res
   * @returns {Array|{}}
   */
  private extractData(res: Response) {
    const body = res.json();
    const newContributions = [];
    if (body.hasOwnProperty('data')) {
      body.data.forEach((item) => {
        newContributions.push(new Contribution(item));
      });
    }
    return newContributions || {};
  }

  /**
   * Called after timeout to check for new contributions
   */
  refreshContributions() {
    this.requestContributionsFromServer().subscribe(
      contributions => {
        // Are there new contributions available? If so, update the collection
        if (contributions.length > 0
          && ((this.dataStore.contributions.length > 0 && this.dataStore.contributions[0]._id !== contributions[0]._id)
            || (this.dataStore.contributions.length === 0) )) {
          this.dataStore.contributions = contributions;
          this._contributions.next(Object.assign({}, this.dataStore).contributions);
        }
      },
      error => {
        this.errorMessage = <any>error;
      }
    );
  }


}
