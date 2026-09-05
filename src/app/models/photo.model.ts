export interface Photo {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
  readonly author: string;
  readonly width: number;
  readonly height: number;
  readonly downloadUrl: string;
}
