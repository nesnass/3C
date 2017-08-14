import {Component, Input, OnInit} from '@angular/core';
import {Contribution, Grouping} from '../models';

@Component({
  selector: 'app-contribution',
  templateUrl: './contribution.component.html',
  styleUrls: ['./contribution.component.css']
})
export class ContributionComponent implements OnInit {
  @Input() contribution: Contribution;
  @Input() grouping: Grouping;

  constructor() {}

  ngOnInit() {
    // this.backgroundImage = this.contribution !== '' ? 'url(\'' + this.contribution.image.url + '\')' : '';
  }

}
