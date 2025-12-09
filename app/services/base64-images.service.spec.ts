import { TestBed } from '@angular/core/testing';

import { Base64ImagesService } from './base64-images.service';

describe('Base64ImagesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Base64ImagesService = TestBed.get(Base64ImagesService);
    expect(service).toBeTruthy();
  });
});
