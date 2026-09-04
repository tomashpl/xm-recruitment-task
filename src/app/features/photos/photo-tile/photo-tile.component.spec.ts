import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appConfig } from '../../../app.config';
import { MOCK_PHOTOS } from '../../../shared/fixtures/mock-photos';
import { PhotoTileComponent } from './photo-tile.component';

describe('PhotoTileComponent', () => {
  let fixture: ComponentFixture<PhotoTileComponent>;
  const photo = MOCK_PHOTOS[0];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoTileComponent],
      providers: [...appConfig.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoTileComponent);
    fixture.componentRef.setInput('photo', photo);
    await fixture.whenStable();
  });

  it('renders a toggle button by default and no link', () => {
    expect(fixture.nativeElement.querySelector('button')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('reports the unpressed state and an add label while not a favorite', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe(`Add ${photo.alt} to favorites`);
  });

  it('reports the pressed state and a remove label once a favorite', async () => {
    fixture.componentRef.setInput('favorite', true);
    await fixture.whenStable();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe(`Remove ${photo.alt} from favorites`);
  });

  it('renders a link to the detail route in the link variant', async () => {
    fixture.componentRef.setInput('interaction', 'link');
    await fixture.whenStable();
    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor.getAttribute('href')).toBe(`/photos/${photo.id}`);
    expect(anchor.getAttribute('aria-label')).toBe(`Open ${photo.alt}`);
    expect(anchor.getAttribute('aria-pressed')).toBeNull();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('emits the photo when the toggle variant is activated', () => {
    const spy = jasmine.createSpy('activate');
    fixture.componentInstance.activate.subscribe(spy);
    fixture.nativeElement.querySelector('button').click();
    expect(spy).toHaveBeenCalledOnceWith(photo);
  });
});
