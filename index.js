const http = require('http'),
  PouchDB = require('pouchdb'),
  db = new PouchDB('rha'),
  fs = require('fs');
  Gpio = require('pigpio').Gpio;

var dbData = {}

function writeUserConfig(data) {
  // write config user's config to database
  data._id = data.id;
	db.put(data, function callback(err, result) {
		if (!err) {
			console.log('[DATA] Successfully wrote:', data.name);
		}
		else console.log('[DATA] error:', err)
	});
}

function readUserConfig() {
  // read user's config from database
  return db.allDocs({
    include_docs: true,
    attachments: true
  }).then(function (result) {
    var data = [];
    result.rows.map(i => {
      data = [...data, i.doc];
    });
    return data;
  }).catch(function (err) {
    console.log(err);
  });
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

function togglePin(pin, mode = "OUTPUT") {
  // switch pin to opposite state
  var pin = new Gpio(pin, {
    mode: Gpio[mode]
  });
  var pinState = pin.digitalRead();
  console.log(`[PINTOGGLE] Toggling #${pin.gpio} from ${pinStateToEnglish(pinState)} to ${pinStateToEnglish(pinState === 0 ? 1 : 0)}`);
  pin.digitalWrite(pinState === 0 ? 1 : 0);
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
  dbData = {
    buttons: []
  }
  readUserConfig().then(data => {
    for (button in data) {
      dbData.buttons[button] = data[button];
      dbData.buttons[button].state = getPinState(dbData.buttons[button].pin);
    }
  });
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
      res.write(JSON.stringify(dbData));
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
		      togglePin(result.pin);
		      if (result.type === 'oneshot') {
		        togglePin(result.pin);
		      }
		      loadPinsState();
		    break;
		  }
		});
  }
}).listen(3100);

console.log("[WEBSERV] Listening on port 3100");
