import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoMetaComponent } from './photo-meta.component';

describe('PhotoMetaComponent', () => {
  let fixture: ComponentFixture<PhotoMetaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoMetaComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoMetaComponent);
    await fixture.whenStable();
  });

  it('renders nothing while neither author nor download url is known', () => {
    expect(fixture.nativeElement.textContent.trim()).toBe('');
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('renders the author when known', async () => {
    fixture.componentRef.setInput('author', 'Alejandro Escamilla');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Alejandro Escamilla');
  });

  it('renders a safe external download link when known', async () => {
    fixture.componentRef.setInput('downloadUrl', 'https://picsum.photos/id/1/5616/3744');
    await fixture.whenStable();
    const anchor: HTMLAnchorElement = fixture.nativeElement.querySelector('a');
    expect(anchor.getAttribute('href')).toBe('https://picsum.photos/id/1/5616/3744');
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toBe('noopener noreferrer');
  });
});
