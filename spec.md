# Specification

## Summary
**Goal:** Fix broken media display across all media components by replacing failing image/video sources with reliable multi-platform alternatives and removing all YouTube dependencies.

**Planned changes:**
- Fix ImageGenerator component to display generated images visibly using multiple public image platforms (e.g., Unsplash, Picsum, Pexels) with fallback behavior if one source fails
- Fix VideoGenerator component to render videos as inline playable `<video>` elements using direct MP4 URLs from at least two alternative platforms (e.g., Mixkit, Pexels Videos), removing all YouTube URLs
- Fix PhotoGallery component (grid and lightbox views) to render all photos visibly using a multi-platform fallback approach (primary source with fallback to e.g., Picsum)
- Fix VideoGallery component to render all videos as inline playable `<video>` elements using direct MP4 sources from at least two alternative platforms, removing all YouTube URLs
- Fix SearchPage photo tab to display image search results using multiple image platforms with fallback behavior
- Fix SearchPage video tab to display video search results as inline `<video>` elements using two alternative non-YouTube platforms (e.g., Pexels API and Mixkit)

**User-visible outcome:** All images and videos throughout the app (generator, gallery, search, and chat) render visibly without broken icons or question mark placeholders, and all videos play inline without requiring YouTube.
