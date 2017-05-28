import {Component, Input, OnInit} from '@angular/core';
import {Contribution} from "../models";



@Component({
  selector: 'app-contribution',
  templateUrl: './contribution.component.html',
  styleUrls: ['./contribution.component.css']
})
export class ContributionComponent implements OnInit {

  @Input() contribution: Contribution;

  constructor() {
  }

  ngOnInit() {
  }

}
