import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallerViewComponent } from './smaller-view.component';

describe('SmallerViewComponent', () => {
  let component: SmallerViewComponent;
  let fixture: ComponentFixture<SmallerViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SmallerViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SmallerViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
