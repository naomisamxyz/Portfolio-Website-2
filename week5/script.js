const button = document.getElementById("generate-button");
const saveButton = document.getElementById("save-button");

const memeText = document.getElementById("meme-text");
const memeImage = document.getElementById("meme-image");


// -----------------------------------
// CONNECT TO SUPABASE
// -----------------------------------

const supabaseClient = supabase.createClient(
  "https://uspxokoxzbajirtyhtjv.supabase.co",
  "sb_publishable_QfPcMD4M9fWHFAL5oHRznA_7g7g-v5Y"
);


// -----------------------------------
// BUTTONS
// -----------------------------------

button.addEventListener("click", generateMeme);
saveButton.addEventListener("click", saveMeme);


// -----------------------------------
// SEARCH TERMS
// -----------------------------------

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


// -----------------------------------
// GENERATE MEME
// -----------------------------------

function generateMeme() {

  // Get text
  fetch("https://corporatebs-generator.sameerkumar.website/?" + Date.now())
    .then(response => response.json())
    .then(data => {
      memeText.textContent = data.phrase;
    });


  // Pick random Wikimedia search term
  const search =
    searchTerms[Math.floor(Math.random() * searchTerms.length)];


  // Get image
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


// -----------------------------------
// SAVE MEME TO DATABASE
// -----------------------------------

async function saveMeme() {

  const { error } = await supabaseClient
    .from("memes")
    .insert({
      image_url: memeImage.src,
      meme_text: memeText.textContent
    });

  if (error) {
    console.error("Could not save meme:", error);
  } else {
    console.log("Meme saved!");
  }
}