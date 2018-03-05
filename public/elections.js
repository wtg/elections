import 'angular';
import 'angular-route';
import 'angular-sanitize';
import 'angular-cookies';
import 'angular-timeago';
import 'showdown';
import 'ng-showdown';

import 'angular/angular-csp.css';

const dependencies = [
    'ngRoute', 'ng-showdown', 'ngCookies', 'yaru22.angular-timeago'
];

export default angular.module('Elections', dependencies);
