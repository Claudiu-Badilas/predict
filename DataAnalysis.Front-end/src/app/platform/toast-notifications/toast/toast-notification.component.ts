import { Component } from '@angular/core';

@Component({
    selector: 'app-toast',
    template: `
    <div class="card">
      <p-toast></p-toast>
    </div>
  `,
    styleUrls: ['./toast-notification.component.scss'],
    standalone: false
})
export class ToastNotificationComponent {}
