import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <app-toast></app-toast>
    <router-outlet></router-outlet>
  `,
  styles: [],
})
export class AppComponent {}
