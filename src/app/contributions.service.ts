import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable'; import 'rxjs/add/operator/catch'; import 'rxjs/add/operator/map';

import {ContributionComponent} from "./contribution/contribution.component";
import {Contribution} from "./models";

@Injectable()
export class ContributionsService {

  apiUrl = "/";

  constructor(private http: Http) { }

  getContributions(): Promise<ContributionComponent[]> {

    let newContributions = [];

    /* Mock data for initial testing */
    let cData = {
      origin: "instagram",
      created: Date.now(),
      image: {
        originalWidth: 100,
        originalHeight: 200,
        url: ""
      },
      user : {
        profile_picture: "",
        username: ""
      }
    };

    for(let i=0; i < 11; i++) {
      let c = new Contribution(cData);
      cData.user.username = i.toString();
      newContributions.push(c);
    }

    return Promise.resolve(newContributions);
  };

  getContributionsFromServer(): Observable<Contribution[]> {
    return this.http.get(this.apiUrl + 'testlist').map(this.extractData).catch(this.handleError);
  }

  private extractData(res: Response) {
    let body = res.json();
    let newContributions = [];
    if (body.hasOwnProperty("data")) {
      body.data.forEach((item) => {
        let c = new Contribution(item);
        newContributions.push(c);
      })
    }
    return newContributions || {};
  }

  private handleError (error: Response | any) { // In a real world app, you might use a remote logging infrastructure
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

}
