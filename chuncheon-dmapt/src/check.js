import 'dotenv/config';
import { BoardScraper } from './scraper.js';
import { PostStorage } from './storage.js';
import { Mailer } from './mailer.js';

const TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes timeout

export async function checkForNewPosts() {
  console.log('='.repeat(50));
  console.log('Starting board check...');
  console.log('Time:', new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' }));
  console.log('='.repeat(50));

  const scraper = new BoardScraper();
  const storage = new PostStorage();
  const mailer = new Mailer();

  try {
    // Initialize storage
    await storage.init();

    // Scrape the board
    const posts = await scraper.scrape();

    if (posts.length === 0) {
      console.log('No posts found on the board');
      return { success: true, newPosts: 0 };
    }

    // Find new posts
    const newPosts = storage.getNewPosts(posts);

    console.log(`Total posts: ${posts.length}`);
    console.log(`New posts: ${newPosts.length}`);

    if (newPosts.length > 0) {
      console.log('\nNew posts detected:');
      newPosts.forEach(post => {
        console.log(`  - [${post.id}] ${post.name}`);
      });

      // Send email notification
      await mailer.sendNewPostsAlert(newPosts);

      // Mark posts as seen
      await storage.saveNewPosts(newPosts);

      console.log('\nEmail sent and posts marked as seen');
    } else {
      console.log('No new posts found');
    }

    console.log('='.repeat(50));
    console.log('Check completed successfully');
    console.log('='.repeat(50));

    return {
      success: true,
      totalPosts: posts.length,
      newPosts: newPosts.length,
      posts: newPosts,
    };
  } catch (error) {
    console.error('Error during check:', error.message);
    console.error(error.stack);

    console.log('='.repeat(50));
    console.log('Check failed');
    console.log('='.repeat(50));

    return {
      success: false,
      error: error.message,
    };
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Wrap with timeout
  Promise.race([
    checkForNewPosts(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Script timeout after 5 minutes')), TIMEOUT_MS)
    )
  ])
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error:', error.message);
      process.exit(1);
    });
}