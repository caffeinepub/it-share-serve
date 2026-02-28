# Specification

## Summary
**Goal:** Fix the Search page to return real internet results and repair the AI image and video generators so they reliably produce real content.

**Planned changes:**
- Rewrite the SearchPage photo tab to fetch 12 images using Unsplash Source URLs (with Picsum as a per-image fallback), replacing any placeholder logic.
- Rewrite the SearchPage video tab to call the Pexels Videos API (using a clearly marked `PEXELS_API_KEY` placeholder constant) and display up to 9 inline playable `<video>` elements; fall back to a curated pool of 40+ keyword-mapped MP4 URLs from Mixkit/Coverr/Pixabay if the API fails.
- Fix the ImageGenerator to use the Pollinations AI image endpoint with a random seed, show a loading spinner, auto-retry up to 3 times with different seeds on failure, and display a clear error message if all retries fail; keep Save and Download functional.
- Fix the VideoGenerator to first attempt the Pollinations AI video endpoint (10-second timeout), fall back to Pexels Videos API on failure, display the result as an inline `<video>` with controls, show a loading spinner, and display an error with a Retry button if both sources fail; keep Save and Share functional.
- Remove all keyword-mapping, hash-based, and random placeholder logic from the affected components.
- Ensure no search results are saved to user profiles or visible to other users.

**User-visible outcome:** Users can search for photos and videos and receive real, query-relevant results; AI image and video generation reliably produce and display actual AI-generated content for any prompt.
