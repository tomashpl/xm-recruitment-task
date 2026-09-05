import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Photos',
    loadComponent: () =>
      import('./features/photo-stream/photo-stream-page.component').then(
        m => m.PhotoStreamPageComponent,
      ),
  },
  {
    path: 'favorites',
    title: 'Favorites',
    loadComponent: () =>
      import('./features/favorites/favorites-page.component').then(m => m.FavoritesPageComponent),
  },
  {
    path: 'photos/:id',
    title: 'Photo',
    loadComponent: () =>
      import('./features/photo-detail/photo-detail-page.component').then(
        m => m.PhotoDetailPageComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
