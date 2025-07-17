// Import necessary modules from Next.js server environment
import { NextRequest, NextResponse } from 'next/server';

// Export dynamic = 'force-dynamic' to ensure this route is not cached
// and executes dynamically on each request.
export const dynamic = 'force-dynamic';

/**
 * Handles POST requests for file uploads.
 * This API route acts as a proxy, forwarding the client's FormData
 * request to a backend API.
 * @param req The NextRequest object containing the incoming request details.
 * @returns A NextResponse object with the backend's response or an error.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Parse the incoming FormData from the client request.
    // `req.formData()` asynchronously reads the multipart/form-data body
    // and makes it accessible as a FormData object.
    const formData = await req.formData();

    // 2. Create a new FormData object.
    // This new FormData object will be used to construct the request
    // that is sent to the actual backend API.
    const backendFormData = new FormData();

    // 3. Iterate over all entries (key-value pairs) in the received FormData
    // and append them to the new backendFormData.
    // This ensures that all files and form fields are correctly transferred.
    // FormData.append() can directly handle File objects.
    for (const [key, value] of formData.entries()) {
      backendFormData.append(key, value);
    }

    // 4. Forward the newly constructed FormData to the backend API.
    // IMPORTANT: When sending a FormData object as the body, DO NOT manually
    // set the 'Content-Type' header. The `fetch` API will automatically
    // set the correct 'multipart/form-data' with the boundary string.
    const backendRes = await fetch('http://localhost:8000/api/platform/media/upload', {
      method: 'POST', // Use the POST method for the backend request
      body: backendFormData, // Use the new FormData object as the body
      // No custom headers are needed here for FormData, `fetch` handles it.
    });

    // 5. Read the backend response body as text.
    // Reading as text first is safer, especially for error responses,
    // as the backend might not always send valid JSON on error.
    const backendResponseBody = await backendRes.text();

    // Log the backend's response for debugging purposes.
    console.log(`Backend responded with status: ${backendRes.status}`);
    console.log(`Backend response body: ${backendResponseBody}`);
    console.log(`Backend response headers:`, Object.fromEntries(backendRes.headers.entries()));

    // 6. Attempt to parse the backend response body as JSON.
    // This assumes the backend is expected to return JSON, even for errors.
    let responseJson;
    try {
      responseJson = JSON.parse(backendResponseBody);
    } catch (e) {
      // If JSON parsing fails, it means the backend's response was not valid JSON.
      // This often happens if the backend sends an HTML error page or plain text.
      console.error('Failed to parse backend response as JSON:', e);
      // Return a generic JSON error to the client, providing context.
      return new NextResponse(JSON.stringify({
        error: 'Backend returned non-JSON response or invalid JSON. See server logs for details.',
        backendStatus: backendRes.status,
        backendMessagePreview: backendResponseBody.substring(0, 200) // Truncate for brevity
      }), {
        // If the backend was technically "OK" (e.g., 200) but sent invalid JSON,
        // we should still report an error to the client as a 500 for our proxy.
        status: backendRes.status === 200 ? 500 : backendRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 7. Return the parsed JSON data from the backend to the client.
    // The status and content-type headers from the backend are preserved.
    return new NextResponse(JSON.stringify(responseJson), {
      status: backendRes.status,
      headers: {
        // Use the backend's Content-Type header, defaulting to application/json
        'Content-Type': backendRes.headers.get('content-type') || 'application/json',
      },
    });

  } catch (error) {
    // Catch any unexpected errors that occur within this Next.js API route itself.
    // This includes issues like formData parsing failure, network errors, etc.
    console.error('Error processing request in Next.js API route:', error);
    // Return a generic internal server error response to the client in JSON format.
    return new NextResponse(JSON.stringify({
      error: 'Internal server error in Next.js API route.',
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500, // Indicate an internal server error
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Keep bodyParser: false in the config.
// This is crucial because we are manually parsing the incoming request body
// using `req.formData()`. If bodyParser were true, Next.js would attempt
// to parse the body before our code, which could interfere with `formData()`.
export const config = {
  api: {
    bodyParser: false,
  },
};
