export interface Photo {
  readonly id: string;
  readonly url: string;
  readonly alt: string;
  readonly author?: string;
  readonly downloadUrl?: string;
}
