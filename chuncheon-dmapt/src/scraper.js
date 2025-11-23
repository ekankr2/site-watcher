import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import * as cheerio from 'cheerio';

const BASE_URL = 'http://www.chuncheon-dmapt.co.kr';
const LOGIN_URL = `${BASE_URL}/board/bbs/login_check.php`;
const BOARD_URL = `${BASE_URL}/board/adm/interest_list.php`;

export class BoardScraper {
  constructor() {
    const jar = new CookieJar();
    this.client = wrapper(axios.create({
      jar,
      withCredentials: true,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    }));
  }

  async login() {
    try {
      console.log('Logging in...');

      const response = await this.client.post(LOGIN_URL, new URLSearchParams({
        mb_id: 'admin',
        mb_password: 'admin123',
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        maxRedirects: 5,
      });

      console.log('Login successful');
      return true;
    } catch (error) {
      console.error('Login failed:', error.message);
      throw error;
    }
  }

  async fetchPosts() {
    try {
      console.log('Fetching board posts...');

      const response = await this.client.get(BOARD_URL);
      const html = response.data;

      // Check if we got redirected to login page
      if (html.includes('login.php') || response.request.path?.includes('login.php')) {
        throw new Error('Not authenticated - redirected to login page');
      }

      const $ = cheerio.load(html);
      const posts = [];

      // Parse customer interest list (관심고객관리)
      $('table tbody tr').each((index, element) => {
        const $row = $(element);
        const cells = $row.find('td');

        // Each row has: checkbox, name, phone, address, consent fields, ip, date
        if (cells.length >= 7) {
          // Get ID from hidden input
          const idInput = $row.find('input[name^="no["]').val();
          const name = cells.eq(1).text().trim();
          const phone = cells.eq(2).text().trim();
          const address = cells.eq(3).text().trim();
          const privacyConsent = cells.eq(4).text().trim(); // 개인정보동의
          const privacyHandlingConsent = cells.eq(5).text().trim(); // 개인정보취급동의
          const smsConsent = cells.eq(6).text().trim(); // SMS 동의
          const ip = cells.eq(7).text().trim();
          const date = cells.eq(8).text().trim(); // 등록일

          if (idInput && name) {
            posts.push({
              id: idInput,
              name: name,
              phone: phone,
              address: address,
              privacyConsent: privacyConsent,
              privacyHandlingConsent: privacyHandlingConsent,
              smsConsent: smsConsent,
              ip: ip,
              date: date,
              scrapedAt: new Date().toISOString(),
            });
          }
        }
      });

      console.log(`Found ${posts.length} posts`);
      return posts;
    } catch (error) {
      console.error('Failed to fetch posts:', error.message);
      throw error;
    }
  }

  async scrape() {
    await this.login();
    const posts = await this.fetchPosts();
    return posts;
  }
}