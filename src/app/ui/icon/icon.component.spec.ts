import { ComponentFixture, TestBed } from '@angular/core/testing';

import { appConfig } from '../../app.config';
import { IconComponent } from './icon.component';

describe('IconComponent', () => {
  let fixture: ComponentFixture<IconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconComponent],
      providers: [...appConfig.providers],
    }).compileComponents();

    fixture = TestBed.createComponent(IconComponent);
    fixture.componentRef.setInput('name', 'favorite');
    await fixture.whenStable();
  });

  it('renders the ligature through the Material Symbols font set', () => {
    const icon: HTMLElement = fixture.nativeElement.querySelector('mat-icon');
    expect(icon.textContent.trim()).toBe('favorite');
    expect(icon.classList).toContain('material-symbols-outlined');
  });

  it('is hidden from assistive technology because the host labels it', () => {
    expect(fixture.nativeElement.querySelector('mat-icon').getAttribute('aria-hidden')).toBe('true');
  });

  it('switches to the filled variation when asked', async () => {
    fixture.componentRef.setInput('filled', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-icon').classList).toContain('app-icon--filled');
  });
});
