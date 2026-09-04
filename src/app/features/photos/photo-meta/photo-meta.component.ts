import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-photo-meta',
  templateUrl: './photo-meta.component.html',
  styleUrl: './photo-meta.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PhotoMetaComponent {
  readonly author = input<string | undefined>(undefined);
}
