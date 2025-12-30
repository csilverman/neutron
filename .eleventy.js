import { DateTime } from "luxon";
import Image from "@11ty/eleventy-img";

export default function (eleventyConfig) {
  // Copy-through
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/images": "images" }); // originals (optional)


  eleventyConfig.configureErrorReporting({ allowMissingExtensions: true });

  // Date filters
  eleventyConfig.addFilter("isoDate", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" }).toISODate()
  );
  eleventyConfig.addFilter("readableDate", (dateObj) =>
    DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("LLL dd, yyyy")
  );

  // URL-safe strings (tags, etc.)
  eleventyConfig.addFilter("url", (value) => encodeURIComponent(value));

  // Year for footer (avoid Nunjucks `new Date()` parsing issue)
  eleventyConfig.addGlobalData("year", () => new Date().getFullYear());

  // Responsive image shortcode: {% image "src/images/foo.jpg", "Alt", "sizes" %}
  eleventyConfig.addNunjucksAsyncShortcode(
    "image",
    async function imageShortcode(
      src,
      alt,
      sizes = "(min-width: 800px) 800px, 100vw"
    ) {
      if (!alt) throw new Error(`Missing \`alt\` on image: ${src}`);

      let metadata = await Image(src, {
        widths: [320, 640, 960, 1280],
        formats: ["avif", "webp", "jpeg"],
        urlPath: "/img/",
        outputDir: "./_site/img/",
        cacheOptions: {
          duration: "30d",
          directory: ".cache/eleventy-img",
        },
      });

      return Image.generateHTML(metadata, {
        alt,
        sizes,
        loading: "lazy",
        decoding: "async",
      });
    }
  );

  // Gallery image shortcode for lightbox: {% galleryImage src, alt, index, sizes %}
  eleventyConfig.addNunjucksAsyncShortcode(
    "galleryImage",
    async function galleryImageShortcode(
      src,
      alt,
      index,
      sizes = "(min-width: 900px) 900px, 100vw"
    ) {
      if (!alt) throw new Error(`Missing \`alt\` on image: ${src}`);

      let metadata = await Image(src, {
        widths: [320, 640, 960, 1280],
        formats: ["webp", "jpeg"],
        urlPath: "/img/",
        outputDir: "./_site/img/",
        cacheOptions: { duration: "30d", directory: ".cache/eleventy-img" },
      });

      const jpegLargest = metadata.jpeg[metadata.jpeg.length - 1];
      const html = Image.generateHTML(metadata, {
        alt,
        sizes,
        loading: "lazy",
        decoding: "async",
      });

      return `
        <button class="lb-thumb" type="button"
          data-lightbox-src="${jpegLargest.url}"
          data-lightbox-alt="${String(alt).replaceAll('"', "&quot;")}"
          data-lightbox-index="${index}">
          ${html}
        </button>
      `;
    }
  );

  // Collections
  eleventyConfig.addCollection("posts", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/posts/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => b.date - a.date);
  });

  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const ignore = new Set(["all", "nav", "post", "posts", "tagList"]);
    const tags = new Set();

    for (const item of collectionApi.getAll()) {
      const itemTags = item.data?.tags;
      if (!itemTags) continue;

      for (const t of itemTags) {
        if (!ignore.has(t)) tags.add(t);
      }
    }

    return [...tags].sort((a, b) => a.localeCompare(b));
  });


  // Create concrete pages for /tags/<tag>/page/N/
  // Each entry becomes one rendered page via pagination in tag-page.njk
  eleventyConfig.addCollection("tagPages", (collectionApi) => {
    const pageSize = 12;
  
    const ignore = new Set(["all", "nav", "post", "posts", "tagList", "tagPages"]);
    const tags = new Set();
  
    for (const item of collectionApi.getAll()) {
      const itemTags = item.data?.tags;
      if (!itemTags) continue;
      for (const t of itemTags) {
        if (!ignore.has(t)) tags.add(t);
      }
    }
  
    const out = [];
    for (const tag of [...tags].sort((a, b) => a.localeCompare(b))) {
      const posts = collectionApi.getFilteredByTag(tag).reverse(); // newest first
      const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  
      for (let pageNumber = 0; pageNumber < totalPages; pageNumber++) {
        out.push({ tag, pageNumber, pageSize });
      }
    }
    return out;
  });


  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}