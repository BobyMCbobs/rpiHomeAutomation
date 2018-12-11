// rpiHomeAutomation - rha.js

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

var theData;

function idise(text) {
  return `rhaButton_${text.replace(/\s+/g, '').toLowerCase()}`;
}

function sendToggle(pin, type, sendType, id) {
  $.post("./", JSON.stringify({type: type, sendType: sendType, id: id}), function(result) {
    console.log(result);
  });
  setTimeout(() => {
    console.log("Reloading data");
    loadButtons();
  }, 750);
}

function loadButtons() {
  $.getJSON('./data.json', (fetchedData) => {
    $(".buttonContent").html("");
    var buttons = "";
    theData = fetchedData;
    fetchedData.map(item => {
      var styling = "",
      classes = "";
      if (item.type === 'toggle') styling = `background-color: ${item.state === 1 ? 'green' : 'red'}`;
      if (item.type === 'oneshot') classes = `${item.type === 'oneshot' ? 'itemButtons_oneshot' : ''}`;
	    buttons += `<button id="${idise(item.name)}" class="itemButtons ${classes}" onclick="sendToggle(${item.pin}, '${item.type}', 'buttonAction', '${item.id}')" style="${styling}">${item.name}</button></br>`;
    });
    $(".buttonContent").html(buttons);
  });
}

loadButtons();
