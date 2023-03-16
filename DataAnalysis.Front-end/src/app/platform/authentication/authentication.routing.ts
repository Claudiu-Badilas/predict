import { ModuleWithProviders } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationModule } from './authentication.module';
import { LoginRegisterComponent } from './login-register/login-register.component';

const routes: Routes = [
  {
    path: 'authentication',
    component: LoginRegisterComponent,
    children: [
      {
        path: ':auth-type',
        component: LoginRegisterComponent,
        data: {
          gtmPageViewPathTitle: 'authentication',
        },
      },
    ],
  },
];

export const AuthenticationRoutingModule: ModuleWithProviders<AuthenticationModule> =
  RouterModule.forChild(routes);
