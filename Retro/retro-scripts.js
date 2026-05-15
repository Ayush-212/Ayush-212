const boatCanvas = document.getElementById('boatCanvas');
const boatCtx = boatCanvas.getContext('2d');

let time = 0;
const A = 25;
const B = 0.03;
const manX = 400;

function drawSinkingMan() {
    boatCtx.clearRect(0, 0, boatCanvas.width, boatCanvas.height);

    boatCtx.beginPath();
    boatCtx.strokeStyle = '#5c3a21';
    boatCtx.lineWidth = 2;
    for (let x = 0; x <= boatCanvas.width; x++) {
        let y = boatCanvas.height / 2 + A * Math.sin(B * x + time);
        if (x === 0) boatCtx.moveTo(x, y);
        else boatCtx.lineTo(x, y);
    }
    boatCtx.stroke();

    let waveY = boatCanvas.height / 2 + A * Math.sin(B * manX + time);

    let bobbing = Math.sin(time * 3) * 4;
    let pivotY = waveY + 10 + bobbing;

    boatCtx.save();

    boatCtx.beginPath();
    boatCtx.moveTo(0, 0);
    for (let x = 0; x <= boatCanvas.width; x++) {
        let y = boatCanvas.height / 2 + A * Math.sin(B * x + time);
        if (x === 0) boatCtx.moveTo(x, y);
        else boatCtx.lineTo(x, y);
    }
    boatCtx.lineTo(boatCanvas.width, 0);
    boatCtx.lineTo(0, 0);
    boatCtx.closePath();
    boatCtx.clip();

    boatCtx.translate(manX, pivotY);
    boatCtx.rotate(Math.PI / 4);

    boatCtx.fillStyle = '#000000';
    const p = 1.5;

    boatCtx.fillRect(-2 * p, -9 * p, 4 * p, 4 * p);

    boatCtx.fillRect(-2 * p, -4 * p, 4 * p, 7 * p);

    boatCtx.fillRect(-6 * p, -4 * p, 4 * p, 2 * p);
    boatCtx.fillRect(-8 * p, -8 * p, 2 * p, 6 * p);

    boatCtx.fillRect(2 * p, -2 * p, 5 * p, 2 * p);

    boatCtx.fillRect(-2 * p, 3 * p, 2 * p, 4 * p);
    boatCtx.fillRect(-6 * p, 5 * p, 4 * p, 2 * p);

    boatCtx.fillRect(0, 3 * p, 2 * p, 6 * p);

    boatCtx.restore();

    time -= 0.05;
    requestAnimationFrame(drawSinkingMan);
}
drawSinkingMan();

const elevatorCanvas = document.getElementById('elevatorCanvas');
const elCtx = elevatorCanvas.getContext('2d');
const floorBtns = document.querySelectorAll('.floor-btn');

let elCurrentFloor = 1;
let elTargetFloor = 1;
let elY = 205;
let elScore = 0;
let elGameOver = false;
let elGameStarted = false;
let elBullets = [];
let elFrameCount = 0;
let elAnimationId;

function getFloorY(floor) {
    return 250 - (floor * 50) + 5;
}

floorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetFloor = parseInt(btn.dataset.floor);
        elTargetFloor = targetFloor;
        floorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

elevatorCanvas.addEventListener('click', (e) => {
    if (!elGameStarted || elGameOver) {
        elGameStarted = true;
        elScore = 0;
        elBullets = [];
        elFrameCount = 0;
        elGameOver = false;
        updateElevatorGame();
        return;
    }
    const rect = elevatorCanvas.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    let clickedFloor = 5 - Math.floor(clickY / 50);
    if (clickedFloor < 1) clickedFloor = 1;
    if (clickedFloor > 5) clickedFloor = 5;
    const btn = Array.from(floorBtns).find(b => parseInt(b.dataset.floor) === clickedFloor);
    if (btn) btn.click();
});

function spawnBullets() {

    const safeLane = Math.floor(Math.random() * 5) + 1;
    for (let floor = 1; floor <= 5; floor++) {
        if (floor !== safeLane) {
            elBullets.push({
                x: elevatorCanvas.width,
                y: getFloorY(floor) + 15,
                width: 25,
                height: 10,
                speed: 6 + (elScore * 0.3)
            });
        }
    }
}

function drawElevatorInitialScreen() {
    elCtx.fillStyle = '#ffffff';
    elCtx.clearRect(0, 0, elevatorCanvas.width, elevatorCanvas.height);

    elCtx.fillStyle = '#000000';
    elCtx.font = '18px "Press Start 2P"';
    elCtx.fillText("CLICK HERE TO PLAY", 110, 130);
}

function updateElevatorGame() {
    if (!elGameStarted) {
        drawElevatorInitialScreen();
        return;
    }

    if (elGameOver) {
        elCtx.fillStyle = 'rgba(252, 251, 249, 0.8)';
        elCtx.fillRect(0, 0, elevatorCanvas.width, elevatorCanvas.height);
        elCtx.fillStyle = '#8b5a2b';
        elCtx.font = '28px "Press Start 2P"';
        elCtx.fillText("SYSTEM FAILURE", 130, 110);
        elCtx.font = '14px "Press Start 2P"';
        elCtx.fillText(`WAVES: ${elScore}`, 240, 150);
        elCtx.fillText("Click Here to Restart", 140, 190);
        return;
    }

    elCtx.clearRect(0, 0, elevatorCanvas.width, elevatorCanvas.height);

    elCtx.strokeStyle = 'rgba(92, 58, 33, 0.15)';
    elCtx.lineWidth = 2;
    elCtx.beginPath();
    for (let i = 1; i < 5; i++) {
        elCtx.moveTo(0, i * 50);
        elCtx.lineTo(elevatorCanvas.width, i * 50);
    }
    elCtx.stroke();

    elCtx.fillStyle = 'rgba(92, 58, 33, 0.6)';
    elCtx.font = '16px "Press Start 2P"';
    for (let floor = 1; floor <= 5; floor++) {
        let yPos = getFloorY(floor) + 28;
        elCtx.fillText(floor.toString(), 5, yPos);
    }

    let targetY = getFloorY(elTargetFloor);
    if (Math.abs(elY - targetY) > 2) {
        elY += (targetY - elY) * 0.15;
    } else {
        elY = targetY;
        elCurrentFloor = elTargetFloor;
    }

    const elX = 20;
    const elSize = 40;

    elCtx.strokeStyle = '#8b5a2b';
    elCtx.lineWidth = 3;
    elCtx.strokeRect(elX, elY, elSize, elSize);
    elCtx.fillStyle = '#e0dcd3';
    elCtx.fillRect(elX, elY, elSize, elSize);

    elCtx.strokeStyle = '#000000';
    elCtx.lineWidth = 2;
    elCtx.beginPath();

    elCtx.arc(elX + 20, elY + 12, 5, 0, Math.PI * 2);

    elCtx.moveTo(elX + 20, elY + 17);
    elCtx.lineTo(elX + 20, elY + 28);

    elCtx.moveTo(elX + 12, elY + 22);
    elCtx.lineTo(elX + 28, elY + 22);

    elCtx.moveTo(elX + 20, elY + 28);
    elCtx.lineTo(elX + 14, elY + 36);
    elCtx.moveTo(elX + 20, elY + 28);
    elCtx.lineTo(elX + 26, elY + 36);
    elCtx.stroke();

    if (elFrameCount % 80 === 0) {
        spawnBullets();
        if (elFrameCount > 0) {
            elScore++;
        }
    }

    for (let i = 0; i < elBullets.length; i++) {
        let b = elBullets[i];
        b.x -= b.speed;

        elCtx.fillStyle = '#ff0000';
        elCtx.fillRect(b.x, b.y, b.width, b.height);

        if (b.x < elX + elSize && b.x + b.width > elX &&
            b.y < elY + elSize && b.y + b.height > elY) {

            let leeway = 4;
            if (b.x + leeway < elX + elSize && b.x + b.width - leeway > elX &&
                b.y + leeway < elY + elSize && b.y + b.height - leeway > elY) {
                elGameOver = true;
            }
        }
    }

    while (elBullets.length > 0 && elBullets[0].x < -50) {
        elBullets.shift();
    }

    elCtx.fillStyle = '#000000';
    elCtx.font = '12px "Press Start 2P"';
    elCtx.fillText(`WAVES: ${elScore}`, 450, 30);

    elFrameCount++;
    elAnimationId = requestAnimationFrame(updateElevatorGame);
}

drawElevatorInitialScreen();

document.addEventListener('keydown', (e) => {
    const keyMap = {
        '1': '1', 'Digit1': '1', 'Numpad1': '1',
        '2': '2', 'Digit2': '2', 'Numpad2': '2',
        '3': '3', 'Digit3': '3', 'Numpad3': '3',
        '4': '4', 'Digit4': '4', 'Numpad4': '4',
        '5': '5', 'Digit5': '5', 'Numpad5': '5'
    };

    const mappedFloor = keyMap[e.key] || keyMap[e.code];
    if (mappedFloor) {
        e.preventDefault();
        const btn = document.querySelector(`.floor-btn[data-floor="${mappedFloor}"]`);
        if (btn) {
            btn.click();
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    requestAnimationFrame(() => {

        document.documentElement.classList.add('page-loaded');
    }, 180);
});

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('header, .panel, footer').forEach(el => {
    observer.observe(el);
});