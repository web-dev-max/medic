import { Injectable } from '@nestjs/common';

export interface EmailRow {
  label: string;
  value: string | undefined;
}

export interface EmailWithAttachments {
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; path: string; contentType?: string }>;
}

@Injectable()
export class EmailTemplatesService {
  formatTable(rows: EmailRow[]): string {
    const rowsHtml = rows
      .map(
        (row) => `
      <tr>
        <td style="padding: 10px 12px; border: 1px solid #e2e8f0; background: #f7fafc; font-weight: 600; color: #1a2a3a; width: 40%;">${row.label}</td>
        <td style="padding: 10px 12px; border: 1px solid #e2e8f0; color: #4a5568;">${row.value || '—'}</td>
      </tr>
    `,
      )
      .join('');

    return `
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0; font-family: Arial, sans-serif; font-size: 14px;">
        ${rowsHtml}
      </table>
    `;
  }

  formatCallbackEmail(data: { name: string; phone: string }): { subject: string; html: string } {
    const rows = [
      { label: 'Имя', value: data.name },
      { label: 'Телефон', value: data.phone },
    ];

    return {
      subject: 'Заявка: Обратный звонок',
      html: `
        <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 14px;">Поступила новая заявка на обратный звонок:</p>
        ${this.formatTable(rows)}
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #718096;">
          Дата: ${new Date().toLocaleString('ru-RU')}
        </p>
      `,
    };
  }

  formatGeneralEmail(data: { name: string; phone: string; email: string; message: string }): { subject: string; html: string } {
    const rows = [
      { label: 'Имя', value: data.name },
      { label: 'Телефон', value: data.phone },
      { label: 'Email', value: data.email },
      { label: 'Сообщение', value: data.message },
    ];

    return {
      subject: 'Заявка: Общее обращение',
      html: `
        <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 14px;">Поступило новое обращение:</p>
        ${this.formatTable(rows)}
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #718096;">
          Дата: ${new Date().toLocaleString('ru-RU')}
        </p>
      `,
    };
  }

  formatProductEmail(data: {
    name: string;
    phone: string;
    email: string;
    productId?: string;
    productName?: string;
    comment?: string;
  }): { subject: string; html: string } {
    const rows = [
      { label: 'Имя', value: data.name },
      { label: 'Телефон', value: data.phone },
      { label: 'Email', value: data.email },
      { label: 'Товар', value: data.productName || data.productId || '—' },
      { label: 'Комментарий', value: data.comment },
    ];

    return {
      subject: 'Заявка: Заказ товара',
      html: `
        <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 14px;">Поступила заявка на заказ:</p>
        ${this.formatTable(rows)}
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #718096;">
          Дата: ${new Date().toLocaleString('ru-RU')}
        </p>
      `,
    };
  }

  formatPriceInquiryEmail(data: {
    name: string;
    phone: string;
    email: string;
    productId?: string;
    productName?: string;
    comment?: string;
  }): { subject: string; html: string } {
    const rows = [
      { label: 'Имя', value: data.name },
      { label: 'Телефон', value: data.phone },
      { label: 'Email', value: data.email },
      { label: 'Товар', value: data.productName || data.productId || '—' },
      { label: 'Комментарий', value: data.comment },
    ];

    return {
      subject: 'Заявка: Уточнение цены',
      html: `
        <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 14px;">Поступила заявка на уточнение цены:</p>
        ${this.formatTable(rows)}
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #718096;">
          Дата: ${new Date().toLocaleString('ru-RU')}
        </p>
      `,
    };
  }

  formatLeasingEmail(data: {
    name: string;
    phone: string;
    email: string;
    message?: string;
  }): { subject: string; html: string } {
    const rows = [
      { label: 'Имя', value: data.name },
      { label: 'Телефон', value: data.phone },
      { label: 'Email', value: data.email },
      { label: 'Сообщение', value: data.message },
    ];

    return {
      subject: 'Заявка: Лизинг',
      html: `
        <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 14px;">Поступила заявка на лизинг:</p>
        ${this.formatTable(rows)}
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #718096;">
          Дата: ${new Date().toLocaleString('ru-RU')}
        </p>
      `,
    };
  }

  formatServiceEmail(
    data: {
      name: string;
      phone: string;
      email: string;
      organization?: string;
      equipmentType: string;
      manufacturer: string;
      model: string;
      serialNumber?: string;
      problemDescription: string;
    },
    attachments?: Array<{ filename: string; path: string; contentType?: string }>,
  ): EmailWithAttachments {
    const rows = [
      { label: 'Имя', value: data.name },
      { label: 'Телефон', value: data.phone },
      { label: 'Email', value: data.email },
      { label: 'Организация', value: data.organization },
      { label: 'Тип оборудования', value: data.equipmentType },
      { label: 'Производитель', value: data.manufacturer },
      { label: 'Модель', value: data.model },
      { label: 'Серийный номер', value: data.serialNumber },
      { label: 'Описание проблемы', value: data.problemDescription },
    ];

    let attachmentsHtml = '';
    if (attachments && attachments.length > 0) {
      const attachmentList = attachments
        .map((a) => `<li style="color: #4a5568; margin: 4px 0;">📎 ${a.filename}</li>`)
        .join('');
      attachmentsHtml = `
        <p style="margin: 12px 0 8px 0; font-weight: 600; color: #1a2a3a; font-size: 14px;">Вложения:</p>
        <ul style="margin: 0 0 16px 0; padding-left: 20px;">${attachmentList}</ul>
      `;
    }

    return {
      subject: 'Заявка: Сервисное обслуживание',
      html: `
        <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 14px;">Поступила заявка на сервисное обслуживание:</p>
        ${this.formatTable(rows)}
        ${attachmentsHtml}
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #718096;">
          Дата: ${new Date().toLocaleString('ru-RU')}
        </p>
      `,
      attachments,
    };
  }

  formatCartEmail(
    data: {
      name: string;
      phone: string;
      email: string;
      items: Array<{ productId: number; productName: string; price: number; quantity: number }>;
      comment?: string;
    },
  ): { subject: string; html: string } {
    const itemsRows = data.items
      .map(
        (item) => {
          const priceStr = item.price ? `${item.price.toLocaleString('ru-RU')} ₽` : '—';
          const totalStr = item.price
            ? `${(item.price * item.quantity).toLocaleString('ru-RU')} ₽`
            : '—';
          return `
            <tr>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; color: #4a5568;">${item.productName || 'Товар #' + item.productId}</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: center; color: #4a5568;">${item.quantity}</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right; color: #4a5568;">${priceStr}</td>
              <td style="padding: 8px 12px; border: 1px solid #e2e8f0; text-align: right; font-weight: 600; color: #1a2a3a;">${totalStr}</td>
            </tr>
          `;
        },
      )
      .join('');

    const total = data.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0);
    const totalStr = total > 0 ? `${total.toLocaleString('ru-RU')} ₽` : '—';

    const customerRows = [
      { label: 'Имя', value: data.name },
      { label: 'Телефон', value: data.phone },
      { label: 'Email', value: data.email },
      { label: 'Комментарий', value: data.comment },
    ];

    return {
      subject: 'Заявка: Корзина',
      html: `
        <p style="margin: 0 0 16px 0; color: #4a5568; font-size: 14px;">Поступила заявка из корзины:</p>
        
        <h3 style="margin: 0 0 8px 0; color: #1a2a3a; font-size: 16px;">Контактные данные:</h3>
        ${this.formatTable(customerRows)}
        
        <h3 style="margin: 20px 0 8px 0; color: #1a2a3a; font-size: 16px;">Товары:</h3>
        <table style="border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 14px;">
          <thead>
            <tr style="background: #007B8D; color: #ffffff;">
              <th style="padding: 10px 12px; text-align: left; font-weight: 600;">Наименование</th>
              <th style="padding: 10px 12px; text-align: center; font-weight: 600;">Кол-во</th>
              <th style="padding: 10px 12px; text-align: right; font-weight: 600;">Цена</th>
              <th style="padding: 10px 12px; text-align: right; font-weight: 600;">Итого</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
          <tfoot>
            <tr style="background: #f7fafc; font-weight: 700;">
              <td colspan="3" style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: right; color: #1a2a3a;">Итого:</td>
              <td style="padding: 10px 12px; border: 1px solid #e2e8f0; text-align: right; color: #007B8D; font-size: 16px;">${totalStr}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="margin: 16px 0 0 0; font-size: 12px; color: #718096;">
          Дата: ${new Date().toLocaleString('ru-RU')}
        </p>
      `,
    };
  }
}
