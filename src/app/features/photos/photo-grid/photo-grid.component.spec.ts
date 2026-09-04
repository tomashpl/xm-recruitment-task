import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoGridComponent } from './photo-grid.component';

@Component({
  imports: [PhotoGridComponent],
  template: `
    <app-photo-grid>
      <li class="cell">one</li>
      <li class="cell">two</li>
    </app-photo-grid>
  `,
})
class HostComponent {}

describe('PhotoGridComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
  });

  it('exposes an explicit list role that survives the list-style reset', () => {
    expect(fixture.nativeElement.querySelector('ul').getAttribute('role')).toBe('list');
  });

  it('projects its cells into the list', () => {
    const list: HTMLElement = fixture.nativeElement.querySelector('ul');
    expect(list.querySelectorAll('.cell').length).toBe(2);
  });

  it('lays the cells out as a grid', () => {
    const list: HTMLElement = fixture.nativeElement.querySelector('ul');
    expect(getComputedStyle(list).display).toBe('grid');
  });
});
