import { TestBed, inject } from '@angular/core/testing';

import { ListingService } from './listing.service';

describe('ContributionsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ListingService]
    });
  });

  it('should be created', inject([ListingService], (service: ListingService) => {
    expect(service).toBeTruthy();
  }));
});
