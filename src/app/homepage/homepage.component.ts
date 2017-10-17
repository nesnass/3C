import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {ListingService} from '../services/listing.service';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.css']
})
export class HomepageComponent implements OnInit {

  constructor(private router: Router, private listingService: ListingService) { }

  ngOnInit() {
    const redirectPage = () => {
      const url = this.listingService.settings.defaultLoadPage;
      if (url !== '') {
        this.router.navigate(['/vote/' + url]);
      } else {
        setTimeout( () => {
          redirectPage();
        }, 2000);
      }
    };
    redirectPage();
  }

}
