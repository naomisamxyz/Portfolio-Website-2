// Connect to our shared Supabase database
const supabaseClient = supabase.createClient(
  "https://uspxokoxzbajirtyhtjv.supabase.co",
  "sb_publishable_QfPcMD4M9fWHFAL5oHRznA_7g7g-v5Y"
);

// Find the empty container in our HTML
const memeDatabase = document.getElementById("meme-database");

// Retrieve the memes from the database
async function getMemes() {

    const { data, error } = await supabaseClient
    .from("memes")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Could not retrieve memes:", error);
    return;
  }

  console.log(data);

  // Go through every row returned by the database
data.forEach(meme => {

  // Create a container for one meme
  const memeDiv = document.createElement("div");
  memeDiv.className = "meme";

  // Create the image
  const image = document.createElement("img");
  image.src = meme.image_url;
  image.className = "meme-image";

  // Create the text
  const text = document.createElement("p");
  text.textContent = meme.meme_text;
  text.className = "meme-text";

  // Put image and text inside the meme
  memeDiv.appendChild(image);
  memeDiv.appendChild(text);

  // Put the meme on the page
  memeDatabase.appendChild(memeDiv);

});
}

// Run when the page loads
getMemes();