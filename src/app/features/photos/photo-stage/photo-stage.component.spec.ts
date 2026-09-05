import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MOCK_DETAIL_PHOTO } from '../../../shared/fixtures/mock-photos';
import { PhotoStageComponent } from './photo-stage.component';

describe('PhotoStageComponent', () => {
  let fixture: ComponentFixture<PhotoStageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoStageComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoStageComponent);
    fixture.componentRef.setInput('photo', MOCK_DETAIL_PHOTO);
    await fixture.whenStable();
  });

  it('renders the photo inside a figure', () => {
    const image: HTMLImageElement = fixture.nativeElement.querySelector('figure img');
    expect(image.getAttribute('src')).toBe(MOCK_DETAIL_PHOTO.url);
  });

  it('carries the alternative text', () => {
    expect(fixture.nativeElement.querySelector('img').getAttribute('alt')).toBe(
      MOCK_DETAIL_PHOTO.alt,
    );
  });

  it('loads the single photo eagerly because it is the point of the page', () => {
    expect(fixture.nativeElement.querySelector('img').getAttribute('loading')).toBe('eager');
  });
});
