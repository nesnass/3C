import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showDetail = true;
  showCarousel = false;
  showDetailTimer = null;

  constructor() {

  }

  ngOnInit(): void {

  }

  toggleDetail($event) {
    this.showCarousel = false;
    this.showDetail = true;

    this.showDetailTimer = setTimeout(() => {
      //this.showDetail = false;
      //this.showCarousel = true;
    }, 20000)
  }
}
