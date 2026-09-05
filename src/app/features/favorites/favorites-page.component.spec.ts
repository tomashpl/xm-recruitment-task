import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideGalleryUi } from '@gallery/ui';

import { Photo } from '../../models/photo.model';
import { FAVORITES_STORAGE_KEY, serializeFavorites } from '../../shared/favorites/favorites';
import { samplePhoto } from '../../shared/photos/picsum.test-data';
import { GRID_LAYOUT_STORAGE_KEY } from '../../shared/preferences/grid-layout';
import { FavoritesPageComponent } from './favorites-page.component';

describe('FavoritesPageComponent', () => {
  beforeEach(async () => {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    localStorage.removeItem(GRID_LAYOUT_STORAGE_KEY);

    await TestBed.configureTestingModule({
      imports: [FavoritesPageComponent],
      providers: [provideZonelessChangeDetection(), provideRouter([]), provideGalleryUi()],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    localStorage.removeItem(GRID_LAYOUT_STORAGE_KEY);
  });

  async function render(
    ...photos: readonly Photo[]
  ): Promise<ComponentFixture<FavoritesPageComponent>> {
    if (photos.length > 0) {
      localStorage.setItem(FAVORITES_STORAGE_KEY, serializeFavorites(photos));
    }

    const created = TestBed.createComponent(FavoritesPageComponent);
    await created.whenStable();
    return created;
  }

  it('labels the section by its heading', async () => {
    const fixture = await render();
    const section: HTMLElement = fixture.nativeElement.querySelector('section');
    const heading: HTMLElement = fixture.nativeElement.querySelector('h2');
    expect(section.getAttribute('aria-labelledby')).toBe(heading.id);
  });

  it('shows the empty state while nothing can be favorited yet', async () => {
    const fixture = await render();
    expect(fixture.nativeElement.querySelector('ui-empty-state')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-photo-grid')).toBeNull();
  });

  it('sends the visitor back to the photostream', async () => {
    const fixture = await render();
    const cta: HTMLAnchorElement = fixture.nativeElement.querySelector('ui-empty-state a');
    expect(cta.getAttribute('href')).toBe('/');
    expect(cta.textContent).toContain('Browse photos');
  });

  it('renders a tile for every saved photo instead of the empty state', async () => {
    const saved = await render(samplePhoto({ id: '1' }), samplePhoto({ id: '2' }));
    expect(saved.nativeElement.querySelectorAll('app-photo-tile').length).toBe(2);
    expect(saved.nativeElement.querySelector('ui-empty-state')).toBeNull();
  });

  it('links each tile to the detail route rather than toggling it', async () => {
    const saved = await render(samplePhoto({ id: '7' }));
    const anchor: HTMLAnchorElement = saved.nativeElement.querySelector('app-photo-tile a');
    expect(anchor.getAttribute('href')).toBe('/photos/7');
    expect(saved.nativeElement.querySelector('app-photo-tile button')).toBeNull();
  });

  it('fills the heart on every tile it shows', async () => {
    const saved = await render(samplePhoto({ id: '7' }));
    expect(saved.nativeElement.querySelector('app-favorite-badge span').classList).toContain(
      'app-favorite-badge--active',
    );
  });

  it('offers the same layout toggle as the photostream', async () => {
    const saved = await render(samplePhoto({ id: '7' }));
    const header: HTMLElement = saved.nativeElement.querySelector('.app-page__header');
    expect(header.querySelector('app-grid-layout-toggle')).not.toBeNull();
  });

  it('honours the layout the visitor chose in the photostream', async () => {
    localStorage.setItem(GRID_LAYOUT_STORAGE_KEY, 'masonry');
    const saved = await render(samplePhoto({ id: '7' }));
    expect(saved.nativeElement.querySelector('app-photo-grid').classList).toContain(
      'app-photo-grid--masonry',
    );
  });
});
