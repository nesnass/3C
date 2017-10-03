import { Response } from '@angular/http';
import {DomSanitizer} from '@angular/platform-browser';

class Voting {
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
  voting: Voting[];
  groupingVoting?: Voting;    // Temp value for front end sorting of votes, set to the voting results for the current Grouping only
  totalVotes?: number;
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

  constructor(cData: {}, grouping: Grouping) {
    this.chips = [];
    this.voting = [];
    this.totalVotes = 0;
    this.groupingVoting = new Voting({});
    this.caption = '';
    this.setContribution(cData);
    if (grouping !== null) {
      this.setGroupingVotingIndex(grouping);
    }
  }

  setGroupingVotingIndex(grouping: Grouping) {
    this.voting.forEach((vote) => {
      this.totalVotes += vote.votes;
      if (vote.grouping_id === grouping._id) {
        this.groupingVoting = new Voting(vote);
      }
    });
  }

  setContribution(cData) {
    this._id = cData._id;
    this.origin = cData.origin;
    this.created = new Date(cData.created);
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
  living: boolean;
  student: boolean;
  working: boolean;
  other: boolean;

  constructor() {
    this.text = '';
    this.living = false;
    this.student = false;
    this.working = false;
    this.other = false;
  }

  asFormData(): FormData {
    const fd = new FormData();
    fd.append('answersAsMap[852800].textAnswer', this.text);
    fd.append('answersAsMap[852801].answerOptions', '1854978', this.living.toString());
    fd.append('answersAsMap[852801].answerOptions', '1854979', this.student.toString());
    fd.append('answersAsMap[852801].answerOptions', '1854980', this.working.toString());
    fd.append('answersAsMap[852801].answerOptions', '1854981', this.other.toString());
    return fd;
  }
};

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
  serendipitousOptions: {
    randomSelection: boolean;
  };
  chips: string[];
  created: Date;

  constructor(gData?: {}) {
    this.chips = [];
    this.titleDescriptionMode = 'Automatic';    // 'Automatic' or 'Custom'
    this.contributionMode = 'Chips';      // 'Chips', 'All', 'Feed'
    this.displayMode = 'Serendipitous';   // 'Serendipitous', 'Voting', 'Voting Results'
    this.votingOptions = {
      displayMode: 'Image',      // 'Image', 'Caption'
      imageCaption: true,
      resultsVisible: true
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

export interface ContributionsResponse extends Response {
  data: Contribution[];
}
