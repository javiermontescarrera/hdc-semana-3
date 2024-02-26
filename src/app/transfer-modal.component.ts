import { Component, Inject, computed, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { createTransferInstructions } from '@heavy-duty/spl-utils';
import {
  injectPublicKey,
  injectTransactionSender,
} from '@heavy-duty/wallet-adapter';
import { ShyftApiService } from './shyft-api.service';
import {
  TransferFormComponent,
  TransferFormPayload,
} from './transfer-form.component';

@Component({
  selector: 'bob-transfer-modal',
  template: `
    <div class="px-4 pb-8 pt-16">
      <h2 class="text-3xl text-center mb-8 font-bold">Transferir Fondos</h2>

      @if (this.data && this.data.balance !== null) {
        <bob-transfer-form
          [disabled]="isRunning()"
          [tokenAddress]="this.data.address"
          [tokenName]="this.data.info?.name ?? ''"
          [tokenSymbol]="this.data.info?.symbol ?? ''"
          [tokenImage]="this.data.info?.image ?? ''"
          [tokenBalance]="this.data.balance"
          [tokenDecimals]="this.data.info?.decimals ?? 9"
          (sendTransfer)="onSendTransfer($event)"
          (cancelTransfer)="onCancelTransfer()"
        ></bob-transfer-form>
      }
      @if (isRunning()) {
        <div
          class="absolute w-full h-full top-0 left-0 bg-black bg-opacity-50 flex flex-col justify-center items-center gap-4"
        >
          <mat-progress-spinner
            color="primary"
            mode="indeterminate"
            diameter="64"
          ></mat-progress-spinner>
          <p class="capitalize text-xl">{{ transactionStatus() }}...</p>
        </div>
      }
    </div>
  `,
  standalone: true,
  imports: [MatProgressSpinner, TransferFormComponent],
})
export class TransferModalComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: {
      address: string;
      balance: number | 0;
      info: {
        decimals: number | 9;
        name: string;
        symbol: string;
        image: string;
      } | null;
    },
  ) {}
  ngOnInit(): void {
    // The 'data' keeps the information sent from the calling component
    console.log('Selected token: ', this.data);
  }

  private readonly _matDialogRef = inject(MatDialogRef);
  private readonly _matSnackBar = inject(MatSnackBar);
  private readonly _transactionSender = injectTransactionSender();
  private readonly _publicKey = injectPublicKey();
  private readonly _shyftApiService = inject(ShyftApiService);

  readonly transactionStatus = computed(() => this._transactionSender().status);
  readonly isRunning = computed(
    () =>
      this.transactionStatus() === 'sending' ||
      this.transactionStatus() === 'confirming' ||
      this.transactionStatus() === 'finalizing',
  );

  onSendTransfer(payload: TransferFormPayload) {
    this._matDialogRef.disableClose = true;
    console.log(`payload: ${JSON.stringify(payload)} \n`);

    this._transactionSender
      .send(({ publicKey }) =>
        createTransferInstructions({
          amount: payload.amount,
          mintAddress: payload.mintAddress,
          receiverAddress: payload.receiver,
          senderAddress: publicKey.toBase58(),
          memo: payload.memo,
          fundReceiver: true,
        }),
      )
      .subscribe({
        next: (signature) => {
          console.log(
            `🎉 Transacción enviada satisfactoriamente. Ver explorador: https://explorer.solana.com/tx/${signature}`,
          );
          this._matSnackBar.open(
            '🎉 Transacción enviada satisfactoriamente.',
            'Cerrar',
            {
              duration: 4000,
              horizontalPosition: 'end',
            },
          );
          this._matDialogRef.close();
        },
        error: (error) => {
          console.error(error);
          this._matSnackBar.open(
            '🚨 Hubo un error enviando transacción.',
            'Cerrar',
            {
              duration: 4000,
              horizontalPosition: 'end',
            },
          );
        },
        complete: () => (this._matDialogRef.disableClose = false),
      });
  }

  onCancelTransfer() {
    this._matDialogRef.close();
  }
}
