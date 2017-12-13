import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/catch'; import 'rxjs/add/operator/map'; import 'rxjs/add/operator/share';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {
  ChipResponse,
  Contribution, ContributionsResponse, Grouping, GroupingResponse, GroupingsResponse, InputData, SettingResponse,
  Settings, VoteResponse
} from '../models';
import {LocationStrategy} from '@angular/common';

@Injectable()
export class ListingBackendService {

  private http: HttpClient;
  private _apiUrl = 'http://localhost:8000/';
  private _appUrl = 'http://localhost:4200/';
  private _routeToken = '';


  constructor(http: HttpClient, private locationStrategy: LocationStrategy)  {
    this.http = http;
    // this._apiUrl = (<any>locationStrategy)._platformLocation.location.origin + '/';

    // Switch server address for local development..
    if ((<any>locationStrategy)._platformLocation.location.href.indexOf('localhost') > -1) {
      this._apiUrl = 'http://localhost:8000/';
      this._appUrl = 'http://localhost:4200/#/';
    } else if ((<any>locationStrategy)._platformLocation.location.href.indexOf('192.168.1.') > -1) {
      this._apiUrl = 'http://192.168.1.102:8000/';
      this._appUrl = 'http://192.168.1.102:4200/#/';
    } else {
      this._apiUrl = '/';
      this._appUrl = 'http://' + (<any>locationStrategy)._platformLocation.location.hostname + '/#/';
    }
  }

  set routePassword(pw: string) {
    this._routeToken = pw;
  }

  private get authorisedRequestOptions() {
    const reqOpts = {
      headers: new HttpHeaders(),
      params: new HttpParams()
    };
    reqOpts.params = reqOpts.params.set('pw', this._routeToken);
    reqOpts.headers.append('Content-Type', 'application/json; charset=utf-8');
    return reqOpts;
  }

  // Contributions

  getAllContributions(queryParams?: any) {
    const reqOpts = {
      params: new HttpParams()
    };
    for (const key in queryParams) {
      if (queryParams.hasOwnProperty(key)) {
        reqOpts.params = reqOpts.params.append(key, queryParams[key]);
      }
    }

    reqOpts.params = reqOpts.params.append('id', '');
    return this.http.get<ContributionsResponse>(this._apiUrl + 'listings/contributions/data', reqOpts);
  }

  updateContribution(contribution: Contribution): Observable<Grouping> {
    return this.http.put<Grouping>(this._apiUrl + 'listings/contributions', contribution, this.authorisedRequestOptions).share();
  }

  // Own opinion

  postOpinion(opinion: InputData) {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    return this.http.post(this._apiUrl + 'listings/contributions', opinion, {headers}).share();
  }

  deleteContribution(deletedContribution: Contribution) {
    const reqOpts = this.authorisedRequestOptions;
    reqOpts.params = reqOpts.params.set('id', deletedContribution._id);
    return this.http.delete(this._apiUrl + 'listings/contributions', reqOpts).share();
  }

  // Groupings

  getAllGroupings() {
    return this.http.get<GroupingsResponse>(this._apiUrl + 'listings/groupings');
  }

  updateGrouping(newGrouping: Grouping): Observable<Grouping> {
    return this.http.put<Grouping>(this._apiUrl + 'listings/groupings', newGrouping, this.authorisedRequestOptions).share();
  }

  createGrouping(newGrouping: Grouping): Observable<GroupingResponse> {
    return this.http.post<GroupingResponse>(this._apiUrl + 'listings/groupings', newGrouping, this.authorisedRequestOptions);
  }

  deleteGrouping(deletedGrouping: Grouping) {
    const reqOpts = this.authorisedRequestOptions;
    reqOpts.params = reqOpts.params.set('id', deletedGrouping._id);
    return this.http.delete(this._apiUrl + 'listings/groupings', reqOpts).share();
  }

  auth() {
    return this.http.get(this._apiUrl + 'auth', this.authorisedRequestOptions);
  }

  // Chips

  getChips() {
    return this.http.get<ChipResponse>(this._apiUrl + 'listings/chips');
  }

  get appUrl() {
    return this._appUrl;
  }

  // Voting

  castVote(grouping_id: string, c1_id: string, c1_choice: boolean, c2_id: string, c2_choice: boolean) {
    // voting/vote/:grouping_id/:c1_id/:c1_chosen/:c2_id/:c2_chosen
    const getString = this._apiUrl + 'voting/vote/' + grouping_id + '/' + c1_id + '/' +
      (c1_choice ? 'true' : 'false') + '/' + c2_id + '/' + (c2_choice ? 'true' : 'false');
    this.http.get(getString).subscribe();
  }

  getVotes() {
    return this.http.get<VoteResponse>(this._apiUrl + 'listings/votes');
  }

  // Settings

  getSettings() {
    return this.http.get<SettingResponse>(this._apiUrl + 'listings/settings');
  }

  setSettings(settings: Settings) {
    return this.http.put(this._apiUrl + 'listings/settings', settings, this.authorisedRequestOptions);
  }

}
