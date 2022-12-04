import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Route } from '@angular/router';
import { AppComponent } from './app/app.component';

const appRoutes: Route[] = [];

bootstrapApplication(AppComponent, {
  providers: [provideRouter(appRoutes)],
}).catch((err) => console.log(err));
