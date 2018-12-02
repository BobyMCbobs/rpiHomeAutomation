var theData;

function idise(text) {
  return `rhaButton_${text.replace(/\s+/g, '').toLowerCase()}`;
}

function sendToggle(pin, type, sendType, id) {
  $.post("./", JSON.stringify({pin: pin, type: type, sendType: sendType, id: id}), function(result) {
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
