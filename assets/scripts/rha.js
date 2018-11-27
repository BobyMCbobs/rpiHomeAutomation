var theData;

function idise(text) {
  return `rhaButton_${text.replace(/\s+/g, '').toLowerCase()}`;
}

function sendToggle(pin) {
  $.post("./", {toggle: pin}, function(result) {
    console.log(result);
  });
}

function loadButtons() {
  $.getJSON('./data.json', (fetchedData) => {
    $(".buttonContent").html("");
    var buttons = "";
    theData = fetchedData;
    theData.buttons.map(item => {
      var styling = "",
      classes = "";
      if (item.type === 'toggle') styling = `background-color: ${item.state === true ? 'green' : 'red'}`;
      if (item.type === 'oneshot') classes = `${item.type === 'oneshot' ? 'itemButtons_oneshot' : ''}`;
      console.log(item, styling)
	    buttons += `<button id="${idise(item.name)}" class="itemButtons ${classes}" onclick="sendToggle(${item.pin}); loadButtons()" style="${styling}">${item.name}</button></br>`;
    });
    $(".buttonContent").html(buttons);
  });
}

loadButtons();
