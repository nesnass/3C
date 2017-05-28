import { TestBed, inject } from '@angular/core/testing';

import { ContributionsService } from './contributions.service';

describe('ContributionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ContributionsService]
    });
  });

  it('should be created', inject([ContributionsService], (service: ContributionsService) => {
    expect(service).toBeTruthy();
  }));
});
