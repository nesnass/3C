import { Response } from '@angular/http';
import {DomSanitizer} from '@angular/platform-browser';

// The Vote class stores a voting response list for a particular combination of two Contributions
export class Vote {
  groupingId: string;
  c1Id: string;
  c2Id: string;
  votes: [{
    c1: boolean;
    c2: boolean;
  }];

  constructor(data: {}) {
    this.groupingId = data['grouping'];
    this.c1Id = data['c1'];
    this.c2Id = data['c2'];
    this.votes = data['votes'];
  }
}

// This Voting subclass applies to a particular Contribution. It stores a vote total, exposure total for this Contribution
export class Voting {
  votes: number;
  exposures: number;
  grouping_id: string;

  constructor(vData) {
    this.votes = parseInt(vData.votes, 10);
    this.exposures = parseInt(vData.exposures, 10);
    this.grouping_id = vData.grouping_id || '0';
  }
}

export class Contribution {
  _id: string;
  origin: string;
  created: Date;
  chips: string[];
  vetted: boolean;
  voting: Voting[];
  groupingVoting?: Voting;    // Temp value for front end sorting of votes, set to the voting results for the current Grouping only
  totalVotes?: number;
  votedNeither: boolean;
  image: {
    originalWidth: number;
    originalHeight: number;
    url: string;
  };
  user: {
    profile_picture: string;
    username: string;
  };
  caption: string;
  status: {
    living: boolean;
    studying: boolean;
    working: boolean;
    other: boolean;
  };

  constructor(cData: {}, grouping: Grouping) {
    this.chips = [];
    this.voting = [];
    this.vetted = false;
    this.totalVotes = 0;
    this.groupingVoting = new Voting({});
    this.votedNeither = false;
    this.caption = '';
    this.image = {
      originalWidth: 0,
      originalHeight: 0,
      url: ''
    };
    this.user = {
      profile_picture: '',
      username: ''
    };
    this.setContribution(cData);
    if (grouping !== null) {
      this.setGroupingVotingIndex(grouping);
    }
  }

  setGroupingVotingIndex(mainGrouping: Grouping) {

    // For Voting Results - Tally votes that match the groupings selected in the mainGrouping
    if (mainGrouping.displayMode === 'Voting Results') {
      this.groupingVoting = new Voting({votes: 0, exposures: 0, grouping_id: 'inactive'});
      this.voting.forEach((v) => {
        if (mainGrouping.votingResultsOptions.groupings.indexOf(v.grouping_id) > -1) {
          this.totalVotes += v.votes;
          this.groupingVoting.votes += v.votes;
          this.groupingVoting.exposures += v.exposures;
          this.groupingVoting.grouping_id = 'active';  // a key is needed here to allow filtering these Contributions from others
        }
      });

    // Otherwise, tally all of the votes we find, and set up for for a single Grouping
    } else {
      this.voting.forEach((vote) => {
        this.totalVotes += vote.votes;
        if (vote.grouping_id === mainGrouping._id) {
          this.groupingVoting = new Voting(vote);
        }
      });
    }
  }

  setContribution(cData) {
    this._id = cData._id;
    this.origin = cData.origin;
    this.created = new Date(cData.created);
    this.vetted = cData.vetted;
    this.chips = cData.chips || [];
    if (cData.voting) {
      cData.voting.forEach((v) => {
        this.voting.push(new Voting(v));
      });
    }
    let data = {};
    switch (this.origin) {
      case 'instagram':
        data = cData['instagram_data'];
        this.image = {
          originalWidth: data['images']['standard_resolution']['width'],
          originalHeight: data['images']['standard_resolution']['height'],
          url: data['images']['standard_resolution']['url']
        };
        if (data.hasOwnProperty('caption')) {
          this.caption = data['caption']['text'];
        }
        this.user = {
          profile_picture: data['user']['profile_picture'],
          username: data['user']['username']
        };
        break;
      case 'facebook-album':
        data = cData['facebook_data'];
        this.image = {
          originalWidth: data['images']['width'],
          originalHeight: data['images']['height'],
          url: data['images']['url']
        };
        if (data.hasOwnProperty('caption')) {
          this.caption = data['caption']['text'];
        }
        this.user = {
          profile_picture: data['user']['profile_picture'],
          username: data['user']['username']
        };
        break;
      case '3C':
        data = cData['threeC_data'];
        if (data.hasOwnProperty('caption')) {
          this.caption = data['caption']['text'];
        }
        break;
      case 'mms':
        data = cData['message_data'];
        this.image = {
          originalWidth: 200,
          originalHeight: 200,
          url: data['images'][0]['url']
        };
        this.caption = data['msg'];
        this.user = {
          profile_picture: '',
          username: 'Sent by MMS'
        };
        break;
    }
  }
}

export class Options {
  viewMode: string;
}

export const contributionModes = [
  { value: 'All', viewValue: 'All' },
  { value: 'Chips', viewValue: 'Chips' },
  { value: 'Feed', viewValue: 'Feed' }
];

export const displayModes = [
  { value: 'Voting', viewValue: 'Voting' },
  { value: 'VotingResults', viewValue: 'Voting Results' },
  { value: 'Serendipitous', viewValue: 'Serendipitous' }
];

export const votingDisplayModes = [
  { value: 'Image', viewValue: 'Image' },
  { value: 'Caption', viewValue: 'Caption As Image' }
];

export const titleDescriptionModes = [
  { value: 'Automatic', viewValue: 'Automatic' },
  { value: 'Custom', viewValue: 'Custom' }
];

export class InputData {
  text: string;
  status: {
    living: boolean;
    studying: boolean;
    working: boolean;
    other: boolean;
  };
  votingChipId: string;

  constructor() {
    this.text = '';
    this.status = {
      living: false,
      studying: false,
      working: false,
      other: false
    };
    this.votingChipId = '';
  }

  /*asFormData(): FormData {
    const fd = new FormData();
    fd.append('answersAsMap[852800].textAnswer', this.text);
    fd.append('answersAsMap[852801].answerOptions', '1854978', this.living.toString());
    fd.append('answersAsMap[852801].answerOptions', '1854979', this.studying.toString());
    fd.append('answersAsMap[852801].answerOptions', '1854980', this.working.toString());
    fd.append('answersAsMap[852801].answerOptions', '1854981', this.other.toString());
    return fd;
  }*/

  setChip(chipId: string) {
    this.votingChipId = chipId;
  }
}

export class Settings {
  defaultGroupingId: string;
  defaultLoadPage: string;

  constructor(sData?: {}) {
    this.defaultGroupingId = '';
    this.defaultLoadPage = '';

    if (typeof sData !== 'undefined' && sData !== null) {
      if (sData.hasOwnProperty('defaultGroupingId')) {
        this.defaultGroupingId = sData['defaultGroupingId'];
      }
      if (sData.hasOwnProperty('defaultLoadPage')) {
        this.defaultLoadPage = sData['defaultLoadPage'];
      }
    }
  }
}

export class GroupingsSelector {
  id: string;
  title: string;
  selected: boolean;

  constructor(id: string, title: string, selected: boolean) {
    this.id = id;
    this.title = title;
    this.selected = selected;
  }
}

export class Grouping {
  _id: string;
  urlSlug: string;
  categoryTitle: string;
  categorySubtitle: string;
  titleDescriptionMode: string;
  contributionMode: string;
  displayMode: string;
  votingOptions: {
    displayMode: string;
    imageCaption: boolean;
    resultsVisible: boolean;
  };
  votingResultsOptions: {
    groupings: string[];
    groupingsSelectors?: GroupingsSelector[];
    groupingViewId: string;
  };
  serendipitousOptions: {
    randomSelection: boolean;
  };
  chips: string[];
  created: Date;
  active?: boolean;

  constructor(gData?: {}) {
    this.chips = [];
    this.urlSlug = '';
    this.active = false;
    this.titleDescriptionMode = 'Automatic';    // 'Automatic' or 'Custom'
    this.contributionMode = 'Chips';      // 'Chips', 'All', 'Feed'
    this.displayMode = 'Serendipitous';   // 'Serendipitous', 'Voting', 'Voting Results'
    this.votingOptions = {
      displayMode: 'Image',      // 'Image', 'Caption'
      imageCaption: true,
      resultsVisible: true
    };
    this.votingResultsOptions = {
      groupings: [],
      groupingsSelectors: null,
      groupingViewId: ''
    };
    this.serendipitousOptions = {
      randomSelection: false
    };
    this.created = new Date();
    if (typeof gData !== 'undefined' && gData !== null) {
      this.setGrouping(gData);
    }
  }

  setGrouping(gData) {
    this._id = gData._id;
    this.urlSlug = gData.urlSlug;
    this.created = new Date(gData.created);
    this.categoryTitle = gData.categoryTitle;
    this.categorySubtitle = gData.categorySubtitle;
    this.titleDescriptionMode = gData.titleDescriptionMode;
    this.contributionMode = gData.contributionMode;
    this.displayMode = gData.displayMode;
    this.votingOptions = gData.votingOptions;
    this.votingResultsOptions.groupings = gData.votingResultsOptions.groupings;
    this.votingResultsOptions.groupingsSelectors = [];        // Needed at front end only, set up in Creator
    this.votingResultsOptions.groupingViewId = gData.votingResultsOptions.groupingViewId;
    this.serendipitousOptions = gData.serendipitousOptions;
    this.chips = gData.chips;
  }
}

export class Chip {
  _id: string;
  origin_id: string;
  origin: string;
  label: string;
  description: string;
  location: string;
}

export interface GroupingsResponse extends Response {
  data: Grouping[];
}
export interface GroupingResponse extends Response {
  data: Grouping;
}
export interface SettingResponse extends Response {
  data: Settings;
}
export interface VoteResponse extends Response {
  data: Vote[];
}
export interface ContributionsResponse extends Response {
  data: Contribution[];
}
