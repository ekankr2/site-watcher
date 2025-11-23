import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const SEEN_POSTS_FILE = path.join(DATA_DIR, 'seen-posts.json');

export class PostStorage {
  constructor() {
    this.maxId = null;
  }

  async init() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });

      try {
        const data = await fs.readFile(SEEN_POSTS_FILE, 'utf-8');
        const saved = JSON.parse(data);
        this.maxId = saved.maxId;
        console.log(`Loaded max ID from storage: ${this.maxId}`);
      } catch (error) {
        if (error.code === 'ENOENT') {
          console.log('No existing data file, starting fresh');
          this.maxId = null;
        } else {
          throw error;
        }
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error.message);
      throw error;
    }
  }

  async save() {
    try {
      const data = JSON.stringify({ maxId: this.maxId }, null, 2);
      await fs.writeFile(SEEN_POSTS_FILE, data, 'utf-8');
      console.log(`Saved max ID to storage: ${this.maxId}`);
    } catch (error) {
      console.error('Failed to save storage:', error.message);
      throw error;
    }
  }

  isNew(postId) {
    if (this.maxId === null) return true;
    return parseInt(postId) > parseInt(this.maxId);
  }

  getNewPosts(posts) {
    return posts.filter(post => this.isNew(post.id));
  }

  async saveNewPosts(newPosts) {
    if (newPosts.length === 0) return;

    // Find the highest ID from new posts
    const newMaxId = Math.max(...newPosts.map(p => parseInt(p.id)));

    // Update maxId if new max is higher
    if (this.maxId === null || newMaxId > parseInt(this.maxId)) {
      this.maxId = newMaxId.toString();
    }

    await this.save();
  }
}