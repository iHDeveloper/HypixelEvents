import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule, SETTINGS as FirestoreSettingsToken} from '@angular/fire/firestore';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';

import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { environment } from 'src/environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { SettingsComponent } from './settings/settings.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    SettingsComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule.enablePersistence(),
    AngularFireAnalyticsModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatIconModule,
    MatBottomSheetModule
  ],
  providers: [
    {
      provide: FirestoreSettingsToken,
      useValue: environment.firebase.emulator
    }
  ],
  bootstrap: [AppComponent],
  entryComponents: [SettingsComponent]
})
export class AppModule { }
