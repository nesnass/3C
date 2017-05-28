import { Component, OnInit } from '@angular/core';
import { ContributionsService } from '../contributions.service';

// import the Freewall provider
import {Freewall} from '../freewallRef';
import {Contribution} from "../models";

declare let jQuery:any;

@Component({
  selector: 'app-contribution-grid',
  templateUrl: './contribution-grid.component.html',
  styleUrls: ['./contribution-grid.component.css'],
  providers: [
    ContributionsService
  ]
})
export class ContributionGridComponent implements OnInit {

  contributions: Contribution[] = [];
  errorMessage: any;
  wall: any;

  constructor(private contributionService: ContributionsService,
              private freewall: Freewall) { }

  ngOnInit() {
    this.contributionService.getContributionsFromServer().subscribe(
      contributions => {
        this.contributions = contributions;
        setTimeout(() => {
          this.wall.fitWidth();
        }, 1000);
      },
      error => {
        this.errorMessage = <any>error
      }
    );

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
  }


}
