import { HttpClientModule } from '@angular/common/http';
import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToastNotificationComponent } from './platform/toast-notifications/toast-notification.component';
import { SpinnerComponent } from './shared/components/spinner/spinner.component';

@Component({
  selector: 'p-root',
  imports: [
    RouterModule,
    SpinnerComponent,
    ToastNotificationComponent,
    HttpClientModule,
  ],
  providers: [],
  template: `
    <p-spinner />
    <p-toast />
    <router-outlet />
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor() {
    // Apply the saved or system theme before routed content is rendered.
    inject(ThemeService);
  }
}
