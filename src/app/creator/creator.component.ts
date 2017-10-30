import { Component, OnInit } from '@angular/core';
import {
  Grouping, contributionModes, displayModes, votingDisplayModes, titleDescriptionModes, Chip,
  Contribution, Vote, Voting, GroupingsSelector
} from '../models';
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

  // Vetting vars
  groupings: Grouping[];
  selectedGrouping: Grouping = null;
  contributions: Contribution[];
  includeApprovedItems: boolean;

  // Votes *** NOT CURRENTLY USED October 2017 ***
  votes: Vote[];

  constructor(private route: ActivatedRoute, public listingService: ListingService) {
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

    this.listingService.showUnvettedContributions = true;

    this.listingService.groupings.subscribe(
      groupings => {
        this.groupings = groupings;

        // Set up the 'groupingsSelectors' for each Grouping to allow front end check box selection
        this.groupings.map((grouping) => {
          this.groupings.forEach((g) => {
            grouping.votingResultsOptions.groupingsSelectors.push(
              new GroupingsSelector(
                g._id,
                g.categoryTitle || '(' + g._id + ')',
                grouping.votingResultsOptions.groupings.indexOf(g._id) > -1
              )
            );
          });
        });
      }
    );

    this.listingService.contributions.subscribe(
      contributions => {
        this.contributions = contributions;
      }
    );

    // Votes var *** NOT CURRENTLY USED October 2017 ***
    this.listingService.votes.subscribe(
      votes => {
        this.votes = votes;
      }
    );
  }

  selectVotingResultGrouping(grouping: Grouping, gs: GroupingsSelector) {
    const i = grouping.votingResultsOptions.groupings.indexOf(gs.id);
    if (gs.selected && i === -1) {
      grouping.votingResultsOptions.groupings.push(gs.id);
    } else if (!gs.selected && i > -1) {
      grouping.votingResultsOptions.groupings.splice(i, 1);
    }
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

  // --------------   Vetting --------------------


  get contributionsFilteredByApproval() {
    return this.contributions.filter((c) => {
      return this.includeApprovedItems ? true : !c.vetted;
    });
  }

  showContributionsFor(group: Grouping) {
    this.selectedGrouping = group;
    this.listingService.grouping = group;
  }

  deleteContribution(c: Contribution) {
    this.listingService.deleteContribution(c);
  }

  approveContribution(c: Contribution) {
    c.vetted = true;
    this.listingService.updateContribution(c);
  }

  // -----------------   Votes Display ----------------------


  get contributionsFilteredByActiveGrouping() {
    return this.contributions.filter((c) => {
      return c.groupingVoting.grouping_id === 'active';
    });
  }

  // In this case the Voting class is used to accumulate voting results ACROSS grouping IDs.
  // Therefore the Contribution.groupingVoting.grouping_id will == '';
  createAggregatedVoteCount() {
    const selectedGroupingIds = this.groupings.filter((g) => {
      return g.active;
    }).map((fg) => {
      return fg._id;
    });

    this.contributions.map((c) => {
      c.groupingVoting = new Voting({votes: 0, exposures: 0, grouping_id: 'inactive'});
      c.voting.forEach((v) => {
        if (selectedGroupingIds.indexOf(v.grouping_id) > -1) {
          c.groupingVoting.votes += v.votes;
          c.groupingVoting.exposures += v.exposures;
          c.groupingVoting.grouping_id = 'active';
        }
      });
    });
  }


}
