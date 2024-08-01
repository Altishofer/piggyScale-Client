import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { ScaleComponent } from './app/scale/scale.component';

bootstrapApplication(ScaleComponent, appConfig)
  .catch((err) => console.error(err));
