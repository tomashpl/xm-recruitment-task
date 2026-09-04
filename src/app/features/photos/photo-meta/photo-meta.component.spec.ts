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

  it('renders nothing while the author is unknown', () => {
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('renders the author when known', async () => {
    fixture.componentRef.setInput('author', 'Alejandro Escamilla');
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Alejandro Escamilla');
  });
});
