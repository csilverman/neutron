export default {
  layout: "layouts/post.njk",
  eleventyComputed: {
    newerPost: (data) => {
      const posts = data.collections?.posts;
      if (!posts || posts.length === 0) return null;
      
      const currentIndex = posts.findIndex(post => post.url === data.page.url);
      if (currentIndex === -1 || currentIndex === 0) return null;
      
      return posts[currentIndex - 1];
    },
    olderPost: (data) => {
      const posts = data.collections?.posts;
      if (!posts || posts.length === 0) return null;
      
      const currentIndex = posts.findIndex(post => post.url === data.page.url);
      if (currentIndex === -1 || currentIndex === posts.length - 1) return null;
      
      return posts[currentIndex + 1];
    }
  }
};