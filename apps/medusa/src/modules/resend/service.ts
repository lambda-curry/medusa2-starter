import { AbstractNotificationProviderService, MedusaError } from '@medusajs/framework/utils';
import { Logger, ProviderSendNotificationDTO, ProviderSendNotificationResultsDTO } from '@medusajs/framework/types';
import { Resend, CreateEmailOptions } from 'resend';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { render } from '@react-email/components';

type ResendOptions = {
  api_key: string;
  capture_dir?: string;
  from: string;
  html_templates?: Record<
    string,
    {
      subject?: string;
      content: string;
    }
  >;
};

type InjectedDependencies = {
  logger: Logger;
};

enum Templates {
  ORDER_PLACED = 'order-placed',
  CHEF_EVENT_REQUESTED = 'chef-event-requested',
  CHEF_EVENT_ACCEPTED = 'chef-event-accepted',
  CHEF_EVENT_REJECTED = 'chef-event-rejected',
  EVENT_DETAILS_RESEND = 'event-details-resend',
  PAYMENT_REMINDER = 'payment-reminder',
  RECEIPT = 'receipt',
}

// Import email templates
import { orderPlacedEmail } from './emails/order-placed';
import { chefEventRequestedEmail } from './emails/chef-event-requested';
import { chefEventAcceptedEmail } from './emails/chef-event-accepted';
import { chefEventRejectedEmail } from './emails/chef-event-rejected';
import { eventDetailsResendEmail } from './emails/event-details-resend';
import { paymentReminderEmail } from './emails/payment-reminder';
import { receiptEmail } from './emails/receipt';

const templates: { [key in Templates]?: (props: any) => React.ReactNode } = {
  [Templates.ORDER_PLACED]: orderPlacedEmail,
  [Templates.CHEF_EVENT_REQUESTED]: chefEventRequestedEmail,
  [Templates.CHEF_EVENT_ACCEPTED]: chefEventAcceptedEmail,
  [Templates.CHEF_EVENT_REJECTED]: chefEventRejectedEmail,
  [Templates.EVENT_DETAILS_RESEND]: eventDetailsResendEmail,
  [Templates.PAYMENT_REMINDER]: paymentReminderEmail,
  [Templates.RECEIPT]: receiptEmail,
};

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = 'notification-resend';
  private resendClient: Resend | undefined;
  private options: ResendOptions;
  private logger: Logger;

  constructor({ logger }: InjectedDependencies, options: ResendOptions) {
    super();
    this.resendClient = options.capture_dir ? undefined : new Resend(options.api_key);
    this.options = options;
    this.logger = logger;
  }

  static validateOptions(options: Record<any, any>) {
    if (options.capture_dir && process.env.PREVIEW_MODE !== "true") {
      throw new Error("Email capture requires PREVIEW_MODE=true");
    }
    if (!options.capture_dir && !options.api_key) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Option `api_key` is required in the provider's options.");
    }
    if (!options.from) {
      throw new MedusaError(MedusaError.Types.INVALID_DATA, "Option `from` is required in the provider's options.");
    }
  }

  getTemplate(template: Templates) {
    if (this.options.html_templates?.[template]) {
      return this.options.html_templates[template].content;
    }
    const allowedTemplates = Object.keys(templates);

    if (!allowedTemplates.includes(template)) {
      return null;
    }

    return templates[template];
  }

  getTemplateSubject(template: Templates) {
    if (this.options.html_templates?.[template]?.subject) {
      return this.options.html_templates[template].subject;
    }
    switch (template) {
      case Templates.ORDER_PLACED:
        return 'Order Confirmation';
      case Templates.CHEF_EVENT_REQUESTED:
        return 'Chef Event Request Confirmation';
      case Templates.CHEF_EVENT_ACCEPTED:
        return 'Booking Confirmed! 🎉';
      case Templates.CHEF_EVENT_REJECTED:
        return 'Chef Event Update';
      case Templates.EVENT_DETAILS_RESEND:
        return '📧 Event Details Reminder';
      case Templates.PAYMENT_REMINDER:
        return 'Payment Reminder - Complete Your Event Purchase';
      case Templates.RECEIPT:
        return 'Receipt - Your Chef Event with Chef Luis Velez';
      default:
        return 'New Email';
    }
  }

  async send(notification: ProviderSendNotificationDTO): Promise<ProviderSendNotificationResultsDTO> {
    const template = this.getTemplate(notification.template as Templates);

    if (!template) {
      this.logger.error(
        `Couldn't find an email template for ${notification.template}. The valid options are ${Object.values(Templates)}`,
      );
      return {};
    }

    const commonOptions: Partial<CreateEmailOptions> = {
      from: this.options.from,
      to: [notification.to],
      subject: this.getTemplateSubject(notification.template as Templates),
      ...(notification.template === 'payment-reminder' && { replyTo: 'support@chefvelez.com' }),
    };

    let emailOptions: CreateEmailOptions;
    if (typeof template === 'string') {
      emailOptions = {
        ...commonOptions,
        html: template,
        from: this.options.from,
      } as CreateEmailOptions;
    } else {
      emailOptions = {
        ...commonOptions,
        react: template(notification.data),
        from: this.options.from,
      } as CreateEmailOptions;
    }

    if (this.options.capture_dir) {
      const id = randomUUID();
      const html = typeof template === 'string' ? template : await render(template(notification.data));
      await mkdir(this.options.capture_dir, { recursive: true, mode: 0o700 });
      await writeFile(join(this.options.capture_dir, `${id}.json`), JSON.stringify({
        id, ...commonOptions, html, created_at: new Date().toISOString(),
      }), { mode: 0o600, flag: 'wx' });
      return { id };
    }
    const { data, error } = await this.resendClient!.emails.send(emailOptions);

    if (error || !data) {
      if (error) {
        this.logger.error('Failed to send email', error);
      } else {
        this.logger.error('Failed to send email: unknown error');
      }
      return {};
    }

    return { id: data.id };
  }
}

export default ResendNotificationProviderService;
