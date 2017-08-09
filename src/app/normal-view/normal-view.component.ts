import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ListingService} from '../services/listing.service';


@Component({
  selector: 'app-normal-view',
  templateUrl: './normal-view.component.html',
  styleUrls: ['./normal-view.component.css']
})
export class NormalViewComponent implements OnInit {
  showDetail = false;
  showCarousel = true;
  showDetailTimer = null;
  position: string;

  constructor(private route: ActivatedRoute, private listingService: ListingService) {
    this.position = 'none';
    this.route.params.subscribe( params => this.position = params.position );
  }

  ngOnInit() {
    if (this.position !== 'none') {
      let selectedGrouping = null;
      this.listingService.groupings.subscribe( (groupings) => {
        groupings.forEach((grouping) => {
          if (grouping.urlSlug === this.position) {
            selectedGrouping = grouping;
          }
        });
        if (selectedGrouping !== null) {
          this.listingService.grouping = selectedGrouping;
        }
      });
    }
  }

  toggleDetail() {
    this.showCarousel = false;
    this.showDetail = true;

    this.showDetailTimer = setTimeout(() => {
      this.showDetail = false;
      this.showCarousel = true;
    }, 20000);
  }
}
