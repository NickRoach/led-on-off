const on = document.getElementById("on")
const off = document.getElementById("off")

const handleOn = () => {
  fetch("https://nicksrouter.ddns.net:80/led/on", {
    method: "POST",
  })
}

const handleOff = () => {
  fetch("https://nicksrouter.ddns.net:80/led/off", {
    method: "POST",
  })
}

on.onclick = handleOn
off.onclick = handleOff


const image = document.getElementById("img")
const fps = document.getElementById("fps")


const findBoundary = (data, boundary) => {
  const found = []
  data.forEach((byte, i) => {
    if (byte === boundary[0] && data.slice(i, i + boundary.length).every((byte, i) => byte === boundary[i])) {
      found.push(i)
    }
  })
  return found
}


const updateImage = async () => {
  const response = await fetch("https://nicksrouter.ddns.net:80/video", {
    method: "GET",
  })
  const reader = response.body.getReader()

  boundary = [
    13, 10, 45, 45, 102, 114, 97, 109, 101, 13, 10, 67, 111,
    110, 116, 101, 110, 116, 45, 84, 121, 112, 101, 58, 32,
    105, 109, 97, 103, 101, 47, 106, 112, 101, 103, 13, 10
  ]

  let start = performance.now()
  let chunks = []

  while (true) {
    const { value } = await reader.read()

    if (value) {
      // concatenate chunks into one array
      chunks = chunks.concat(Array.from(value))

      // find the boundaries in the accumulated chunks
      const boundaries = findBoundary(chunks, boundary)

      // if there are at least two of them, it means we have at least one complete frame
      if (boundaries.length >= 2) {
        const frame = chunks.slice(boundaries[0] + boundary.length, boundaries[1])
        const frameBytes = Uint8Array.from(frame)
        image.src = URL.createObjectURL(new Blob([frameBytes]))
        // leave only the last chunk, which is incomplete. If there was another whole chunk, it is deleted
        chunks = chunks.slice(boundaries[boundaries.length - 1])

        fps.innerText = `fps: ${Math.round(1000 / (performance.now() - start))}`
        start = performance.now()
      }
    }
  }
}

updateImage()