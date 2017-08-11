import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SerendipitousViewComponent } from './serendipitous-view.component';

describe('SerendipitousViewComponent', () => {
  let component: SerendipitousViewComponent;
  let fixture: ComponentFixture<SerendipitousViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SerendipitousViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SerendipitousViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
