import { Component, OnInit, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAnchor } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { RouterModule } from '@angular/router';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';
import { computedAsync } from 'ngxtension/computed-async';
import { HomePageComponent } from './home-page.component';
import { ShyftApiService } from './shyft-api.service';

@Component({
  standalone: true,
  selector: 'demo-root',
  template: `
    <header class="py-7">
      @if (account()) {
        <div
          class="absolute top-4 eft-4 flex justify-center items-center gap-2"
        >
          <img [src]="account()?.info?.image" class="w-8 h-8" />
          <p class="text-xl">{{ account()?.balance }}</p>
        </div>

        <div class="flex justify-center absolute top-16 right-4">
          <mat-form-field class="w-full">
            <mat-label>Red</mat-label>
            <mat-select [formControl]="selectedItem" [value]="'mainnet-beta'">
              <mat-option [value]="'mainnet-beta'">Mainnet</mat-option>
              <mat-option [value]="'devnet'">Devnet</mat-option>
              <mat-option [value]="'testnet'">Testnet</mat-option>
            </mat-select>
          </mat-form-field>
        </div>
      }

      <div class="flex justify-center absolute top-4 right-4">
        <hd-wallet-multi-button></hd-wallet-multi-button>
      </div>

      <h1 class="text-3xl text-center mb-2">Hola, soy Javier.</h1>

      <!-- <nav>
        <ul class="top-4 left-4 flex justify-center items-center gap-2">
          <li>
            <a [routerLink]="['']" mat-raised-button>Home</a>
          </li>
          <li>
            <a [routerLink]="['settings']" mat-raised-button>Settings</a>
          </li>
        </ul>
      </nav> -->
    </header>

    <main>
      <!-- <router-outlet></router-outlet> -->
      <bob-home-page [network]="this.network"></bob-home-page>
    </main>
  `,
  imports: [
    RouterModule,
    HdWalletMultiButtonComponent,
    MatAnchor,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    HomePageComponent,
  ],
})
export class AppComponent implements OnInit {
  private readonly _shyftApiService = inject(ShyftApiService);
  private readonly _connectionStore = inject(ConnectionStore);
  network = 'mainnet-beta';
  private readonly _walletStore = inject(WalletStore);
  private readonly _publicKey = toSignal(this._walletStore.publicKey$);
  private readonly _mint = 'So11111111111111111111111111111111111111112'; // Wrapped SOL
  // private readonly _mint = '7F7nH8tSRXDJPt5FQcwTbnAx6eRBUvqFmejDnGsXEHn4'; // My token (devnet)
  // private readonly _mint = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC
  // private readonly _mint = '7EYnhQoR9YM3N7UoaKRoA44Uy8JeaZV3qyouov87awMs'; // Silly Dragon

  selectedItem = new FormControl();

  readonly account = computedAsync(
    () =>
      this._shyftApiService.getAccount(
        this._publicKey()?.toBase58(),
        this.network,
        this._mint,
      ),
    { requireSync: true },
  );

  ngOnInit() {
    this._connectionStore.setEndpoint(this._shyftApiService.getEndpoint());

    this.selectedItem.setValue(this.network);

    this.selectedItem.valueChanges.subscribe((selectedValue) => {
      this.network = selectedValue;
      // console.log(`Network: ${this.network}`);
    });
  }
}
