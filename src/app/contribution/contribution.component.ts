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
    ]),
    trigger('voteSelected', [
      state('small', style({
        fontSize: '1.5em'
      })),
      state('large',   style({
        fontSize: '2.5em'
      })),
      transition('small => large', animate('500ms ease-in')),
      transition('large => small', animate('500ms ease-out'))
    ])
  ]
})
export class ContributionComponent implements OnInit {
  private trimmedCaption = '';
  private _contribution: Contribution;
  private customStyle;

  @Input() contributionVisibleState: string;
  @Input() voteSelectedState: string;
  @Input() grouping: Grouping;

  @Input() set contribution(theContribution: Contribution) {
    if (typeof theContribution !== 'undefined') {
      this._contribution = theContribution;
      if (typeof this._contribution !== 'undefined' && typeof this.grouping !== 'undefined') {
        this.setupContribution();
      }
      this.contributionChange.emit(theContribution);
    }
  }
  @Output() contributionChange: EventEmitter<Contribution> = new EventEmitter<Contribution>();

  constructor() {
    this._contribution = null;
  }

  get contribution() {
    return this._contribution;
  }

  ngOnInit() {
    this.voteSelectedState = 'small';
    // console.log('object evt: %O', this.grouping);
  }

  votedNeither() {
    return this._contribution.votedNeither;
  }

  setupContribution() {
    const maxChars = ((this.grouping.displayMode === 'Voting' && this.grouping.votingOptions.displayMode === 'Caption As Image')
    || (this.grouping.displayMode === 'Voting Results' && this.grouping.votingOptions.displayMode === 'Image'))
      ? 400 : 100;
    this.trimmedCaption = this._contribution.caption.length > maxChars ? this._contribution.caption.substr(0, maxChars) + '...'
      : this._contribution.caption;
    const fontSize = this._contribution.caption.length > maxChars ? '0.3em' : '0.5em';
    const imageUrl = this._contribution.image.url;
    const backgroundSize = this.grouping.displayMode === 'Voting' ? 'contain' : 'cover';
    this.customStyle = { 'background-image': 'url(\'' + imageUrl + '\')', 'background-size': backgroundSize };
  }

}
