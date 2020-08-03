import { Component, OnInit } from '@angular/core';
import { TimelineManager } from '../timeline';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  value = 2;

  constructor(
    private timeline: TimelineManager,
    private analytics: AngularFireAnalytics
  ) { }

  ngOnInit() {
  }

  onChange(value: number) {
    this.value = value;
    this.timeline.range = value;
    localStorage.setItem("range", "" + value);

    this.analytics.logEvent('settings', { "range": value } );
  }

  formatRange(value: number) {
    return value + 'H';
  }

  openCredits() {
    this.analytics.logEvent('open', { "credits": true });
  }

}
