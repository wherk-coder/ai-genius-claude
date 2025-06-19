import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

export interface EmailTemplate {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

export interface WelcomeEmailData {
  name: string;
  email: string;
  subscriptionTier: string;
}

export interface BetConfirmationEmailData {
  name: string;
  betType: string;
  description: string;
  amount: number;
  potentialPayout: number;
  odds: number;
  sportsbook?: string;
}

export interface WeeklySummaryEmailData {
  name: string;
  weekStart: string;
  weekEnd: string;
  totalBets: number;
  totalWagered: number;
  totalWon: number;
  winRate: number;
  bestBet?: {
    description: string;
    payout: number;
  };
  insights: string[];
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.fromEmail = this.configService.get<string>('FROM_EMAIL') || 'noreply@aibettingassistant.com';
    
    if (apiKey) {
      this.resend = new Resend(apiKey);
    } else {
      this.logger.warn('Resend API key not configured - emails will be logged instead');
    }
  }

  /**
   * Send a generic email
   */
  async sendEmail(template: EmailTemplate): Promise<boolean> {
    try {
      if (!this.resend) {
        this.logger.log('Email would be sent:', template);
        return true;
      }

      const result = await this.resend.emails.send({
        from: template.from || this.fromEmail,
        to: template.to,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      if (result.error) {
        this.logger.error('Failed to send email:', result.error);
        return false;
      }

      this.logger.log(`Email sent successfully: ${result.data?.id}`);
      return true;
    } catch (error) {
      this.logger.error('Email sending failed:', error);
      return false;
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(data: WelcomeEmailData): Promise<boolean> {
    const template: EmailTemplate = {
      to: data.email,
      subject: 'Welcome to AI Betting Assistant! 🎯',
      html: this.generateWelcomeEmailHtml(data),
      text: this.generateWelcomeEmailText(data),
    };

    return this.sendEmail(template);
  }

  /**
   * Send bet confirmation email
   */
  async sendBetConfirmationEmail(data: BetConfirmationEmailData): Promise<boolean> {
    const template: EmailTemplate = {
      to: data.email,
      subject: `Bet Placed: ${data.description}`,
      html: this.generateBetConfirmationHtml(data),
      text: this.generateBetConfirmationText(data),
    };

    return this.sendEmail(template);
  }

  /**
   * Send weekly summary email
   */
  async sendWeeklySummaryEmail(email: string, data: WeeklySummaryEmailData): Promise<boolean> {
    const template: EmailTemplate = {
      to: email,
      subject: `Your Weekly Betting Summary (${data.weekStart} - ${data.weekEnd})`,
      html: this.generateWeeklySummaryHtml(data),
      text: this.generateWeeklySummaryText(data),
    };

    return this.sendEmail(template);
  }

  /**
   * Generate welcome email HTML
   */
  private generateWelcomeEmailHtml(data: WelcomeEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to AI Betting Assistant</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature { margin: 15px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Welcome to AI Betting Assistant! 🎯</h1>
            <p>Your intelligent betting companion is ready</p>
        </div>
        
        <div class="content">
            <h2>Hi ${data.name}! 👋</h2>
            
            <p>Welcome to AI Betting Assistant! We're excited to help you make smarter betting decisions with the power of artificial intelligence.</p>
            
            <p><strong>Your ${data.subscriptionTier} subscription is now active!</strong></p>
            
            <div class="features">
                <h3>🚀 What you can do now:</h3>
                
                <div class="feature">
                    <strong>📊 Track Your Bets</strong><br>
                    Upload receipts, track performance, and analyze your betting patterns
                </div>
                
                <div class="feature">
                    <strong>🤖 AI Insights</strong><br>
                    Get personalized recommendations and betting insights powered by AI
                </div>
                
                <div class="feature">
                    <strong>📱 Mobile App</strong><br>
                    Take photos of bet slips and manage your bets on the go
                </div>
                
                <div class="feature">
                    <strong>📈 Live Odds</strong><br>
                    Compare odds across multiple sportsbooks and find the best value
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="https://app.aibettingassistant.com/dashboard" class="button">Get Started Now</a>
            </div>
            
            <p>If you have any questions, our support team is here to help. Just reply to this email!</p>
            
            <p>Happy betting! 🍀<br>
            The AI Betting Assistant Team</p>
        </div>
        
        <div class="footer">
            <p>AI Betting Assistant | Bet Smarter, Not Harder</p>
            <p>Please gamble responsibly. If you need help, visit <a href="https://www.ncpgambling.org">ncpgambling.org</a></p>
        </div>
    </body>
    </html>`;
  }

  /**
   * Generate welcome email text
   */
  private generateWelcomeEmailText(data: WelcomeEmailData): string {
    return `
Welcome to AI Betting Assistant! 🎯

Hi ${data.name}!

Welcome to AI Betting Assistant! We're excited to help you make smarter betting decisions with the power of artificial intelligence.

Your ${data.subscriptionTier} subscription is now active!

What you can do now:
📊 Track Your Bets - Upload receipts, track performance, and analyze your betting patterns
🤖 AI Insights - Get personalized recommendations and betting insights powered by AI
📱 Mobile App - Take photos of bet slips and manage your bets on the go
📈 Live Odds - Compare odds across multiple sportsbooks and find the best value

Get started: https://app.aibettingassistant.com/dashboard

If you have any questions, our support team is here to help. Just reply to this email!

Happy betting! 🍀
The AI Betting Assistant Team

---
AI Betting Assistant | Bet Smarter, Not Harder
Please gamble responsibly. If you need help, visit ncpgambling.org
    `;
  }

  /**
   * Generate bet confirmation email HTML
   */
  private generateBetConfirmationHtml(data: BetConfirmationEmailData): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bet Confirmation</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .bet-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>Bet Confirmed! ✅</h1>
            <p>Your bet has been successfully recorded</p>
        </div>
        
        <div class="content">
            <h2>Hi ${data.name}! 👋</h2>
            
            <p>Your ${data.betType.toLowerCase()} bet has been confirmed and added to your tracking dashboard.</p>
            
            <div class="bet-details">
                <h3>📋 Bet Details</h3>
                
                <div class="detail-row">
                    <span><strong>Description:</strong></span>
                    <span>${data.description}</span>
                </div>
                
                <div class="detail-row">
                    <span><strong>Type:</strong></span>
                    <span>${data.betType}</span>
                </div>
                
                <div class="detail-row">
                    <span><strong>Amount:</strong></span>
                    <span>$${data.amount.toFixed(2)}</span>
                </div>
                
                <div class="detail-row">
                    <span><strong>Odds:</strong></span>
                    <span>${data.odds > 0 ? '+' : ''}${data.odds}</span>
                </div>
                
                <div class="detail-row">
                    <span><strong>Potential Payout:</strong></span>
                    <span><strong>$${data.potentialPayout.toFixed(2)}</strong></span>
                </div>
                
                ${data.sportsbook ? `
                <div class="detail-row">
                    <span><strong>Sportsbook:</strong></span>
                    <span>${data.sportsbook}</span>
                </div>
                ` : ''}
            </div>
            
            <p>🍀 Good luck with your bet! We'll notify you when it's settled.</p>
            
            <p>You can track this bet and view detailed analytics in your dashboard.</p>
        </div>
        
        <div class="footer">
            <p>AI Betting Assistant | Track Every Bet, Maximize Every Win</p>
        </div>
    </body>
    </html>`;
  }

  /**
   * Generate bet confirmation email text
   */
  private generateBetConfirmationText(data: BetConfirmationEmailData): string {
    return `
Bet Confirmed! ✅

Hi ${data.name}!

Your ${data.betType.toLowerCase()} bet has been confirmed and added to your tracking dashboard.

📋 Bet Details:
Description: ${data.description}
Type: ${data.betType}
Amount: $${data.amount.toFixed(2)}
Odds: ${data.odds > 0 ? '+' : ''}${data.odds}
Potential Payout: $${data.potentialPayout.toFixed(2)}
${data.sportsbook ? `Sportsbook: ${data.sportsbook}` : ''}

🍀 Good luck with your bet! We'll notify you when it's settled.

You can track this bet and view detailed analytics in your dashboard.

---
AI Betting Assistant | Track Every Bet, Maximize Every Win
    `;
  }

  /**
   * Generate weekly summary email HTML
   */
  private generateWeeklySummaryHtml(data: WeeklySummaryEmailData): string {
    const profitLoss = data.totalWon - data.totalWagered;
    const isProfit = profitLoss > 0;
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Weekly Betting Summary</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
            .stat-card { background: white; padding: 20px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #667eea; }
            .profit { color: #28a745; }
            .loss { color: #dc3545; }
            .insights { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📊 Weekly Summary</h1>
            <p>${data.weekStart} - ${data.weekEnd}</p>
        </div>
        
        <div class="content">
            <h2>Hi ${data.name}! 👋</h2>
            
            <p>Here's your betting performance summary for this week:</p>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${data.totalBets}</div>
                    <div>Total Bets</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">${(data.winRate * 100).toFixed(1)}%</div>
                    <div>Win Rate</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value">$${data.totalWagered.toFixed(2)}</div>
                    <div>Total Wagered</div>
                </div>
                
                <div class="stat-card">
                    <div class="stat-value ${isProfit ? 'profit' : 'loss'}">
                        ${isProfit ? '+' : ''}$${profitLoss.toFixed(2)}
                    </div>
                    <div>Profit/Loss</div>
                </div>
            </div>
            
            ${data.bestBet ? `
            <div class="stat-card" style="margin: 20px 0;">
                <h3>🏆 Best Bet of the Week</h3>
                <p><strong>${data.bestBet.description}</strong></p>
                <div class="stat-value profit">+$${data.bestBet.payout.toFixed(2)}</div>
            </div>
            ` : ''}
            
            ${data.insights.length > 0 ? `
            <div class="insights">
                <h3>🤖 AI Insights</h3>
                ${data.insights.map(insight => `<p>• ${insight}</p>`).join('')}
            </div>
            ` : ''}
            
            <p>Keep up the great work! Remember to bet responsibly and stick to your bankroll management strategy.</p>
        </div>
        
        <div class="footer">
            <p>AI Betting Assistant | Your Week in Review</p>
        </div>
    </body>
    </html>`;
  }

  /**
   * Generate weekly summary email text
   */
  private generateWeeklySummaryText(data: WeeklySummaryEmailData): string {
    const profitLoss = data.totalWon - data.totalWagered;
    const isProfit = profitLoss > 0;
    
    return `
📊 Weekly Summary (${data.weekStart} - ${data.weekEnd})

Hi ${data.name}!

Here's your betting performance summary for this week:

📈 Your Stats:
• Total Bets: ${data.totalBets}
• Win Rate: ${(data.winRate * 100).toFixed(1)}%
• Total Wagered: $${data.totalWagered.toFixed(2)}
• Profit/Loss: ${isProfit ? '+' : ''}$${profitLoss.toFixed(2)}

${data.bestBet ? `
🏆 Best Bet of the Week:
${data.bestBet.description}
Payout: +$${data.bestBet.payout.toFixed(2)}
` : ''}

${data.insights.length > 0 ? `
🤖 AI Insights:
${data.insights.map(insight => `• ${insight}`).join('\n')}
` : ''}

Keep up the great work! Remember to bet responsibly and stick to your bankroll management strategy.

---
AI Betting Assistant | Your Week in Review
    `;
  }
}