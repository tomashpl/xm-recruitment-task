import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-photo-grid',
  templateUrl: './photo-grid.component.html',
  styleUrl: './photo-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoGridComponent {}
