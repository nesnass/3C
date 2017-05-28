
export class Contribution {
  origin: string;
  created: Date;
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
    this.setContribution(cData);
  }

  setContribution(cData) {
    this.origin = cData.origin;
    this.created = new Date(cData.created);
    let data = {};
    switch(this.origin) {
      case "instagram":
        data = cData["instagram_data"];
        this.image = {
          originalWidth: data["images"]["standard_resolution"]["width"],
          originalHeight: data["images"]["standard_resolution"]["height"],
          url: data["images"]["standard_resolution"]["url"]
        };
        this.caption = data["caption"]["text"];
        this.user = {
          profile_picture: data["user"]["profile_picture"],
          username: data["user"]["username"]
        };
        break;
      case "mms":
        data = cData["message_data"];
        this.image = {
          originalWidth: 200,
          originalHeight: 200,
          url: data["images"][0]["url"]
        };
        this.caption = data["msg"];
        this.user = {
          profile_picture: "",
          username: "Sent by MMS"
        };
        break;
    }
  }
}
