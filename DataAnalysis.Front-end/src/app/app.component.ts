import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-spinner />
    <app-top-bar />
    <app-toast />
    <router-outlet />
  `,
  styles: [],
  standalone: false,
})
export class AppComponent {}
