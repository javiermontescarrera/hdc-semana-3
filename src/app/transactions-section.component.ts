import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  MatCard,
  MatCardContent,
  MatCardHeader,
  MatCardTitle,
} from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { computedAsync } from 'ngxtension/computed-async';
import { ShyftApiService } from './shyft-api.service';

@Component({
  selector: 'bob-transactions-section',
  standalone: true,
  imports: [
    MatTableModule,
    MatCard,
    MatCardHeader,
    MatCardTitle,
    MatCardContent,
  ],
  template: `
    <section class="w-full px-24 py-32">
      <mat-card class="w-[500px] example-card">
        <mat-card-header class="w-full">
          <div mat-card-avatar class="example-header-image"></div>
          <!-- <mat-card-title>Historial</mat-card-title> -->
          <p class="w-full text-center text-3xl">Historial de Transacciones</p>
        </mat-card-header>
        <mat-card-content>
          @if (!_publicKey()) {
            <p class="text-center">
              Conecta tu wallet para ver las transacciones.
            </p>
          } @else if (transactions()?.length === 0) {
            <p class="text-center">No hay transacciones disponibles.</p>
          } @else {
            <table
              mat-table
              [dataSource]="transactions() ?? []"
              class="mat-elevation-z8"
            >
              <!-- Type Column -->
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let element">{{ element.type }}</td>
              </ng-container>

              <!-- Timestamp Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let element">
                  {{ element.status }}
                </td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="timestamp">
                <th mat-header-cell *matHeaderCellDef>Timestamp</th>
                <td mat-cell *matCellDef="let element">
                  {{ element.timestamp }}
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </section>
  `,
})
export class TransactionsSectionComponent {
  private readonly _shyftApiService = inject(ShyftApiService);
  private readonly _network = 'mainnet-beta';
  // private readonly _network = 'devnet';
  private readonly _walletStore = inject(WalletStore);
  readonly _publicKey = toSignal(this._walletStore.publicKey$);
  readonly displayedColumns = ['type', 'status', 'timestamp'];

  readonly transactions = computedAsync(() =>
    this._shyftApiService.getTransactions(
      this._publicKey()?.toBase58(),
      this._network,
    ),
  );
}
