import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { samplePhoto } from '../../../shared/photos/picsum.test-data';
import { PhotoStageComponent } from './photo-stage.component';

describe('PhotoStageComponent', () => {
  let fixture: ComponentFixture<PhotoStageComponent>;
  const photo = samplePhoto({
    url: 'https://picsum.photos/id/0/1200/800',
    alt: 'photo by Alejandro Escamilla',
    width: 1200,
    height: 800,
  });

  const figure = (): HTMLElement => fixture.nativeElement.querySelector('figure');
  const image = (): HTMLImageElement => fixture.nativeElement.querySelector('img');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoStageComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoStageComponent);
    fixture.componentRef.setInput('photo', photo);
    await fixture.whenStable();
  });

  it('renders the photo inside a figure', () => {
    expect(image().getAttribute('src')).toBe(photo.url);
  });

  it('carries the alternative text', () => {
    expect(image().getAttribute('alt')).toBe(photo.alt);
  });

  it('loads the single photo eagerly because it is the point of the page', () => {
    expect(image().getAttribute('loading')).toBe('eager');
  });

  it('reserves the photo aspect ratio before the image loads', () => {
    expect(getComputedStyle(figure()).aspectRatio).toBe('1200 / 800');
  });

  it('reserves a different box for a portrait photo', async () => {
    fixture.componentRef.setInput('photo', samplePhoto({ width: 1200, height: 1600 }));
    await fixture.whenStable();
    expect(getComputedStyle(figure()).aspectRatio).toBe('1200 / 1600');
  });

  it('lets the image fill the container width instead of capping its height', () => {
    expect(getComputedStyle(image()).maxHeight).toBe('none');
    expect(image().getBoundingClientRect().width).toBe(figure().getBoundingClientRect().width);
  });
});
