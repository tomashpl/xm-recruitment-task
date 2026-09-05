import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SectionHeadingComponent } from './section-heading.component';

describe('SectionHeadingComponent', () => {
  let fixture: ComponentFixture<SectionHeadingComponent>;
  const heading = (): HTMLElement => fixture.nativeElement.querySelector('h2');

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SectionHeadingComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(SectionHeadingComponent);
    fixture.componentRef.setInput('heading', 'Random photostream');
    await fixture.whenStable();
  });

  it('renders the heading text in a level two heading', () => {
    expect(heading().textContent).toContain('Random photostream');
  });

  it('omits the hint when none is given', () => {
    expect(fixture.nativeElement.querySelector('.ui-section-heading__hint')).toBeNull();
  });

  it('renders the hint when one is given', async () => {
    fixture.componentRef.setInput('hint', 'tap a photo to save it to favorites');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.ui-section-heading__hint').textContent)
      .toContain('tap a photo to save it to favorites');
  });

  it('applies the id so a section can be labelled by it', async () => {
    fixture.componentRef.setInput('headingId', 'stream-heading');
    await fixture.whenStable();
    expect(heading().id).toBe('stream-heading');
  });
});
