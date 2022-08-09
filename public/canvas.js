const canvas = document.querySelector("#signature");
const hiddenField = document.querySelector('input[type="hidden"]');

let canvasLeft = canvas.offsetLeft;
let canvasTop = canvas.offsetTop;

var isMoving = false;

document.querySelector("canvas").addEventListener("mousemove", draw);
document
    .querySelector("canvas")
    .addEventListener("mousedown", function (event) {
        setPosition(event);

        isMoving = true;
    });
document.querySelector("canvas").addEventListener("mouseenter", setPosition);
document.querySelector("canvas").addEventListener("mouseup", function () {
    isMoving = false;
});

let pos = { x: 0, y: 0 };

const ctx = canvas.getContext("2d");

function setPosition(event) {
    pos.x = event.clientX - canvasLeft;
    pos.y = event.clientY - canvasTop;
}

function draw(event) {
    if (isMoving === true) {
        ctx.beginPath();

        ctx.lineWidth = 7;
        ctx.lineCap = "round";
        ctx.strokeStyle = "#FDCB6E";

        ctx.moveTo(pos.x, pos.y);

        setPosition(event);
        ctx.lineTo(pos.x, pos.y);

        ctx.stroke();
        ctx.closePath();

        hiddenField.value = canvas.toDataURL();
    }
}

(function () {
    document
        .querySelector("#deletesignature")
        .addEventListener("submit", function (event) {
            if (!confirm("Do you really want to?")) {
                event.preventDefault();
            }
        });
});
