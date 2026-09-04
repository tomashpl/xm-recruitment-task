import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-photo-stream-page',
  template: '<h2>Photos</h2>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoStreamPageComponent {}
