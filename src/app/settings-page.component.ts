import { Component } from '@angular/core';
import { FeaturesSectionComponent } from './features-section.component';

@Component({
  selector: 'bob-settings-page',
  template: `
    <h2>Settings</h2>
    <bob-features-section></bob-features-section>
  `,
  standalone: true,
  imports: [FeaturesSectionComponent],
})
export class SettingsPageComponent {}
