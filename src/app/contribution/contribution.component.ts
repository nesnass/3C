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

  private trimmedCaption: string;

  constructor() {}

  ngOnInit() {
    // this.backgroundImage = this.contribution !== '' ? 'url(\'' + this.contribution.image.url + '\')' : '';
    this.trimmedCaption = this.contribution.caption.length > 100 ? this.contribution.caption.substr(0, 100) + '...'
    : this.contribution.caption;
  }

}
