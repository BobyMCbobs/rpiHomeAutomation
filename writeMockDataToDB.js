var PouchDB = require('pouchdb'),
  db = new PouchDB('rha');

function writeUserConfig(data) {
  data._id = data.id;
	db.put(data, function callback(err, result) {
		if (!err) {
			console.log('[DATA] Successfully wrote:', data._id);
		}
		else console.log('[DATA] error:', err)
	});
}

var mockData = {
  "buttons": [{
    "name": "Bed Lamp",
    "description": "Toggle my bed lamp",
    "pin": 2,
    "id": "RANDOMSTR1",
    "mode": "OUTPUT",
    "type": "toggle"
  },
  {
    "name": "Computer",
    "description": "Switch on my computer",
    "pin": 11,
    "id": "RANDOMSTR2",
    "mode": "OUTPUT",
    "type": "oneshot"
  }]
}

mockData.buttons.map(i => {
  writeUserConfig(i);
})
