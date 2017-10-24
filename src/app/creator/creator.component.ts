import { Component, OnInit } from '@angular/core';
import {Grouping, contributionModes, displayModes, votingDisplayModes, titleDescriptionModes, Chip} from '../models';
import { ListingService } from '../services/listing.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-creator',
  templateUrl: './creator.component.html',
  styleUrls: ['./creator.component.css']
})
export class CreatorComponent implements OnInit {
  itemToEdit: number = -1;
  contributionModes: {}[];
  displayModes: {}[];
  votingDisplayModes: {}[];
  titleDescriptionModes: {}[];

  constructor(private route: ActivatedRoute, private listingService: ListingService) {
    this.contributionModes = contributionModes;
    this.displayModes = displayModes;
    this.votingDisplayModes = votingDisplayModes;
    this.titleDescriptionModes = titleDescriptionModes;
  }

  ngOnInit() {
    // this.contributions = this.contributionService.contributionsAsValue;
    // this.groupings = this.contributionService.groupingsAsValue;

    this.route.queryParamMap.subscribe(
      paramsMap => {
        if (paramsMap.has('pw')) {
          this.listingService.routePassword = paramsMap.get('pw');
          this.listingService.auth().subscribe((response) => {
            console.log(response['data']);
            if (response['data'] !== 'ok') {
              this.listingService.navigateToView('');
            }
          }, () => {
            this.listingService.navigateToView('');
          });
        } else {
          this.listingService.navigateToView('');
        }
      }
    );
  }

  updateToServer(item, type) {
    if (type === 'Grouping') {
      this.listingService.updateGrouping(this.vetGrouping(item));
    } else {
      this.listingService.updateContribution(item);
    }
  }

  updateDefaultGroupingId() {
    this.listingService.updateSettings();
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

  vetGrouping(grouping: Grouping): Grouping {
    if (grouping.urlSlug.length > 0 && grouping.urlSlug[0] === '/') {
      grouping.urlSlug = grouping.urlSlug.substr(1);
    }
    return grouping;
  }

  chipStyle(chip: Chip, item) {
    let i;
    if (item) {
      i = item.chips.indexOf(chip._id);
    } else {
      i = 0;
    }
    switch (chip.origin) {
      case 'facebook-album':
        return (i > -1) ? { backgroundColor: 'blue', color: 'white' }
        : { backgroundColor: 'lightgrey', color: 'blue' };
      case 'facebook-feed':
        return (i > -1) ? { backgroundColor: 'green', color: 'white' }
        : { backgroundColor: 'lightgrey', color: 'green' };
      case 'instagram':
        return (i > -1) ? { backgroundColor: 'red', color: 'white' }
        : { backgroundColor: 'lightgrey', color: 'red' };
      case 'mms':
        return (i > -1) ? { backgroundColor: 'brown', color: 'white' }
        : { backgroundColor: 'lightgrey', color: 'brown' };
    }
  }

  appUrl() {
    return this.listingService.appUrl;
  }

  displayMode(grouping: Grouping) {
    switch (grouping.displayMode) {
      case 'Serendipitous':
        return 'display/';
      case 'Voting Results':
        return 'display/';
      case 'Voting':
        return 'vote/';
    }
  }

}
