import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app.module';
declare var module: any;

require('./styles/main.css');
require('./styles/card.css');
require('./scripts/main.js')
require('./styles/toastr.scss')

if (process.env.NODE_ENV === 'production') {
    enableProdMode();
}

if (module.hot) {
    module.hot.accept();
}

platformBrowserDynamic().bootstrapModule(AppModule);