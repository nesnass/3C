import {Injectable} from '@angular/core';

const FREEWALL_ID = "#freewall";

@Injectable()
export class Freewall {

  get freewall(): any {
    if(window.hasOwnProperty("Freewall")) {
      return new window['Freewall'](FREEWALL_ID);
    } else
      return null;
  }

}
