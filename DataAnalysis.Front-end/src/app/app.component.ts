import { Component } from '@angular/core';

@Component({
    selector: 'app-root',
    template: `
    <app-top-bar></app-top-bar>
    <app-toast></app-toast>
    <router-outlet></router-outlet>
  `,
    styles: [],
    standalone: false
})
export class AppComponent {}
