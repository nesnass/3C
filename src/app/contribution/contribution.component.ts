import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {Contribution, Grouping} from '../models';

import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-contribution',
  templateUrl: './contribution.component.html',
  styleUrls: ['./contribution.component.css'],
  animations: [
    trigger('contributionVisibleState', [
      state('invisible', style({
        opacity: 0
      })),
      state('visible',   style({
        opacity: 1
      })),
      transition('invisible => visible', animate('500ms ease-in')),
      transition('visible => invisible', animate('500ms ease-out'))
    ])
  ]
})
export class ContributionComponent implements OnInit {
  private trimmedCaption = '';
  private _contribution: Contribution;
  private backgroundStyle;

  @Input() contributionVisibleState: string;
  @Input() grouping: Grouping;

  @Input() set contribution(theContribution: Contribution) {
    this._contribution = theContribution;
    if (typeof this._contribution !== 'undefined' && typeof this.grouping !== 'undefined') {
      this.setupContribution();
    }
    this.contributionChange.emit(theContribution);
  }
  @Output() contributionChange: EventEmitter<Contribution> = new EventEmitter<Contribution>();


  constructor() {}

  ngOnInit() {
    // console.log('object evt: %O', this.grouping);
  }

  setupContribution() {
    const maxChars = (this.grouping.displayMode === 'Voting' && this.grouping.votingOptions.displayMode === 'Caption As Image')
      ? 150 : 100;
    this.backgroundStyle = { 'background-image': 'url(\'' + this._contribution.image.url + '\')'};
    this.trimmedCaption = this._contribution.caption.length > maxChars ? this._contribution.caption.substr(0, maxChars) + '...'
      : this._contribution.caption;
  }

}
