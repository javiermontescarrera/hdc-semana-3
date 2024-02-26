import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { computedAsync } from 'ngxtension/computed-async';
import { FeaturesSectionComponent } from './features-section.component';
import { ShyftApiService } from './shyft-api.service';
import { TransferModalComponent } from './transfer-modal.component';

@Component({
  selector: 'bob-balance-section',
  standalone: true,
  imports: [
    FeaturesSectionComponent,
    MatCard,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    ReactiveFormsModule,
  ],
  template: `
    <section class="px-24 py-32">
      <mat-card class="w-[400px] example-card">
        <!-- <p class="w-full text-center text-3xl">Banlance</p> -->
        <h2 class="text-center text-3xl mb-4">Balances</h2>
        @if (allTokens()) {
          <div
            class="w-full mb-4 top-4 left-4 flex justify-center items-center gap-2"
          >
            <mat-form-field class="w-full">
              <mat-label>Asset</mat-label>
              <mat-select [formControl]="selectedItem">
                @for (token of allTokens(); track token) {
                  <mat-option [value]="token">
                    <div class="flex items-center gap-2">
                      <img
                        [src]="token.info.image"
                        class="rounded-full w-8 h-8"
                      />
                      <span>
                        {{ token.info.symbol }}
                      </span>
                    </div>
                  </mat-option>
                }
              </mat-select>
            </mat-form-field>
          </div>
        }

        @if (selectedToken) {
          <div class="w-full items-center text-center">
            <div
              class="rounded-full flex justify-center items-center gap-2 mb-4"
            >
              <img
                [src]="selectedToken.info.image"
                class="rounded-full w-14 h-14"
              />
              <p class="text-3xl font-bold">{{ selectedToken.info.name }}</p>
            </div>
            <p class="text-2xl font-bold mb-4">
              Saldo: {{ selectedToken.balance }}
            </p>

            <footer class="flex justify-center gap-4 mb-4">
              <button mat-raised-button color="primary" (click)="onTransfer()">
                Transferir
              </button>
            </footer>
          </div>
        }
      </mat-card>
    </section>
  `,
})
// export class BalanceSectionComponent implements OnInit {
export class BalanceSectionComponent {
  private readonly _matDialog = inject(MatDialog);

  private readonly _shyftApiService = inject(ShyftApiService);
  private readonly _network = 'mainnet-beta';
  // private readonly _network = 'devnet';
  private readonly _walletStore = inject(WalletStore);
  private readonly _publicKey = toSignal(this._walletStore.publicKey$);

  selectedItem = new FormControl();

  selectedToken:
    | {
        address: string;
        balance: number;
        info: {
          decimals: number;
          name: string;
          symbol: string;
          image: string;
        };
      }
    | undefined;

  readonly allTokens = computedAsync(
    () =>
      this._shyftApiService.getAllTokens(
        this._publicKey()?.toBase58(),
        this._network,
      ),
    { requireSync: true },
  );

  constructor() {}

  ngOnInit() {
    this.selectedItem.valueChanges.subscribe((selectedValue) => {
      this.selectedToken = selectedValue;
    });
  }

  onTransfer() {
    this._matDialog.open(TransferModalComponent, { data: this.selectedToken });
  }
}
