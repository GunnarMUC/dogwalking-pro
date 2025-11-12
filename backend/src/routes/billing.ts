import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.js';
import type { BillingReportRequest, BillingRecord } from '@dogwalking/shared';

export const billingRouter = Router();

// All routes require authentication and admin role
billingRouter.use(authenticate, requireAdmin);

// Get billing report
billingRouter.post('/report', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, dogId, ownerId } = req.body as BillingReportRequest;

    // Build where clause
    const whereClause: any = {
      walk: {
        date: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      attended: true,
      duration: { not: null }
    };

    if (dogId) {
      whereClause.dogId = dogId;
    }

    if (ownerId) {
      whereClause.dog = {
        ownerId
      };
    }

    // Get all attendances in date range
    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        dog: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            rates: {
              orderBy: { effectiveFrom: 'desc' }
            }
          }
        },
        walk: {
          select: {
            date: true,
            startTime: true,
            endTime: true
          }
        }
      },
      orderBy: {
        walk: {
          date: 'desc'
        }
      }
    });

    // Calculate billing records
    const billingRecords: BillingRecord[] = attendances.map(attendance => {
      // Find applicable rate
      const walkDate = new Date(attendance.walk.date);
      const applicableRate = attendance.dog.rates.find(
        rate => new Date(rate.effectiveFrom) <= walkDate
      );

      const hourlyRate = applicableRate?.hourlyRate || 0;
      const durationHours = (attendance.duration || 0) / 60;
      const amount = durationHours * hourlyRate;

      return {
        dogId: attendance.dog.id,
        dogName: attendance.dog.name,
        ownerName: `${attendance.dog.owner.firstName} ${attendance.dog.owner.lastName}`,
        date: attendance.walk.date,
        duration: attendance.duration || 0,
        hourlyRate,
        amount: Math.round(amount * 100) / 100
      };
    });

    // Calculate totals
    const totalDuration = billingRecords.reduce((sum, record) => sum + record.duration, 0);
    const totalAmount = billingRecords.reduce((sum, record) => sum + record.amount, 0);

    res.json({
      records: billingRecords,
      summary: {
        totalRecords: billingRecords.length,
        totalDuration,
        totalAmount: Math.round(totalAmount * 100) / 100,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Billing report error:', error);
    res.status(500).json({ error: 'Failed to generate billing report' });
  }
});

// Export billing report as CSV
billingRouter.post('/export/csv', async (req: AuthRequest, res) => {
  try {
    const { startDate, endDate, dogId, ownerId } = req.body as BillingReportRequest;

    // Build where clause (same as report endpoint)
    const whereClause: any = {
      walk: {
        date: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      },
      attended: true,
      duration: { not: null }
    };

    if (dogId) {
      whereClause.dogId = dogId;
    }

    if (ownerId) {
      whereClause.dog = {
        ownerId
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        dog: {
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true
              }
            },
            rates: {
              orderBy: { effectiveFrom: 'desc' }
            }
          }
        },
        walk: {
          select: {
            date: true
          }
        }
      },
      orderBy: {
        walk: {
          date: 'desc'
        }
      }
    });

    // Generate CSV
    const headers = ['Datum', 'Hund', 'Besitzer', 'Dauer (Min)', 'Stundensatz (€)', 'Betrag (€)'];
    const rows = attendances.map(attendance => {
      const walkDate = new Date(attendance.walk.date);
      const applicableRate = attendance.dog.rates.find(
        rate => new Date(rate.effectiveFrom) <= walkDate
      );

      const hourlyRate = applicableRate?.hourlyRate || 0;
      const durationHours = (attendance.duration || 0) / 60;
      const amount = Math.round(durationHours * hourlyRate * 100) / 100;

      return [
        attendance.walk.date,
        attendance.dog.name,
        `${attendance.dog.owner.firstName} ${attendance.dog.owner.lastName}`,
        attendance.duration || 0,
        hourlyRate.toFixed(2),
        amount.toFixed(2)
      ];
    });

    const csv = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=billing-${startDate}-${endDate}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: 'Failed to export CSV' });
  }
});

