import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ShyftApiService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _shyftKey = 'VaqDrjcDa7lmeCSF';
  private readonly _header = { 'x-api-key': this._shyftKey };
  private readonly _shyftURL = 'https://rpc.shyft.to';
  private readonly _apiBaseURL = 'https://api.shyft.to/sol/v1';

  getEndpoint() {
    const url = new URL(this._shyftURL);

    url.searchParams.append('api_key', this._shyftKey);

    return url.toString();
  }

  getAccount(
    publicKey: string | undefined | null,
    network: string,
    mint: string,
  ) {
    if (!publicKey) {
      return of(null);
    }

    const url: URL = new URL(this._apiBaseURL + '/wallet/token_balance');
    url.searchParams.append('network', network);
    url.searchParams.append('wallet', publicKey);
    url.searchParams.append('token', mint);

    return this._httpClient
      .get<{
        result: { balance: number; info: { image: string } };
      }>(url.toString(), { headers: this._header })
      .pipe(
        tap((response) => {
          console.log('Account balance:', response.result);
        }),
        map((response) => response.result),
      );
  }

  getTransactions(publicKey: string | undefined | null, network: string) {
    if (!publicKey) {
      return of([]);
    }

    const url: URL = new URL(this._apiBaseURL + '/transaction/history');
    url.searchParams.append('network', network);
    url.searchParams.append('account', publicKey);
    url.searchParams.append('tx_num', '5');

    return this._httpClient
      .get<{
        result: { status: string; type: string; timestamp: string }[];
      }>(url.toString(), { headers: this._header })
      .pipe(
        tap((response) => {
          console.log('Transacciones de la cuenta:', response.result);
        }),
        map((response) => response.result),
      );
  }

  getAllTokens(publicKey: string | undefined | null, network: string) {
    if (!publicKey) {
      return of([]);
    }

    const url: URL = new URL(this._apiBaseURL + '/wallet/all_tokens');
    url.searchParams.append('network', network);
    url.searchParams.append('wallet', publicKey);

    return this._httpClient
      .get<{
        result: {
          address: string;
          balance: number;
          info: {
            decimals: number;
            name: string;
            symbol: string;
            image: string;
          };
        }[];
      }>(url.toString(), { headers: this._header })
      .pipe(
        tap((response) => {
          console.log('Tokens de la wallet:', response.result);
        }),
        map((response) => response.result),
      );
  }
}
