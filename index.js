// rpiHomeAutomation - index.js

//
// Copyright (C) 2018 Caleb Woodbine <calebwoodbine.public@gmail.com>
//
// This file is part of rpiHomeAutomation.
//
// SafeSurfer-Desktop is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// SafeSurfer-Desktop is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with rpiHomeAutomation.  If not, see <https://www.gnu.org/licenses/>.
//

const http = require('http'),
  fs = require('fs');
  Gpio = require('pigpio').Gpio;

var configFile = './config.json',
  dbData = require(configFile);

function writeUserConfig(data) {
  // write config user's config to database
  fs.writeFileSync(configFile, JSON.stringify(dbData, null, 4));
}

function readUserConfig() {
  // read user's config from database
  return require(configFile);
}

function getPinState(pin) {
  // return the pin's state
  var pin = new Gpio(pin);
  return pinState = pin.digitalRead();
}

function pinStateToEnglish(state) {
  // convert 0 and 1 to low and high
  if (state === 0) return "low";
  else if (state === 1) return "high";
}

function writePin({pin, mode = "OUTPUT", state}) {
  // switch pin to opposite state
  var pin = new Gpio(pin, {
    mode: Gpio[mode]
  });
  console.log(`[PINTOGGLE] Writing pin #${pin.gpio} ${pinStateToEnglish(pinState)}`);
  pin.digitalWrite(state);
}

function togglePin({pin, mode = "OUTPUT", id}) {
  // switch pin to opposite state
  var pin = new Gpio(pin, {
    mode: Gpio[mode]
  });
  var pinState = pin.digitalRead();
  console.log(`[PINTOGGLE] Toggling #${pin.gpio} from ${pinStateToEnglish(pinState)} to ${pinStateToEnglish(pinState === 0 ? 1 : 0)}`);
  pin.digitalWrite(pinState === 0 ? 1 : 0);
  for (i in dbData.buttons) {
    if (dbData.buttons[i].id === id) {
      dbData.buttons[i].pinLastState = pin.digitalRead();
      console.log(`[PINTOGGLE] updated '${dbData.buttons[i].name}' in '${configFile}' with new lastPinState of '${dbData.buttons[i].pinLastState}'`);
      writeUserConfig();
      break;
    }
  }
}

function collectRequestData(request, callback) {
  // parse sent data
	if (request.headers['content-type'].split(';')[0] === 'application/x-www-form-urlencoded') {
		let body = '';
		request.on('data', chunk => {
			body += chunk.toString();
		});
		request.on('end', () => {
			callback(body);
		});
	}
	else {
		callback(null);
	}
}

function loadPinsState(pin) {
  // load pin's states into dbData
  for (button in dbData.buttons) {
      dbData.buttons[button].state = getPinState(dbData.buttons[button].pin);
    }
  console.log("[DBLOAD] data loaded");
}

loadPinsState();

// serve http server
http.createServer((req, res) => {
  if (req.method === 'GET') {
    // if user is requesting data
    console.log(`[WEBSERV] File request <:? ${req.url}`);
    if (req.url == '/') {
      res.write(fs.readFileSync('./assets/html/index.html','utf8'));
      res.end();
    }
    else if (req.url == '/data.json') {
      res.write(JSON.stringify(dbData.buttons));
      res.end();
    }
    else if (req.url.split('/')[1] === "assets" && fs.existsSync(`.${req.url}`) === true && fs.lstatSync(`.${req.url}`).isFile()) {
      console.log(`[WEBSERV] Sending file -:> .${req.url}`);
      res.write(fs.readFileSync(`.${req.url}`,'utf8'));
      res.end();
    }
  }
  else if (req.method === "POST") {
    // if user is sending data
    collectRequestData(req, result => {
		  //result = String(result.slice(9));
		  var result = JSON.parse(result);
		  switch (result.sendType) {
		    case 'buttonAction':
		      console.log(`[PINTOGGLE] Toggling GPIO pin #${result.pin} (Current state: ${pinStateToEnglish(getPinState(result.pin))})`);
		      togglePin({pin: result.pin, id: result.id});
		      if (result.type === 'oneshot') {
		        togglePin({pin: result.pin, id: result.id});
		      }
		      loadPinsState();
		    break;
		  }
		});
  }
}).listen(3100);

console.log("[WEBSERV] Listening on port 3100");
