import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appConfig } from '../../app.config';
import { ViewTabsComponent } from './view-tabs.component';

describe('ViewTabsComponent', () => {
  let fixture: ComponentFixture<ViewTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTabsComponent],
      providers: [...appConfig.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewTabsComponent);
    await fixture.whenStable();
  });

  it('labels the navigation landmark', () => {
    expect(fixture.nativeElement.querySelector('nav').getAttribute('aria-label')).toBe('Views');
  });

  it('offers exactly the photos and favorites destinations', () => {
    const hrefs = Array.from<HTMLAnchorElement>(fixture.nativeElement.querySelectorAll('a'))
      .map(anchor => anchor.getAttribute('href'));
    expect(hrefs).toEqual(['/', '/favorites']);
  });

  it('shows the favorites count in the badge', async () => {
    fixture.componentRef.setInput('favoritesCount', 4);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-badge').textContent.trim()).toBe('4');
  });
});
