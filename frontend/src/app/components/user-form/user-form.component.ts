import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserStore } from '../../store/user.store';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.css',
})
export class UserFormComponent {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly store = inject(UserStore);
  protected readonly userForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120), trimmedRequiredValidator()]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), trimmedRequiredValidator()]],
  });

  protected get nameControl() {
    return this.userForm.controls.name;
  }

  protected get emailControl() {
    return this.userForm.controls.email;
  }

  protected get passwordControl() {
    return this.userForm.controls.password;
  }

  protected submit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.userForm.getRawValue();

    this.store.createUser({ name: name.trim(), email: email.trim(), password: password.trim() });
    this.userForm.reset({
      name: '',
      email: '',
      password: '',
    });
  }
}

function trimmedRequiredValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    if (typeof value === 'string' && value.trim().length === 0) {
      return { trimmedRequired: true };
    }

    return null;
  };
}
