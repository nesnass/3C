import { Response } from '@angular/http';

export class Contribution {
  _id: string;
  origin: string;
  created: Date;
  chips: string[];
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

  constructor(cData: {}) {
    this.chips = [];
    this.setContribution(cData);
  }

  setContribution(cData) {
    this._id = cData._id;
    this.origin = cData.origin;
    this.created = new Date(cData.created);
    this.chips = cData.chips || [];
    let data = {};
    switch (this.origin) {
      case 'instagram':
        data = cData['instagram_data'];
        this.image = {
          originalWidth: data['images']['standard_resolution']['width'],
          originalHeight: data['images']['standard_resolution']['height'],
          url: data['images']['standard_resolution']['url']
        };
        this.caption = data['caption']['text'];
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
        this.caption = data['caption']['text'];
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
  { value: 'Serendipitous', viewValue: 'Serendipitous' }
];


export class Grouping {
  _id: string;
  urlSlug: string;
  categoryTitle: string;
  categorySubtitle: string;
  contributionMode: string;
  displayMode: string;
  chips: string[];
  created: Date;

  constructor(gData?: {}) {
    this.chips = [];
    this.contributionMode = 'Chips';
    this.displayMode = 'Serendipitous';
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
    this.contributionMode = gData.contributionMode;
    this.displayMode = gData.displayMode;
    this.chips = gData.chips;
  }
}

export class Chip {
  _id: string;
  origin_id: string;
  origin: string;
  label: string;
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
