const button = document.getElementById("generate-button");
const memeText = document.getElementById("meme-text");
const memeImage = document.getElementById("meme-image");

button.addEventListener("click", generateMeme);

const searchTerms = [
  "y2k",
"cyberspace",
"cyberpunk",
"limewire",
"dial-up",
"geocities",
"myspace",
"napster",
"winamp",
"ICQ",
"AOL",
"MSN messenger",
"internet cafe",
"cybercafe",
"webcam",
"web portal",
"chatroom",
"message board",
"computer virus",
"malware",
"spam email",
"popup window",
"screensaver",
"desktop computer",
"CRT monitor",
"flip phone",
"PDA",
"pager",
"MP3 player",
"CD-ROM",
"floppy disk",
"dial-up modem",
"ethernet",
"server room",
"computer network",
"cell tower",
"satellite dish",
"fiber optic",
"circuit board",
"computer cables",
"telecommunications",
"information superhighway",
"World Wide Web",
"virtual reality",
"virtual world",
"digital culture",
"cyberculture",
"technoculture",
"digital revolution",
"dot-com",
"hacker",
"computer graphics",
"3D graphics",
"wireframe",
"cybernetic",
"biometrics",
"surveillance",
"GPS",
"Bluetooth",
"infrared",
"robotics"
];



function generateMeme() {

  // Get text
  fetch("https://corporatebs-generator.sameerkumar.website/?" + Date.now())
    .then(response => response.json())
    .then(data => {
      memeText.textContent = data.phrase;
    });

  // Get image
  const search =
  searchTerms[Math.floor(Math.random() * searchTerms.length)];

  fetch(
  "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=" +
  encodeURIComponent(search) +
  "&gsrnamespace=6&gsrlimit=20&prop=imageinfo&iiprop=url&format=json&origin=*"
)
  .then(response => response.json())
  .then(data => {
    const images = Object.values(data.query.pages);
    const randomImage =
      images[Math.floor(Math.random() * images.length)];

    memeImage.src = randomImage.imageinfo[0].url;
  });
}