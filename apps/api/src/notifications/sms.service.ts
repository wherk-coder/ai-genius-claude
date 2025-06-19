import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Twilio } from 'twilio';

export interface SmsMessage {
  to: string;
  message: string;
  from?: string;
}

export interface BetAlertData {
  name: string;
  phone: string;
  description: string;
  status: 'WON' | 'LOST' | 'PUSHED';
  payout?: number;
  amount: number;
}

export interface OddsMovementData {
  name: string;
  phone: string;
  game: string;
  outcome: string;
  oldOdds: number;
  newOdds: number;
  bookmaker: string;
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly twilio: Twilio;
  private readonly fromPhone: string;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    this.fromPhone = this.configService.get<string>('TWILIO_PHONE_NUMBER') || '+1234567890';
    
    if (accountSid && authToken) {
      this.twilio = new Twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio credentials not configured - SMS will be logged instead');
    }
  }

  /**
   * Send a generic SMS message
   */
  async sendSms(sms: SmsMessage): Promise<boolean> {
    try {
      if (!this.twilio) {
        this.logger.log('SMS would be sent:', sms);
        return true;
      }

      const result = await this.twilio.messages.create({
        body: sms.message,
        from: sms.from || this.fromPhone,
        to: sms.to,
      });

      if (result.errorCode) {
        this.logger.error(`SMS failed with error ${result.errorCode}: ${result.errorMessage}`);
        return false;
      }

      this.logger.log(`SMS sent successfully: ${result.sid}`);
      return true;
    } catch (error) {
      this.logger.error('SMS sending failed:', error);
      return false;
    }
  }

  /**
   * Send bet settlement alert
   */
  async sendBetAlert(data: BetAlertData): Promise<boolean> {
    let message: string;
    
    switch (data.status) {
      case 'WON':
        message = `🎉 Bet WON! "${data.description}" - You won $${data.payout?.toFixed(2)}! Check your dashboard for details.`;
        break;
      case 'LOST':
        message = `❌ Bet Lost: "${data.description}" - $${data.amount.toFixed(2)} lost. Better luck next time!`;
        break;
      case 'PUSHED':
        message = `↩️ Bet Pushed: "${data.description}" - Your $${data.amount.toFixed(2)} stake has been returned.`;
        break;
    }

    return this.sendSms({
      to: data.phone,
      message: message,
    });
  }

  /**
   * Send odds movement alert
   */
  async sendOddsMovementAlert(data: OddsMovementData): Promise<boolean> {
    const direction = data.newOdds > data.oldOdds ? '📈' : '📉';
    const change = data.newOdds > data.oldOdds ? 'improved' : 'dropped';
    
    const message = `${direction} Odds Alert! ${data.game} - ${data.outcome} odds ${change} from ${data.oldOdds > 0 ? '+' : ''}${data.oldOdds} to ${data.newOdds > 0 ? '+' : ''}${data.newOdds} at ${data.bookmaker}`;

    return this.sendSms({
      to: data.phone,
      message: message,
    });
  }

  /**
   * Send weekly summary SMS
   */
  async sendWeeklySummarySms(phone: string, name: string, stats: {
    totalBets: number;
    winRate: number;
    profitLoss: number;
  }): Promise<boolean> {
    const profitEmoji = stats.profitLoss > 0 ? '📈' : stats.profitLoss < 0 ? '📉' : '➡️';
    const profitText = stats.profitLoss > 0 ? `+$${stats.profitLoss.toFixed(2)}` : 
                      stats.profitLoss < 0 ? `-$${Math.abs(stats.profitLoss).toFixed(2)}` : 
                      '$0.00';

    const message = `📊 Weekly Summary: ${stats.totalBets} bets, ${(stats.winRate * 100).toFixed(1)}% win rate, ${profitEmoji} ${profitText}. Check your dashboard for detailed analysis!`;

    return this.sendSms({
      to: phone,
      message: message,
    });
  }

  /**
   * Send game start reminder
   */
  async sendGameStartReminder(phone: string, game: string, description: string, minutesUntilStart: number): Promise<boolean> {
    const message = `⏰ Game Alert! ${game} starts in ${minutesUntilStart} minutes. Your bet: "${description}". Good luck! 🍀`;

    return this.sendSms({
      to: phone,
      message: message,
    });
  }

  /**
   * Send promotional SMS
   */
  async sendPromotionalSms(phone: string, name: string, message: string): Promise<boolean> {
    const fullMessage = `Hi ${name}! ${message} - AI Betting Assistant`;

    return this.sendSms({
      to: phone,
      message: fullMessage,
    });
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phone: string): boolean {
    // Basic E.164 format validation
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Format phone number to E.164
   */
  formatPhoneNumber(phone: string, defaultCountryCode = '+1'): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with 1 and has 11 digits (US/Canada)
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+${digits}`;
    }
    
    // If it has 10 digits, assume US/Canada
    if (digits.length === 10) {
      return `${defaultCountryCode}${digits}`;
    }
    
    // If it already has a + sign, return as is
    if (phone.startsWith('+')) {
      return phone;
    }
    
    // Otherwise, prepend default country code
    return `${defaultCountryCode}${digits}`;
  }
}