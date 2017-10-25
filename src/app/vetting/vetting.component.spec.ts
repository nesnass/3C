import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VettingComponent } from './vetting.component';

describe('VettingComponent', () => {
  let component: VettingComponent;
  let fixture: ComponentFixture<VettingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VettingComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
