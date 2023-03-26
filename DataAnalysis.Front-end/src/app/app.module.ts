import { AuthenticationService } from './platform/services/authentication.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';

import { TransactionService } from './modules/transaction-module/services/transaction.service';
import { TransactionModule } from './modules/transaction-module/transaction.module';
import { AppRouting } from './app.routing';
import { AuthenticationModule } from './platform/authentication/authentication.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { NavigationEffects } from './store/navigation-state/navigation.effects';
import * as fromAppStore from './store/app-state.reducer';
import { AuthenticationEffects } from './platform/authentication/effects/authentication.effects';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRouting,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    TransactionModule,
    AuthenticationModule,
    StoreModule.forRoot(fromAppStore.appReducer),
    EffectsModule.forRoot([NavigationEffects, AuthenticationEffects]),
    StoreRouterConnectingModule.forRoot(),
    ToastModule,
  ],
  bootstrap: [AppComponent],
  providers: [TransactionService, AuthenticationService, MessageService],
})
export class AppModule {}
