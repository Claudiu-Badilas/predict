import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from 'src/app/shared/validators/custom-validator';
import { AuthenticationAction } from './models/authentication-actions.enum';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent {
  credentialForm: FormGroup;
  registerMessage = `You do not have an account, start journey with us from`;
  loginMessage = `You already have an account, just log in from`;

  constructor(private formBuilder: FormBuilder) {
    this.credentialForm = this.formBuilder.group({
      authenticationAction: new FormControl(AuthenticationAction.Login),
      authenticationMessage: new FormControl(this.registerMessage),
      email: new FormControl(null, [CustomValidators.email]),
      password: new FormControl(null, [CustomValidators.minLength(4)]),
    });
  }

  isValidateInputValue(inputName: string) {
    return (
      this.credentialForm.get(inputName).invalid &&
      (!this.credentialForm.get(inputName).pristine ||
        this.credentialForm.get(inputName).dirty)
    );
  }

  getInputValidationError(inputName: string) {
    return this.credentialForm.controls[inputName]?.errors['value'];
  }

  getInputValue(inputName: string) {
    return this.credentialForm.controls[inputName]?.value;
  }

  onSubmitChanges(form: FormGroup) {
    console.log('form', form.controls);
  }

  onChangeAuthAction() {
    if (
      this.getInputValue('authenticationAction') === AuthenticationAction.Login
    ) {
      this.credentialForm.addControl(
        'confirmPassword',
        new FormControl(null, [CustomValidators.minLength(4)])
      );
      this.credentialForm.reset();
      this.credentialForm.patchValue({
        ...this.credentialForm,
        authenticationAction: AuthenticationAction.Register,
        authenticationMessage: this.loginMessage,
      });
    } else {
      this.credentialForm.removeControl('confirmPassword');
      this.credentialForm.reset();
      this.credentialForm.patchValue({
        ...this.credentialForm,
        authenticationAction: AuthenticationAction.Login,
        authenticationMessage: this.registerMessage,
      });
    }
  }

  isRegisterFromSelected() {
    return (
      this.getInputValue('authenticationAction') ===
      AuthenticationAction.Register
    );
  }
}
