import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-photo-detail-page',
  template: '<h2>Photo</h2>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoDetailPageComponent {}
