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

  constructor(private listingService: ListingService) {
  }

  ngOnInit() {
    // this.contributions = this.contributionService.contributionsAsValue;
    // this.groupings = this.contributionService.groupingsAsValue;
  }

  updateToServer(grouping: Grouping) {
    this.listingService.updateGrouping(grouping);
  }

  deleteAtServer(grouping: Grouping) {
    this.listingService.deleteGrouping(grouping);
  }

  addGrouping() {
    this.listingService.addGrouping(new Grouping());
    this.itemToEdit = this.listingService.groupingsAsValue.length;
  }


}
