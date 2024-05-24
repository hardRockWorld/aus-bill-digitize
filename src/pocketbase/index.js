// import the pocketbase js library
import PocketBase from "pocketbase";

// Init the PocketBase instance with the correct URL.
// By setting this in a .env file you can easily switch between development and production environments
const pb = new PocketBase(import.meta.env.VITE_POCKETBASE_URL);

export default pb;
