require('./util');

var Clay = require('vendor/clay');
var clayConfig = require('./clay-config');
var clay = new Clay(clayConfig, null, { autoHandleEvents: false });

Pebble.addEventListener('showConfiguration', function() {
  Pebble.openURL(clay.generateUrl());
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (!e || !e.response) { return; }
  var settings = clay.getSettings(e.response, false);
  var apiKey = settings.apiKey && typeof settings.apiKey === 'object' ? settings.apiKey.value : settings.apiKey;
  localStorage.setItem('apiKey', apiKey);
});

var UI = require('ui');
var Vibe = require('ui/vibe');
//var Accel = require('ui/accel');

var Futar = require('./futar');
var moment = require('vendor/moment');

function fillStopMenuWith(stopMenu, stops, alerts) {
  var now = moment();
  var stopsIndex = 0;
  var alertsIndex = 1;

  var stopTitles = stops.map(function(stop) {
    return { title: stop.name.withFixedAccents(),
             subtitle: Math.round(stop.distance) + 'm' };
  });

  var alertTitles = alerts.map(function(alert) {
    return { title: alert.routes.join(', '),
             subtitle: alert.header.withFixedAccents() };
  });



  stopMenu.section(stopsIndex, { title: 'Stops nearby (' + stops.length + ')',
                                 items: stopTitles });

  if (alerts.length > 0) {
    stopMenu.section(alertsIndex, { title: 'Alerts nearby (' + alerts.length + ')',
                                    items: alertTitles });
  }

  stopMenu.on('select', function(event) {
    if (event.sectionIndex == stopsIndex) {
      var stop = stops[event.itemIndex];

      var departures = stop.departures.map(function(departure) {
        var arrival = moment.unix(departure.arrivalTime);
        var duration = moment.duration(arrival.diff(now));
        var vehicle = (departure.route.shortName || departure.route.longName).padStart(3);
        var minutes = Math.round(duration.asMinutes());
        var arrivalText = minutes <= 0 ? 'NOW' : minutes + "'";
        var numOfSpaces = 18 - vehicle.length - arrivalText.length;
        var title = vehicle + ' '.repeat(numOfSpaces) + arrivalText;
        var subtitle = '> ' + departure.headsign;

        return {
          title: title.withFixedAccents(),
          subtitle: subtitle.withFixedAccents(),
          backgroundColor: '#' + departure.route.color,
          textColor: '#' + departure.route.textColor,
          icon: 'images/' + departure.route.type + '.png'
        };
      });

      var departuresMenu = new UI.Menu();
      departuresMenu.section(1, {
        title: stop.name.withFixedAccents(),
        items: departures }
      );

      departuresMenu.show();
    }

    if (event.sectionIndex == alertsIndex) {
      var alert = alerts[event.itemIndex];
      var alertCard = new UI.Card({
        title: alert.routes.join(', '),
        subtitle: moment.unix(alert.from).format('L') + ' - ' + moment.unix(alert.until).format('L'),
        body: alert.description.replace(/<\/?[^>]+(>|$)/g, "").withFixedAccents(),
        scrollable: true
      });
      alertCard.show();
    }
  });
}

function loadStops(splashScreen, stopMenu, errorScreen) {
  splashScreen.show();
  stopMenu.hide();

  navigator.geolocation.getCurrentPosition(
    function (pos) {
      console.log('SRV: Location: ' + pos.coords.latitude + ', ' +  pos.coords.longitude);

      // HUN coordinate for cloudpebble testing
      // pos = { coords: {
      //   latitude: 47.4924430302,
      //   longitude: 19.0527914555
      // }};

      Futar.fetchStops(pos.coords.latitude, pos.coords.longitude, function(resp) {
        var stops = resp.stops;
        var alerts = resp.alerts;

        if (stops.length > 0) {
          fillStopMenuWith(stopMenu, stops, alerts);
          stopMenu.show();
        } else {
          errorScreen.show();
        }

        splashScreen.hide();
        Vibe.vibrate('double');
      });
    },
    function (err) {
        console.warn('SRV: Location error (' + err.code + '): ' + err.message);

        //data.body = err.message;
        errorScreen.show();
        splashScreen.hide();
    },
    {
      'timeout': 10000,
      'maximumAge': 0,
      'enableHighAccuracy': true
    }
  );
}

// ---

var splashScreen = new UI.Card({ title: 'working hard',
                                 subtitle: '...loading stuff...' });
var errorScreen = new UI.Card({ title: '🙀🙀🙀🙀🙀🙀',
                                body: 'there are no BKV vehicles nearby (for at least an hour)',
                                titleColor: 'white',
                                subtitleColor: 'white',
                                bodyColor: 'white',
                                backgroundColor: 'dark-candy-apple-red' });
var stopMenu = new UI.Menu();

// Accel.on('tap', function() {
//   loadStops(splashScreen, stopMenu);
// });

loadStops(splashScreen, stopMenu, errorScreen);
