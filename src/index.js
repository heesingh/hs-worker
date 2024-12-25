// This function handles requests from users
export default {
  async fetch(request, env) {
    // Get the URL and path from the request
    const url = new URL(request.url);
    const path = url.pathname;

    // Get some basic info about the user from the request headers
    const email = request.headers.get("Cf-Access-Authenticated-User-Email") || "unknown@example.com";
    const timestamp = new Date().toISOString(); // Get the current time
    const country = request.headers.get("Cf-Ipcountry") || "Unknown"; // Get the user's country

    // If the user visits "/secure", show their info
    if (path === "/secure") {
      const html = `
        <html>
          <body>
            <p>${email} authenticated at ${timestamp} from 
            <a href="/secure/${country}">${country}</a></p>
          </body>
        </html>`;
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    // If the user visits "/secure/COUNTRY", show the flag image
    if (path.startsWith("/secure/")) {
      const countryCode = path.split("/")[2].toLowerCase(); // Get the country code from the path
      const imageName = `${countryCode}.png`; // Create the image file name

      try {
        // Try to get the image from the R2 bucket
        const image = await env.COUNTRY_FLAGS.get(imageName);
        if (!image) {
          // If no image is found, send a "not found" message
          return new Response("Flag not found", { status: 404 });
        }

        // If the image is found, return it
        return new Response(image.body, {
          headers: { "Content-Type": "image/png" }, // Tell the browser it's an image
        });
      } catch (error) {
        // If something goes wrong, send an error message
        return new Response("Something went wrong!", { status: 500 });
      }
    }

    // If the path doesn't match anything, send a "not found" message
    return new Response("Page not found", { status: 404 });
  },
};
