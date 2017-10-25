import { Component, OnInit } from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {ListingService} from '../services/listing.service';


@Component({
  selector: 'app-serendipitous-view',
  templateUrl: './serendipitous-view.component.html',
  styleUrls: ['./serendipitous-view.component.css']
})
export class SerendipitousViewComponent implements OnInit {
  showDetail = false;
  showCarousel = false;
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
          if (selectedGrouping.displayMode === 'Voting Results') {
            this.showDetail = true;
          } else {
            this.showCarousel = true;
          }
        }
      });
    }
  }

  toggleDetail() {
    this.showCarousel = !this.showCarousel;
    this.showDetail = !this.showDetail;
    this.resetDetailTimer();
  }

  resetDetailTimer() {
    if (this.listingService.grouping.displayMode !== 'Voting Results') {
      clearTimeout(this.showDetailTimer);
      this.showDetailTimer = setTimeout(() => {
        this.showDetail = false;
        this.showCarousel = true;
      }, 20000);
    }
  }
}
