import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { CreateMessageRequest } from '../../models/message.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-message-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './message-form.component.html',
  styleUrl: './message-form.component.css',
})
export class MessageFormComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly messageForm = this.formBuilder.nonNullable.group(
    {
      title: ['', [Validators.required, Validators.maxLength(120), trimmedRequiredValidator()]],
      content: ['', [Validators.required, trimmedRequiredValidator()]],
      senderUserId: [0, [Validators.required, Validators.min(1)]],
      receiverUserId: [0, [Validators.required, Validators.min(1)]],
    },
    { validators: [differentUsersValidator()] },
  );

  @Input() isSubmitting = false;
  @Input() senderUserId = 0;
  @Input() receiverUserId = 0;
  @Input() availableRecipients: User[] = [];
  @Output() messageSubmit = new EventEmitter<CreateMessageRequest>();

  protected get titleControl() {
    return this.messageForm.controls.title;
  }

  protected get contentControl() {
    return this.messageForm.controls.content;
  }

  protected get receiverControl() {
    return this.messageForm.controls.receiverUserId;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['senderUserId']) {
      this.messageForm.controls.senderUserId.setValue(this.senderUserId);
    }

    if (changes['receiverUserId']) {
      this.messageForm.controls.receiverUserId.setValue(this.receiverUserId);
    }
  }

  protected submit(): void {
    if (this.messageForm.invalid) {
      this.messageForm.markAllAsTouched();
      return;
    }

    const { title, content, senderUserId, receiverUserId } = this.messageForm.getRawValue();

    this.messageSubmit.emit({
      title: title.trim(),
      content: content.trim(),
      senderUserId,
      receiverUserId,
    });

    this.messageForm.reset({
      title: '',
      content: '',
      senderUserId,
      receiverUserId: 0,
    });
  }
}

function differentUsersValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const senderUserId = Number(control.get('senderUserId')?.value);
    const receiverUserId = Number(control.get('receiverUserId')?.value);

    if (senderUserId > 0 && receiverUserId > 0 && senderUserId === receiverUserId) {
      return { sameUser: true };
    }

    return null;
  };
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
