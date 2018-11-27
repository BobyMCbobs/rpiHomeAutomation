const http = require('http'),
  PouchDB = require('pouchdb'),
  db = new PouchDB('rha'),
  fs = require('fs');
  Gpio = require('pigpio').Gpio;

function togglePin(pin, mode = "OUTPUT") {
  var pin = new Gpio(pin, {
    mode: Gpio[mode]
  });
  var pinState = pin.digitalRead();
  pin.digitalWrite(pinState === 0 ? 1 : 0);
}

function collectRequestData(request, callback) {
	const FORM_URLENCODED = 'application/x-www-form-urlencoded';
	if (request.headers['content-type'] === FORM_URLENCODED) {
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

http.createServer((req, res) => {
  if (req.method === 'GET') {
    console.log(`File ${req.url} requested`);
    if (req.url == '/') {
      res.write(fs.readFileSync('./assets/html/index.html','utf8'));
      res.end();
    }
    else if (req.url == '/data.json') {
      res.write(JSON.stringify(
      {
        "buttons": [{
          "name": "Bed Lamp",
          "description": "Toggle my bed lamp",
          "pin": "2",
          "id": "RANDOMSTR1",
          "mode": "OUTPUT",
          "type": "toggle",
          "state": true
        },
        {
          "name": "Computer",
          "description": "Switch on my computer",
          "pin": "11",
          "id": "RANDOMSTR2",
          "mode": "OUTPUT",
          "type": "oneshot",
          "state": false
        }]
      }
      ));
      res.end();
    }
    else if (req.url.split('/')[1] === "assets" && fs.existsSync(`.${req.url}`) === true && fs.lstatSync(`.${req.url}`).isFile()) {
      console.log(`Sending file .${req.url}`);
      res.write(fs.readFileSync(`.${req.url}`,'utf8'));
      res.end();
    }
  }
  else if (req.method === "POST") {
    collectRequestData(req, result => {
		  //result = String(result.slice(9));
		  console.log(result)
		});
  }
}).listen(3100);

console.log("Listening on port 3100");
