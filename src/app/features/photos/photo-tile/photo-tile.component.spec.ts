import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideGalleryUi } from '@gallery/ui';

import { samplePhoto } from '../../../shared/photos/picsum.test-data';
import { PhotoTileComponent } from './photo-tile.component';

describe('PhotoTileComponent', () => {
  let fixture: ComponentFixture<PhotoTileComponent>;
  const photo = samplePhoto();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoTileComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideGalleryUi()],
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

  it('reflects the favorite input in the link variant instead of always showing active', async () => {
    fixture.componentRef.setInput('interaction', 'link');
    fixture.componentRef.setInput('favorite', false);
    await fixture.whenStable();
    const icon: HTMLElement = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.classList).not.toContain('ui-icon--filled');
  });

  it('expands the badge while the toggle variant is hovered or focused', async () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const badge = (): HTMLElement => fixture.nativeElement.querySelector('app-favorite-badge span');
    expect(badge().classList).not.toContain('app-favorite-badge--expanded');

    button.dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(badge().classList).toContain('app-favorite-badge--expanded');

    button.dispatchEvent(new MouseEvent('mouseleave'));
    await fixture.whenStable();
    expect(badge().classList).not.toContain('app-favorite-badge--expanded');

    button.dispatchEvent(new FocusEvent('focus'));
    await fixture.whenStable();
    expect(badge().classList).toContain('app-favorite-badge--expanded');
  });

  it('leaves the badge static in the link variant', async () => {
    fixture.componentRef.setInput('interaction', 'link');
    fixture.componentRef.setInput('favorite', true);
    await fixture.whenStable();
    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    anchor.dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    const badge: HTMLElement = fixture.nativeElement.querySelector('app-favorite-badge span');
    expect(badge.classList).not.toContain('app-favorite-badge--expanded');
  });

  it('stays square when no ratio is given', () => {
    const control: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(control.style.aspectRatio).toBe('');
    expect(getComputedStyle(control).aspectRatio).toBe('1 / 1');
  });

  it('takes the ratio it is given', async () => {
    fixture.componentRef.setInput('aspectRatio', '600 / 400');
    await fixture.whenStable();
    const control: HTMLElement = fixture.nativeElement.querySelector('button');
    expect(control.style.aspectRatio).toBe('600 / 400');
  });

  it('applies the ratio to the link variant too', async () => {
    fixture.componentRef.setInput('interaction', 'link');
    fixture.componentRef.setInput('aspectRatio', '400 / 600');
    await fixture.whenStable();
    const control: HTMLElement = fixture.nativeElement.querySelector('a');
    expect(control.style.aspectRatio).toBe('400 / 600');
  });
});
