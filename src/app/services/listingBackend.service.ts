import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import { Response } from '@angular/http';
import 'rxjs/add/operator/catch'; import 'rxjs/add/operator/map'; import 'rxjs/add/operator/share';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ContributionsResponse, Grouping, GroupingsResponse} from '../models';
import {LocationStrategy} from '@angular/common';

@Injectable()
export class ListingBackendService {

  private http: HttpClient;
  private apiUrl = 'http://localhost:8000/';

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

  constructor(http: HttpClient, private locationStrategy: LocationStrategy)  {
    this.http = http;

    // Switch server address for local development..
    if ((<any>locationStrategy)._platformLocation.location.href.indexOf('localhost') > -1) {
      this.apiUrl = 'http://localhost:8000/';
    } else {
      this.apiUrl = '/';
    }
  }

  // Contributions

  getAllContributions() {
    return this.http.get<ContributionsResponse>(this.apiUrl + 'listings/contributions/data')
      // .map(res => <Contribution[]>res.data || [])
      .catch(ListingBackendService.handleError);
  }

  // Groupings

  getAllGroupings() {
    return this.http.get<GroupingsResponse>(this.apiUrl + 'listings/groupings')
      // .map(res => <Grouping[]>res.data || [])
      .catch(ListingBackendService.handleError);
  }

  updateGrouping(newGrouping: Grouping): Observable<Grouping> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json; charset=utf-8');

    return this.http.put(this.apiUrl + 'listings/groupings', JSON.stringify(newGrouping), {headers}).share();
  }

  createGrouping(newGrouping: Grouping): Observable<Grouping> {
    const headers = new HttpHeaders();
    headers.append('Content-Type', 'application/json; charset=utf-8');

    return this.http.post(this.apiUrl + 'listings/groupings', newGrouping, {headers});
  }

/*
  deleteGrouping(deletedGrouping: Grouping) {
    const params = new HttpParams();
    params.append('id', '' + deletedGrouping._id );

    return this.http.delete('', { params }).share();
  }
*/


}
