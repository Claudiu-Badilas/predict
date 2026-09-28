import { HttpClientModule } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { ToastNotificationComponent } from './core/toast-notifications/toast-notification.component';
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
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  readonly updateAvailable = signal(false);

  private currentVersion: string | null = null;
  private versionCheckTimer?: ReturnType<typeof setInterval>;

  constructor() {
    // Apply the saved or system theme before routed content is rendered.
    inject(ThemeService);
  }

  ngOnInit(): void {
    void this.checkForUpdate(true);
    this.versionCheckTimer = setInterval(() => {
      void this.checkForUpdate();
    }, 60_000);
  }

  ngOnDestroy(): void {
    if (this.versionCheckTimer) {
      clearInterval(this.versionCheckTimer);
    }
  }

  reloadForUpdate(): void {
    window.location.reload();
  }

  private async checkForUpdate(initialize = false): Promise<void> {
    try {
      const versionUrl = new URL('version.json', document.baseURI);
      versionUrl.searchParams.set('check', Date.now().toString());
      const response = await fetch(versionUrl, { cache: 'no-store' });

      if (!response.ok) return;

      const deployedVersion = (await response.json())?.version;
      if (typeof deployedVersion !== 'string' || deployedVersion.length === 0) {
        return;
      }

      if (initialize || this.currentVersion === null) {
        this.currentVersion = deployedVersion;
        return;
      }

      if (deployedVersion !== this.currentVersion) {
        this.updateAvailable.set(true);
      }
    } catch {
      // Version checks are best-effort; the app remains usable if offline.
    }
  }
}
