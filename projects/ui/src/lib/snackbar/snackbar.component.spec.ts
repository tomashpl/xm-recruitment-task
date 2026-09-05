import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

import { SnackbarComponent, SnackbarData } from './snackbar.component';

describe('SnackbarComponent', () => {
  const dismissWithAction = jasmine.createSpy('dismissWithAction');

  const render = async (data: SnackbarData) => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SnackbarComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MAT_SNACK_BAR_DATA, useValue: data },
        { provide: MatSnackBarRef, useValue: { dismissWithAction } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(SnackbarComponent);
    await fixture.whenStable();
    return fixture;
  };

  beforeEach(() => dismissWithAction.calls.reset());

  it('renders the message from the injected data', async () => {
    const fixture = await render({ message: 'Added to favorites' });
    expect(fixture.nativeElement.textContent).toContain('Added to favorites');
  });

  it('falls back to a dismiss action label', async () => {
    const fixture = await render({ message: 'Added to favorites' });
    expect(fixture.nativeElement.querySelector('button').textContent.trim()).toBe('Dismiss');
  });

  it('renders a custom action label', async () => {
    const fixture = await render({ message: 'Added to favorites', actionLabel: 'Undo' });
    expect(fixture.nativeElement.querySelector('button').textContent.trim()).toBe('Undo');
  });

  it('dismisses with an action when the action button is pressed', async () => {
    const fixture = await render({ message: 'Added to favorites', actionLabel: 'Undo' });
    fixture.nativeElement.querySelector('button').click();
    expect(dismissWithAction).toHaveBeenCalledTimes(1);
  });
});
