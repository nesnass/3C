import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ContributionGridComponent } from './contribution-grid.component';

describe('ContributionGridComponent', () => {
  let component: ContributionGridComponent;
  let fixture: ComponentFixture<ContributionGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ContributionGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContributionGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
