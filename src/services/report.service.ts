
import prisma from '../utils/prisma';

export class ReportService {
  /**
   * Collects metrics for the last 24 hours
   */
  static async getDailyPerformanceMetrics() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    const [
      salesCount,
      totalRevenue,
      newRetailers,
      newWholesalers,
      lowStockProducts,
      offlineMetersCount
    ] = await Promise.all([
      // 1. Total Sales in 24h
      prisma.sale.count({
        where: { createdAt: { gte: yesterday } }
      }),
      // 2. Total Revenue in 24h
      prisma.sale.aggregate({
        where: { createdAt: { gte: yesterday } },
        _sum: { totalAmount: true }
      }),
      // 3. New Retailers
      prisma.retailerProfile.count({
        where: { createdAt: { gte: yesterday } }
      }),
      // 4. New Wholesalers (Querying User table as profile lacks createdAt)
      prisma.user.count({
        where: { 
          role: 'wholesaler',
          createdAt: { gte: yesterday } 
        }
      }),
      // 5. Products below threshold
      prisma.product.count({
        where: {
          stock: { lte: 10 },
          retailerId: { not: null }
        }
      }),
      // 6. Offline Smart Meters (PRD 2.C.ii)
      prisma.gasMeter.count({
        where: { status: { not: 'active' } }
      })
    ]);

    return {
      salesCount,
      revenue: totalRevenue._sum.totalAmount || 0,
      newRetailers,
      newWholesalers,
      lowStockCount: lowStockProducts,
      offlineMeters: offlineMetersCount,
      period: `${yesterday.toLocaleDateString()} - ${now.toLocaleDateString()}`
    };
  }
}
