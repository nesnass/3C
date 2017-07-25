import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-smaller-view',
  templateUrl: './smaller-view.component.html',
  styleUrls: ['./smaller-view.component.css']
})
export class SmallerViewComponent implements OnInit {
  showDetail = false;
  showCarousel = true;
  showDetailTimer = null;

  constructor() { }

  ngOnInit() {
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
