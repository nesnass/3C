import { Component, OnInit } from '@angular/core';

// import the Freewall provider
import {Freewall} from '../freewallRef';
import {Contribution} from '../models';
import {Observable} from 'rxjs/Observable';
import {ListingService} from '../services/listing.service';

declare const jQuery: any;

@Component({
  selector: 'app-contribution-grid',
  templateUrl: './contribution-grid.component.html',
  styleUrls: ['./contribution-grid.component.css']
})
export class ContributionGridComponent implements OnInit {

  contributions: Contribution[];
  wall: any;

  constructor(private listingService: ListingService,
              private freewall: Freewall) { }

  ngOnInit() {
    this.wall = this.freewall.freewall;
    this.wall.fitWidth();
    this.wall.reset({
      selector: '.brick',
      animate: true,
      cellW: 200,
      cellH: 'auto',
      onResize: () => {
        this.wall.fitWidth();
      }
    });

    this.contributions = this.listingService.contributionsAsValue;
    setTimeout(() => {
      this.wall.fitWidth();
    }, 100);
  }


}
