import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appConfig } from '../../app.config';
import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<ButtonComponent>;
  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
      providers: [...appConfig.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    await fixture.whenStable();
  });

  it('reports the filled variant by default', () => {
    expect(button().getAttribute('data-variant')).toBe('filled');
  });

  it('keeps the danger variant on a filled Material button and marks it with the danger class', async () => {
    fixture.componentRef.setInput('variant', 'danger');
    await fixture.whenStable();
    expect(button().getAttribute('data-variant')).toBe('danger');
    expect(button().classList).toContain('app-button--danger');
    expect(fixture.componentInstance['matVariant']()).toBe('filled');
  });

  it('maps the tonal variant onto a tonal Material button', async () => {
    fixture.componentRef.setInput('variant', 'tonal');
    await fixture.whenStable();
    expect(button().getAttribute('data-variant')).toBe('tonal');
    expect(fixture.componentInstance['matVariant']()).toBe('tonal');
  });

  it('renders a leading icon only when one is given', async () => {
    expect(fixture.nativeElement.querySelector('app-icon')).toBeNull();
    fixture.componentRef.setInput('icon', 'favorite');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('app-icon')).not.toBeNull();
  });

  it('exposes an accessible name when a label is given', async () => {
    fixture.componentRef.setInput('label', 'Remove from favorites');
    await fixture.whenStable();
    expect(button().getAttribute('aria-label')).toBe('Remove from favorites');
  });

  it('emits activate when clicked', () => {
    const spy = jasmine.createSpy('activate');
    fixture.componentInstance.activate.subscribe(spy);
    button().click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
