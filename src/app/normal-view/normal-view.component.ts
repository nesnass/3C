import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-normal-view',
  templateUrl: './normal-view.component.html',
  styleUrls: ['./normal-view.component.css']
})
export class NormalViewComponent implements OnInit {
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
