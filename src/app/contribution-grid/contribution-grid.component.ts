import { Component, OnInit } from '@angular/core';
import { ContributionsService } from '../contributions.service';

// import the Freewall provider
import {Freewall} from '../freewallRef';
import {Contribution} from '../models';
import {Observable} from 'rxjs/Observable';

declare const jQuery: any;

@Component({
  selector: 'app-contribution-grid',
  templateUrl: './contribution-grid.component.html',
  styleUrls: ['./contribution-grid.component.css']
})
export class ContributionGridComponent implements OnInit {

  contributions: Observable<Contribution[]>;
  wall: any;

  constructor(private contributionService: ContributionsService,
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

    this.contributions = this.contributionService.contributionsAsObservable;
    this.contributionService.contributionsAsObservable.subscribe(
      () => {
        setTimeout(() => {
          this.wall.fitWidth();
        }, 100);
      }
    );

  }


}
