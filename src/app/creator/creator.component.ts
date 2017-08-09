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

  updateToServer(item, type) {
    if (type === 'Grouping') {
      this.listingService.updateGrouping(item);
    } else {
      this.listingService.updateContribution(item);
    }
  }

  deleteAtServer(grouping: Grouping) {
    this.listingService.deleteGrouping(grouping);
  }

  addGrouping() {
    this.listingService.addGrouping(new Grouping());
    this.itemToEdit = this.listingService.groupingsAsValue.length;
  }

  toggleChip(item, type, chip) {
    const i = item.chips.indexOf(chip._id);
    if (i === -1) {
      item.chips.push(chip._id);
    } else {
      item.chips.splice(i, 1);
    }
    this.updateToServer(item, type);
  }

}
