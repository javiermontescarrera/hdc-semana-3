import { Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface TransferFormModel {
  memo: string | null;
  receiver: string | null;
  amount: number | null;
  mintAddress: string | null;
}

export interface TransferFormPayload {
  memo: string;
  receiver: string;
  amount: number;
  mintAddress: string;
}

@Component({
  selector: 'bob-transfer-form',
  template: `
    <form class="w-[400px]" #form="ngForm" (ngSubmit)="onSubmit(form)">
      <div class="w-full items-center text-center">
        <div class="flex justify-center items-center gap-2 mb-4">
          <img [src]="this.tokenImage()" class="rounded-full w-16 h-16" />
          <p class="text-2xl font-bold">{{ this.tokenSymbol() }}</p>
        </div>
      </div>

      <mat-form-field appearance="fill" class="w-full mb-4">
        <mat-label>Concepto</mat-label>
        <input
          name="memo"
          matInput
          type="text"
          placeholder="Ejemplo: Pagar el recibo de electricidad."
          [(ngModel)]="model.memo"
          #memoControl="ngModel"
          required
          [disabled]="disabled()"
        />
        <mat-icon matSuffix>description</mat-icon>

        @if (form.submitted && memoControl.errors) {
          <mat-error>
            @if (memoControl.errors['required']) {
              El motivo es obligatorio.
            }
          </mat-error>
        } @else {
          <mat-hint>Debe ser el motivo de la transferencia.</mat-hint>
        }
      </mat-form-field>

      <mat-form-field appearance="fill" class="w-full mb-4">
        <mat-label>Destinatario</mat-label>
        <input
          name="receiver"
          matInput
          type="text"
          placeholder="Public Key de la cuenta destinatario."
          [(ngModel)]="model.receiver"
          #receiverControl="ngModel"
          required
          [disabled]="disabled()"
        />
        <mat-icon matSuffix>key</mat-icon>

        @if (form.submitted && receiverControl.errors) {
          <mat-error>
            @if (receiverControl.errors['required']) {
              El destino es obligatorio.
            }
          </mat-error>
        } @else {
          <mat-hint>Debe ser el motivo de la transferencia.</mat-hint>
        }
      </mat-form-field>

      <mat-form-field appearance="fill" class="w-full mb-4">
        <mat-label>Monto</mat-label>
        <input
          name="amount"
          matInput
          type="number"
          min="0"
          placeholder="Ingresa el monto acá"
          [(ngModel)]="model.amount"
          #amountControl="ngModel"
          required
          [disabled]="disabled()"
          [max]="tokenBalance().toString()"
        />
        <mat-icon matSuffix>attach_money</mat-icon>

        @if (form.submitted && amountControl.errors) {
          <mat-error>
            @if (amountControl.errors['required']) {
              El monto es obligatorio.
            } @else if (amountControl.errors['min']) {
              El monto debe ser mayor a cero.
            } @else if (amountControl.errors['max']) {
              El monto debe ser menor a {{ tokenBalance().toString() }}.
            }
          </mat-error>
        } @else {
          <mat-hint>Ingresa el monto a enviar.</mat-hint>
        }
      </mat-form-field>

      <footer class="flex justify-center gap-4">
        <button
          type="submit"
          mat-raised-button
          color="primary"
          [disabled]="disabled()"
        >
          Enviar
        </button>
        <button
          type="button"
          mat-raised-button
          color="warn"
          (click)="onCancel()"
          [disabled]="disabled()"
        >
          Cancelar
        </button>
      </footer>
    </form>
  `,
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatFormFieldModule,
    MatSelect,
    MatOption,
    MatInput,
    MatIcon,
  ],
})
export class TransferFormComponent {
  private readonly _matSnackBar = inject(MatSnackBar);

  readonly tokenAddress = input<string>('');
  readonly tokenImage = input<string>('');
  readonly tokenName = input<string>('');
  readonly tokenSymbol = input<string>('');
  readonly tokenDecimals = input<number>(9);
  readonly tokenBalance = input<number>(0);

  readonly disabled = input<boolean>(false);

  model: TransferFormModel = {
    memo: null,
    receiver: null,
    amount: null,
    mintAddress: null,
  };

  @Output() readonly sendTransfer = new EventEmitter<TransferFormPayload>();
  @Output() readonly cancelTransfer = new EventEmitter();

  onSubmit(form: NgForm) {
    console.log('mintAddress:', this.tokenAddress());
    console.log('token name:', this.tokenName());
    console.log('token symbol:', this.tokenSymbol());
    console.log('img:', this.tokenImage());
    console.log('decimals:', Number(this.tokenDecimals()).toString());

    if (
      form.invalid ||
      this.model.memo === null ||
      this.model.receiver === null ||
      this.model.amount === null ||
      this.tokenAddress === null ||
      this.tokenDecimals === null
    ) {
      this._matSnackBar.open('⚠️ El formulario es inválido.', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'end',
      });
    } else {
      this.sendTransfer.emit({
        memo: this.model.memo,
        receiver: this.model.receiver,
        amount: this.model.amount * 10 ** Number(this.tokenDecimals()),
        mintAddress: this.tokenAddress(),
      });
    }
  }

  onCancel() {
    this.cancelTransfer.emit();
  }
}
