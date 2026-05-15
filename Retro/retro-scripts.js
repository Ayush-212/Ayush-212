// --- SINKING MAN SINE WAVE ANIMATION ---
const boatCanvas = document.getElementById('boatCanvas');
const boatCtx = boatCanvas.getContext('2d');

let time = 0;
const A = 25; // Amplitude
const B = 0.03; // Frequency
const manX = 400; // Fixed at center of canvas (800 / 2)

function drawSinkingMan() {
    boatCtx.clearRect(0, 0, boatCanvas.width, boatCanvas.height);

    // Calculate Wave
    boatCtx.beginPath();
    boatCtx.strokeStyle = '#5c3a21'; // Brown wave
    boatCtx.lineWidth = 2;
    for (let x = 0; x <= boatCanvas.width; x++) {
        let y = boatCanvas.height / 2 + A * Math.sin(B * x + time);
        if (x === 0) boatCtx.moveTo(x, y);
        else boatCtx.lineTo(x, y);
    }
    boatCtx.stroke();

    // Sinking Man
    let waveY = boatCanvas.height / 2 + A * Math.sin(B * manX + time);

    // Little movement in Y (bobbing)
    let bobbing = Math.sin(time * 3) * 4;
    let pivotY = waveY + 10 + bobbing; // Center of body slightly below wave

    boatCtx.save();

    // Clip region: anything drawn after this will only appear ABOVE the wave
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

    // Draw Man
    boatCtx.translate(manX, pivotY);
    boatCtx.rotate(Math.PI / 4); // Angled falling backward (clockwise)

    boatCtx.fillStyle = '#000000';
    const p = 1.5; // Even smaller pixel block size

    // Draw pixelated falling guy (based on slipping symbol)
    // Head
    boatCtx.fillRect(-2 * p, -9 * p, 4 * p, 4 * p);

    // Torso
    boatCtx.fillRect(-2 * p, -4 * p, 4 * p, 7 * p);

    // Left Arm (reaching up/forward to stay above wave)
    boatCtx.fillRect(-6 * p, -4 * p, 4 * p, 2 * p); // shoulder
    boatCtx.fillRect(-8 * p, -8 * p, 2 * p, 6 * p); // forearm reaching high

    // Right Arm (flailing back)
    boatCtx.fillRect(2 * p, -2 * p, 5 * p, 2 * p);

    // Left leg (bent up)
    boatCtx.fillRect(-2 * p, 3 * p, 2 * p, 4 * p);
    boatCtx.fillRect(-6 * p, 5 * p, 4 * p, 2 * p);

    // Right leg (straight down)
    boatCtx.fillRect(0, 3 * p, 2 * p, 6 * p);

    boatCtx.restore();

    time -= 0.05; // Move wave to the left
    requestAnimationFrame(drawSinkingMan);
}
drawSinkingMan();


// --- ELEVATOR SURVIVAL GAME ---
const elevatorCanvas = document.getElementById('elevatorCanvas');
const elCtx = elevatorCanvas.getContext('2d');
const floorBtns = document.querySelectorAll('.floor-btn');

let elCurrentFloor = 1;
let elTargetFloor = 1;
let elY = 205; // 250 - 50 + 5
let elScore = 0;
let elGameOver = false;
let elGameStarted = false;
let elBullets = [];
let elFrameCount = 0;
let elAnimationId;

// Map floor to Y position (floor 1 is bottom, floor 5 is top)
function getFloorY(floor) {
    return 250 - (floor * 50) + 5;
}

// Handle Floor Buttons
floorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetFloor = parseInt(btn.dataset.floor);
        elTargetFloor = targetFloor;
        floorBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Handle Canvas Clicks (clicking the "tile" or lane)
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
    // Choose 1 safe lane
    const safeLane = Math.floor(Math.random() * 5) + 1; // 1 to 5
    for (let floor = 1; floor <= 5; floor++) {
        if (floor !== safeLane) {
            elBullets.push({
                x: elevatorCanvas.width,
                y: getFloorY(floor) + 15, // center of the 40px box
                width: 25,
                height: 10,
                speed: 6 + (elScore * 0.3) // Speed increases slightly with score
            });
        }
    }
}

function drawElevatorInitialScreen() {
    elCtx.fillStyle = '#ffffff'; // Match CSS background if transparent doesn't work, actually it's a gradient in CSS
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

    // Draw Lane Boundaries (Tiles)
    elCtx.strokeStyle = 'rgba(92, 58, 33, 0.15)'; // faint brown
    elCtx.lineWidth = 2;
    elCtx.beginPath();
    for (let i = 1; i < 5; i++) {
        elCtx.moveTo(0, i * 50);
        elCtx.lineTo(elevatorCanvas.width, i * 50);
    }
    elCtx.stroke();

    // Draw Floor Numbers
    elCtx.fillStyle = 'rgba(92, 58, 33, 0.6)';
    elCtx.font = '16px "Press Start 2P"';
    for (let floor = 1; floor <= 5; floor++) {
        let yPos = getFloorY(floor) + 28; // Vertical center of the lane
        elCtx.fillText(floor.toString(), 5, yPos);
    }

    // Smooth movement for elevator
    let targetY = getFloorY(elTargetFloor);
    if (Math.abs(elY - targetY) > 2) {
        elY += (targetY - elY) * 0.15; // ease out
    } else {
        elY = targetY;
        elCurrentFloor = elTargetFloor;
    }

    // Draw Elevator Car
    const elX = 20;
    const elSize = 40;

    // Box
    elCtx.strokeStyle = '#8b5a2b';
    elCtx.lineWidth = 3;
    elCtx.strokeRect(elX, elY, elSize, elSize);
    elCtx.fillStyle = '#e0dcd3';
    elCtx.fillRect(elX, elY, elSize, elSize);

    // Stickman inside
    elCtx.strokeStyle = '#000000';
    elCtx.lineWidth = 2;
    elCtx.beginPath();
    // Head
    elCtx.arc(elX + 20, elY + 12, 5, 0, Math.PI * 2);
    // Body
    elCtx.moveTo(elX + 20, elY + 17);
    elCtx.lineTo(elX + 20, elY + 28);
    // Arms
    elCtx.moveTo(elX + 12, elY + 22);
    elCtx.lineTo(elX + 28, elY + 22);
    // Legs
    elCtx.moveTo(elX + 20, elY + 28);
    elCtx.lineTo(elX + 14, elY + 36);
    elCtx.moveTo(elX + 20, elY + 28);
    elCtx.lineTo(elX + 26, elY + 36);
    elCtx.stroke();

    // Spawning logic (every 80 frames)
    if (elFrameCount % 80 === 0) {
        spawnBullets();
        if (elFrameCount > 0) {
            elScore++; // Survived a wave
        }
    }

    // Update & Draw Bullets
    for (let i = 0; i < elBullets.length; i++) {
        let b = elBullets[i];
        b.x -= b.speed;

        // Draw Laser/Bullet
        elCtx.fillStyle = '#ff0000'; // red laser
        elCtx.fillRect(b.x, b.y, b.width, b.height);

        // Collision
        if (b.x < elX + elSize && b.x + b.width > elX &&
            b.y < elY + elSize && b.y + b.height > elY) {

            let leeway = 4; // Fair hitboxes
            if (b.x + leeway < elX + elSize && b.x + b.width - leeway > elX &&
                b.y + leeway < elY + elSize && b.y + b.height - leeway > elY) {
                elGameOver = true;
            }
        }
    }

    // Remove offscreen
    while (elBullets.length > 0 && elBullets[0].x < -50) {
        elBullets.shift();
    }

    // Draw Score
    elCtx.fillStyle = '#000000';
    elCtx.font = '12px "Press Start 2P"';
    elCtx.fillText(`WAVES: ${elScore}`, 450, 30);

    elFrameCount++;
    elAnimationId = requestAnimationFrame(updateElevatorGame);
}

drawElevatorInitialScreen();

// Handle Keyboard Controls (Numbers 1-5)
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

// Page entrance: add class when DOM is ready to trigger CSS transitions
document.addEventListener('DOMContentLoaded', () => {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
    // ensure canvas drawing starts and the browser has painted once
    requestAnimationFrame(() => {
        // small deliberate pause to let initial paint settle, then trigger staged animations
        setTimeout(() => {
            document.documentElement.classList.add('page-loaded');
        }, 180);
    });

    // Scroll Reveal Animation Logic
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
});
