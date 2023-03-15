import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  UntypedFormGroup,
} from '@angular/forms';
import { CustomValidators } from 'src/app/shared/validators/custom-validator';

@Component({
  selector: 'app-login-register',
  templateUrl: './login-register.component.html',
  styleUrls: ['./login-register.component.scss'],
})
export class LoginRegisterComponent {
  credentialForm: FormGroup;

  constructor(private formBuilder: FormBuilder) {
    this.credentialForm = this.formBuilder.group({
      email: new FormControl(null, [CustomValidators.email]),
      password: new FormControl(null, [CustomValidators.minLength(4)]),
    });
  }

  onSubmitChanges(form: UntypedFormGroup) {
    console.log('invalid', form.get('email').invalid);
    console.log('pristine', !form.get('email').pristine);
    console.log('dirty', form.get('email').dirty);
  }
}
