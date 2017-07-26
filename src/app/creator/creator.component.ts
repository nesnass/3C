import { Component, OnInit } from '@angular/core';
import { Grouping, Contribution } from '../models';
import {ContributionsService} from '../contributions.service';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.css']
})
export class CreatorComponent implements OnInit {
  itemToEdit: number = -1;
  groupings: Grouping[];
  contributions: Contribution[];

  constructor(private contributionService: ContributionsService) {
    this.contributions = contributionService.contributionsAsValue;
    this.groupings = this.contributionService.groupingsAsValue;
  }

  ngOnInit() {
  }


}
