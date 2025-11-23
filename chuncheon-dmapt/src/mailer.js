import nodemailer from 'nodemailer';

export class Mailer {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    this.toEmail = process.env.TO_EMAIL || 'as9611142@naver.com';
  }

  async sendNewPostsAlert(newPosts) {
    if (newPosts.length === 0) {
      console.log('No new posts to send');
      return;
    }

    const subject = `[춘천 동문 디 이스트] 신규 고객 ${newPosts.length}명 등록`;

    const htmlContent = `
      <h2>신규 관심고객 등록 알림</h2>
      <p>신규 고객 ${newPosts.length}명이 등록되었습니다:</p>
      <ul>
        ${newPosts.map(post => `
          <li>
            <strong>${post.name}</strong><br>
            연락처: ${post.phone}<br>
            주소: ${post.address}<br>
            개인정보동의: ${post.privacyConsent} / 개인정보취급동의: ${post.privacyHandlingConsent} / SMS동의: ${post.smsConsent}<br>
            IP: ${post.ip}<br>
            등록일시: ${post.date}<br>
            <small style="color: #999;">ID: ${post.id}</small>
          </li>
        `).join('<br>')}
      </ul>
      <hr>
      <p style="color: #666; font-size: 12px;">
        확인 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
      </p>
    `;

    const textContent = `
신규 관심고객 등록 알림

신규 고객 ${newPosts.length}명이 등록되었습니다:

${newPosts.map(post => `
- ${post.name}
  연락처: ${post.phone}
  주소: ${post.address}
  개인정보동의: ${post.privacyConsent} / 개인정보취급동의: ${post.privacyHandlingConsent} / SMS동의: ${post.smsConsent}
  IP: ${post.ip}
  등록일시: ${post.date}
  ID: ${post.id}
`).join('\n')}

---
확인 시각: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
    `;

    try {
      console.log(`Sending email to ${this.toEmail}...`);

      const info = await this.transporter.sendMail({
        from: `"춘천 동문 디 이스트 알림이" <${process.env.GMAIL_USER}>`,
        to: this.toEmail,
        subject: subject,
        text: textContent,
        html: htmlContent,
      });

      console.log('Email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send email:', error.message);
      throw error;
    }
  }

  async sendTestEmail() {
    try {
      const info = await this.transporter.sendMail({
        from: `"Chuncheon DMAPT Scraper" <${process.env.GMAIL_USER}>`,
        to: this.toEmail,
        subject: '[Test] Chuncheon DMAPT Scraper',
        text: 'This is a test email from the Chuncheon DMAPT scraper.',
        html: '<p>This is a test email from the <strong>Chuncheon DMAPT scraper</strong>.</p>',
      });

      console.log('Test email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Failed to send test email:', error.message);
      throw error;
    }
  }
}