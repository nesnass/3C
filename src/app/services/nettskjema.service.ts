import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {InputData} from '../models';
import {Response , Headers} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class NettskjemaService {

  // private url: 'http://nettskjema.uio.no/ping.html';
  private nettskjemaToken: string;
  private http: HttpClient;

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

  constructor(http: HttpClient) {
    this.http = http;
  }

  setToken(token: string) {
    this.nettskjemaToken = token;
  }

  attemptToGetToken() {
    return this.http.get('https://nettskjema.uio.no/ping.html', {'responseType': 'text'})
      .catch(NettskjemaService.handleError);
  }

  postData(input: InputData, func) {
    const form_data = input.asFormData();

    const headers: Headers = new Headers();
    headers.append('Content-Type', 'undefined');
    headers.append('NETTSKJEMA_CSRF_PREVENTION', this.nettskjemaToken);

    console.log(form_data);

    this.http.post('https://nettskjema.uio.no/answer/deliver.json?formId=87894', form_data, headers
    ).subscribe((response) => {
      func(JSON.stringify(response), input);
    }, () => {
      func('Error sending usage data to server - no status response', input);
    });
  }
}
