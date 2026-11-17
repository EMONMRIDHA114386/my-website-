
// Website Extra Features

// 1. Digital Clock
const clock = document.createElement("div");
clock.id = "digital-clock";

clock.style.cssText = `
  position: fixed;
  top: 15px;
  right: 15px;
  padding: 10px 16px;
  background: #222;
  color: white;
  border-radius: 12px;
  font-size: 16px;
  font-family: Arial;
  z-index: 9999;
`;

document.body.appendChild(clock);

function updateClock() {
  clock.textContent = new Date().toLocaleTimeString();
}

updateClock();
setInterval(updateClock, 1000);


// 2. Dark / Light Mode
const themeButton = document.createElement("button");

themeButton.textContent = "🌙 Dark Mode";

themeButton.style.cssText = `
  position: fixed;
  top: 65px;
  right: 15px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #444;
  color: white;
  cursor: pointer;
  z-index: 9999;
`;

document.body.appendChild(themeButton);

let darkMode = false;

themeButton.onclick = function() {
  darkMode = !darkMode;

  document.body.style.background =
    darkMode ? "#171717" : "#ffffff";

  document.body.style.color =
    darkMode ? "#ffffff" : "#222222";

  themeButton.textContent =
    darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
};


// 3. Background Color Change
const colorButton = document.createElement("button");

colorButton.textContent = "🎨 Change Color";

colorButton.style.cssText = `
  position: fixed;
  top: 115px;
  right: 15px;
  padding: 12px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  cursor: pointer;
  z-index: 9999;
`;

document.body.appendChild(colorButton);

const colors = [
  "#e8f4ff",
  "#fff0e6",
  "#e9ffe9",
  "#f5e9ff",
  "#fffde7"
];

let colorIndex = 0;

colorButton.onclick = function() {
  document.body.style.background =
    colors[colorIndex];

  darkMode = false;
  themeButton.textContent = "🌙 Dark Mode";
  colorIndex = (colorIndex + 1) % colors.length;
};
<script src="menu.html"></script><body>
