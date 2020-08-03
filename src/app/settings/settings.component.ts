import { Component, OnInit } from '@angular/core';
import { TimelineManager } from '../timeline';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  value = 2;

  constructor(
    private timeline: TimelineManager
  ) { }

  ngOnInit() {
  }

  onChange(value: number) {
    this.value = value;
    this.timeline.range = value;
  }

  formatRange(value: number) {
    return value + 'H';
  }

}
