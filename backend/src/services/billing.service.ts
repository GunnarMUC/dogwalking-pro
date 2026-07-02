import { prisma } from '../lib/prisma.js';
import type { BillingReportInput } from '../schemas/billing.js';

const TAX_RATE = 0.19;

let invoiceCounter = 0;

export class BillingService {
  async generateReport(input: BillingReportInput) {
    const where: any = {
      walk: {
        date: { gte: input.startDate, lte: input.endDate },
        status: 'COMPLETED',
      },
      attended: true,
      duration: { not: null },
    };

    if (input.dogId) where.dogId = input.dogId;
    if (input.ownerId) {
      where.dog = { ownerId: input.ownerId };
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        dog: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true } },
            rates: { orderBy: { effectiveFrom: 'desc' } },
          },
        },
        walk: { select: { date: true, startTime: true, endTime: true } },
      },
      orderBy: { walk: { date: 'desc' } },
    });

    const records = attendances.map(a => {
      const walkDate = new Date(a.walk.date);
      const applicableRate = a.dog.rates.find(r => new Date(r.effectiveFrom) <= walkDate);
      const hourlyRate = applicableRate?.hourlyRate || 0;
      const durationHours = (a.duration || 0) / 60;
      const grossAmount = Math.round(durationHours * hourlyRate * 100) / 100;
      const netAmount = Math.round(grossAmount / (1 + TAX_RATE) * 100) / 100;
      const taxAmount = Math.round((grossAmount - netAmount) * 100) / 100;

      return {
        dogId: a.dog.id,
        dogName: a.dog.name,
        ownerName: `${a.dog.owner.firstName} ${a.dog.owner.lastName}`,
        date: a.walk.date,
        duration: a.duration || 0,
        hourlyRate,
        amount: grossAmount,
        netAmount,
        taxAmount,
      };
    });

    const totalAmount = records.reduce((s, r) => s + r.amount, 0);
    const totalNet = records.reduce((s, r) => s + r.netAmount, 0);
    const totalTax = records.reduce((s, r) => s + r.taxAmount, 0);
    const totalDuration = records.reduce((s, r) => s + r.duration, 0);

    return {
      records,
      summary: {
        totalRecords: records.length,
        totalDuration,
        totalAmount: Math.round(totalAmount * 100) / 100,
        totalNet: Math.round(totalNet * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        totalGross: Math.round(totalAmount * 100) / 100,
        startDate: input.startDate,
        endDate: input.endDate,
        taxRate: TAX_RATE * 100,
      },
    };
  }

  generateInvoiceNumber(): string {
    const year = new Date().getFullYear();
    invoiceCounter += 1;
    const n = String(invoiceCounter).padStart(4, '0');
    return `INV-${year}-${n}`;
  }

  generateCSV(input: BillingReportInput): string {
    const headers = ['Rechnungsnr.', 'Datum', 'Hund', 'Besitzer', 'Dauer (Std)', 'Stundensatz', 'Netto', 'MwSt (19%)', 'Brutto'];
    const rows: string[] = [];

    // This will be populated when the report is called with actual data
    return rows.join('\n'); // placeholder — actual CSV generated in route
  }

  async exportCSV(input: BillingReportInput): Promise<string> {
    const report = await this.generateReport(input);
    const invoiceNumber = this.generateInvoiceNumber();

    const headers = ['Rechnungsnr.', 'Datum', 'Hund', 'Besitzer', 'Dauer (Std)', 'Stundensatz', 'Netto', 'MwSt (19%)', 'Brutto'];
    const rows = report.records.map(r => {
      const hours = (r.duration / 60).toFixed(2);
      return [
        invoiceNumber,
        r.date,
        `"${r.dogName}"`,
        `"${r.ownerName}"`,
        hours,
        r.hourlyRate.toFixed(2),
        r.netAmount.toFixed(2),
        r.taxAmount.toFixed(2),
        r.amount.toFixed(2),
      ];
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export const billingService = new BillingService();
