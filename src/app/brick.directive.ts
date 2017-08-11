import {Directive, ElementRef, Input, OnInit} from '@angular/core';

@Directive({
  selector: '[appBrick]'
})
export class BrickDirective implements OnInit {
  @Input() contributionVotes: Number;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    this.el.nativeElement['data-voting'] = this.contributionVotes;
  }

}
