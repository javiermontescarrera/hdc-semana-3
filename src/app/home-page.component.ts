import { Component, input } from '@angular/core';
import { BalanceSectionComponent } from './balance-section.component';
import { FeaturesSectionComponent } from './features-section.component';
import { TransactionsSectionComponent } from './transactions-section.component';

@Component({
  selector: 'bob-home-page',
  standalone: true,
  imports: [
    BalanceSectionComponent,
    TransactionsSectionComponent,
    FeaturesSectionComponent,
  ],
  template: `
    <div style="display: flex; flex-grow: grow bg-white bg-opacity-5">
      <bob-balance-section [network]="this.network()"></bob-balance-section>
      <bob-transactions-section
        [network]="this.network()"
      ></bob-transactions-section>
    </div>
    <bob-features-section></bob-features-section>
  `,
})
export class HomePageComponent {
  readonly network = input<string>('mainnet-beta');
}
