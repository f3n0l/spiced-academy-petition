const hiddenField = document.querySelector('input[name="signature"]');

function draw( ){

...

hiddenField.value = canvas.toDataURL();
}
