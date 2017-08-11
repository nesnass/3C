import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VotingViewComponent } from './voting-view.component';

describe('SerendipitousViewComponent', () => {
  let component: VotingViewComponent;
  let fixture: ComponentFixture<VotingViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VotingViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VotingViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
