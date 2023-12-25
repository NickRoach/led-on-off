const on = document.getElementById("on");
const off = document.getElementById("off");

const handleOn = () => {
  fetch("https://nicksrouter.ddns.net:80/led/on", {
    method: "POST",
  });
};

const handleOff = () => {
  fetch("https://nicksrouter.ddns.net:80/led/off", {
    method: "POST",
  });
};

on.onclick = handleOn;
off.onclick = handleOff;

const image = document.getElementById("img");
const fps = document.getElementById("fps");

const updateImage = async () => {
  const response = await fetch("https://nicksrouter.ddns.net:80/video", {
    method: "GET",
  });
  const reader = response.body.getReader();
  let start = performance.now();
  while (true) {
    const { value, done } = await reader.read();
    image.src = URL.createObjectURL(new Blob([value]));
    fps.innerText = Math.round(1000 / (performance.now() - start));
    start = performance.now();
    if (done) break;
  }
};

updateImage();
