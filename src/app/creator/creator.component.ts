import { Component, OnInit } from '@angular/core';
import { Grouping, Contribution } from '../models';
import { ListingService } from '../services/listing.service';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.css']
})
export class CreatorComponent implements OnInit {
  itemToEdit: number = -1;
  newGroupingModel: Grouping;

  constructor(private listingService: ListingService) {
    this.newGroupingModel = new Grouping();
  }

  ngOnInit() {
    // this.contributions = this.contributionService.contributionsAsValue;
    // this.groupings = this.contributionService.groupingsAsValue;
  }

  updateToServer(grouping: Grouping) {
    this.listingService.updateGrouping(grouping);
  }

  addGrouping() {

    // Testing!!
    this.newGroupingModel.categoryTitle = 'Testing 1';
    this.newGroupingModel.categorySubtitle = 'Subtitle 1';
    this.newGroupingModel.contributions = [];
    this.newGroupingModel.urlSlug = 'testSlug';

    this.listingService.addGrouping(this.newGroupingModel);
    this.newGroupingModel = new Grouping();
  }


}
