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

const findBoundary = (data, boundary) => {
  const candidates = [];
  const found = []
  data.forEach((byte, i) => {
    if (byte === boundary[0]) {
      candidates.push(i);
    }
  });
  candidates.forEach((candidate) => {
    if (data.slice(candidate, candidate + boundary.length).every((byte, i) => byte === boundary[i])) {
      found.push(candidate)
    }
  });
  return found
}


const image = document.getElementById("img");
const fps = document.getElementById("fps");

const updateImage = async () => {
  const response = await fetch("https://nicksrouter.ddns.net:80/video", {
    method: "GET",
  });
  const reader = response.body.getReader();

  boundary = [13, 10, 45, 45, 102, 114, 97, 109, 101, 13, 10, 67, 111, 110, 116, 101, 110, 116, 45, 84, 121, 112, 101, 58, 32, 105, 109, 97, 103, 101, 47, 106, 112, 101, 103, 13, 10]

  let start = performance.now();
  let chunks = [];
  let doLog = true;

  while (true) {
    const { value, done } = await reader.read();

    if (value) {
      // concatenate chunks into one array
      chunks = chunks.concat(Array.from(value));

      // find the boundaries in the accumulated chunks
      const boundaries = findBoundary(chunks, boundary)

      // if (boundaries.length > 2) console.log(">2 boundaries")

      // if there are at least two of them, it means we have at least one complete frame
      if (boundaries.length >= 2) {
        const img = chunks.slice(boundaries[0] + boundary.length, boundaries[1])
        const bytes = Uint8Array.from(img)
        const framesPerSecond = Math.round(1000 / (performance.now() - start));
        if (framesPerSecond < 30) {
          image.src = URL.createObjectURL(new Blob([bytes]));

          fps.innerText = `fps: ${framesPerSecond}`;
          start = performance.now();
        }
        // leave only the last chunk, which is incomplete
        chunks = chunks.slice(boundaries[boundaries.length - 1])
      }
    }

    if (done) break;
  }
};

updateImage();
