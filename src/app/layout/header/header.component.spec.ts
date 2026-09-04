import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appConfig } from '../../app.config';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [...appConfig.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    await fixture.whenStable();
  });

  it('is the banner landmark', () => {
    expect(fixture.nativeElement.querySelector('header').getAttribute('role')).toBe('banner');
  });

  it('always shows the title and the view tabs', () => {
    expect(fixture.nativeElement.querySelector('app-title')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('app-view-tabs')).not.toBeNull();
  });

  it('hides the back control by default', () => {
    expect(fixture.nativeElement.querySelector('app-icon-button')).toBeNull();
  });

  it('shows the back control when asked', async () => {
    fixture.componentRef.setInput('showBack', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button[aria-label="Back to favorites"]')).not.toBeNull();
  });

  it('emits back when the control is pressed', async () => {
    fixture.componentRef.setInput('showBack', true);
    await fixture.whenStable();
    const spy = jasmine.createSpy('back');
    fixture.componentInstance.back.subscribe(spy);
    fixture.nativeElement.querySelector('button[aria-label="Back to favorites"]').click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
