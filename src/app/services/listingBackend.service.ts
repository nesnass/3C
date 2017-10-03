import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Headers, RequestOptions, Response} from '@angular/http';
import 'rxjs/add/operator/catch'; import 'rxjs/add/operator/map'; import 'rxjs/add/operator/share';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Contribution, ContributionsResponse, Grouping, GroupingResponse, GroupingsResponse} from '../models';
import {LocationStrategy} from '@angular/common';

@Injectable()
export class ListingBackendService {

  private http: HttpClient;
  private _apiUrl = 'http://localhost:8000/';
  private _appUrl = 'http://localhost:4200/';

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
      errMsg = `${error.status} - ${error.statusText || 'AAAAAAAAAAAAA'} ${err}`;
    } else {
      errMsg = error.message ? error.message : error.toString();
    }
    console.error(errMsg);
    return Observable.throw(errMsg);
  }

  constructor(http: HttpClient, private locationStrategy: LocationStrategy)  {
    this.http = http;
    // this._apiUrl = (<any>locationStrategy)._platformLocation.location.origin + '/';

    // Switch server address for local development..
    if ((<any>locationStrategy)._platformLocation.location.href.indexOf('localhost') > -1) {
      this._apiUrl = 'http://localhost:8000/';
      this._appUrl = 'http://localhost:4200/#/';
    } else {
      this._apiUrl = '/';
      this._appUrl = 'http://' + (<any>locationStrategy)._platformLocation.location.hostname + '/#/';
    }
  }

  // Contributions

  getAllContributions() {
    return this.http.get<ContributionsResponse>(this._apiUrl + 'listings/contributions/data')
      // .map(res => <Contribution[]>res.data || [])
      .catch(ListingBackendService.handleError);
  }

  updateContribution(contribution: Contribution): Observable<Grouping> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json; charset=utf-8');

    return this.http.put(this._apiUrl + 'listings/contributions', contribution, {headers}).share();
  }

  // Groupings

  getAllGroupings() {
    return this.http.get<GroupingsResponse>(this._apiUrl + 'listings/groupings')
      // .map(res => <Grouping[]>res.data || [])
      .catch(ListingBackendService.handleError);
  }

  updateGrouping(newGrouping: Grouping): Observable<Grouping> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json; charset=utf-8');

    return this.http.put(this._apiUrl + 'listings/groupings', newGrouping, {headers}).share();
  }

  createGrouping(newGrouping: Grouping): Observable<GroupingResponse> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json; charset=utf-8');

    return this.http.post(this._apiUrl + 'listings/groupings', newGrouping, {headers});
  }

  deleteGrouping(deletedGrouping: Grouping) {
    const reqOpts = {
      params: new HttpParams().set('id', deletedGrouping._id)
    };
    return this.http.delete(this._apiUrl + 'listings/groupings', reqOpts).share();
  }

  // Chips

  getChips() {
    return this.http.get(this._apiUrl + 'listings/chips').catch(ListingBackendService.handleError);
  }

  get appUrl() {
    return this._appUrl;
  }

  // Voting

  castVote(grouping_id: string, c1_id: string, c1_choice: boolean, c2_id: string, c2_choice: boolean) {
    // voting/vote/:grouping_id/:c1_id/:c1_chosen/:c2_id/:c2_chosen
    const getString = this._apiUrl + 'voting/vote/' + grouping_id + '/' + c1_id + '/' +
      (c1_choice ? 'true' : 'false') + '/' + c2_id + '/' + (c2_choice ? 'true' : 'false');
    this.http.get(getString).catch(ListingBackendService.handleError).subscribe();
  }

}
