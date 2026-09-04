import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appConfig } from '../../app.config';
import { IconButtonComponent } from './icon-button.component';

describe('IconButtonComponent', () => {
  let fixture: ComponentFixture<IconButtonComponent>;
  const button = (): HTMLButtonElement => fixture.nativeElement.querySelector('button');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconButtonComponent],
      providers: [...appConfig.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(IconButtonComponent);
    fixture.componentRef.setInput('icon', 'arrow_back');
    fixture.componentRef.setInput('label', 'Back to favorites');
    await fixture.whenStable();
  });

  it('carries the label as its accessible name', () => {
    expect(button().getAttribute('aria-label')).toBe('Back to favorites');
  });

  it('renders the requested icon', () => {
    expect(fixture.nativeElement.querySelector('mat-icon').textContent.trim()).toBe('arrow_back');
  });

  it('shrinks the compact variant without shrinking the touch target', async () => {
    expect(button().getBoundingClientRect().height).toBe(48);

    fixture.componentRef.setInput('size', 'sm');
    await fixture.whenStable();

    expect(button().getBoundingClientRect().height).toBe(28);
    expect(fixture.nativeElement.querySelector('mat-icon').style.fontSize).toBe('20px');

    const touchTarget: HTMLElement =
      fixture.nativeElement.querySelector('.mat-mdc-button-touch-target');
    expect(getComputedStyle(touchTarget).position).toBe('absolute');
    expect(touchTarget.getBoundingClientRect().height).toBe(48);
  });

  it('emits activate when clicked', () => {
    const spy = jasmine.createSpy('activate');
    fixture.componentInstance.activate.subscribe(spy);
    button().click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
