import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async getStatistics() {
    try {
      // Products statistics
      const productsTotal = await this.getCount('SELECT COUNT(*) as total FROM jos_virtuemart_products');
      const productsPublished = await this.getCount(
        "SELECT COUNT(*) as total FROM jos_virtuemart_products WHERE published = 1"
      );
      const productsUnpublished = await this.getCount(
        "SELECT COUNT(*) as total FROM jos_virtuemart_products WHERE published = 0"
      );

      // Categories statistics
      const categoriesTotal = await this.getCount(
        "SELECT COUNT(*) as total FROM jos_virtuemart_categories"
      );
      const categoriesPublished = await this.getCount(
        "SELECT COUNT(*) as total FROM jos_virtuemart_categories WHERE published = 1"
      );

      // Brands statistics
      const brandsTotal = await this.getCount(
        "SELECT COUNT(*) as total FROM jos_virtuemart_manufacturers"
      );
      const brandsPublished = await this.getCount(
        "SELECT COUNT(*) as total FROM jos_virtuemart_manufacturers WHERE published = 1"
      );

      // Orders statistics
      const ordersTotal = await this.getCount('SELECT COUNT(*) as total FROM jos_virtuemart_orders');
      
      // Revenue (sum of order_total from jos_virtuemart_orders)
      const revenueResult = await this.dataSource.query(
        "SELECT SUM(order_total) as total_revenue FROM jos_virtuemart_orders WHERE order_status = 'C' OR order_status = 'P'"
      );
      const totalRevenueRaw = revenueResult[0]?.total_revenue;
      const totalRevenue = totalRevenueRaw ? parseFloat(String(totalRevenueRaw)) : 0;

      // Recent orders (last 10)
      const recentOrders = await this.dataSource.query(
        `SELECT 
          o.virtuemart_order_id as id,
          o.order_number,
          o.order_total,
          o.order_status,
          CONCAT(oui.first_name, ' ', oui.last_name) as customer_name
        FROM jos_virtuemart_orders o
        LEFT JOIN jos_virtuemart_order_userinfos oui ON o.virtuemart_order_id = oui.virtuemart_order_id AND oui.address_type = 'BT'
        ORDER BY o.virtuemart_order_id DESC
        LIMIT 10`
      );

      // Top products by inventory value
      const topProducts = await this.dataSource.query(
        `SELECT 
          p.virtuemart_product_id as id,
          pr.product_name as name,
          p.product_in_stock as stock,
          COALESCE(ppr.product_price, 0) as price,
          (p.product_in_stock * COALESCE(ppr.product_price, 0)) as inventory_value
        FROM jos_virtuemart_products p
        INNER JOIN jos_virtuemart_products_ru_ru pr ON p.virtuemart_product_id = pr.virtuemart_product_id
        LEFT JOIN jos_virtuemart_product_prices ppr ON p.virtuemart_product_id = ppr.virtuemart_product_id
        WHERE p.published = 1
        GROUP BY p.virtuemart_product_id, pr.product_name, p.product_in_stock, ppr.product_price
        ORDER BY inventory_value DESC
        LIMIT 10`
      );

      // Low stock products
      const lowStockProducts = await this.dataSource.query(
        `SELECT 
          p.virtuemart_product_id as id,
          pr.product_name as name,
          p.product_in_stock as stock
        FROM jos_virtuemart_products p
        INNER JOIN jos_virtuemart_products_ru_ru pr ON p.virtuemart_product_id = pr.virtuemart_product_id
        WHERE p.published = 1 AND p.product_in_stock <= 5
        ORDER BY p.product_in_stock ASC
        LIMIT 10`
      );

      return {
        products: {
          total: productsTotal,
          published: productsPublished,
          unpublished: productsUnpublished,
        },
        categories: {
          total: categoriesTotal,
          published: categoriesPublished,
        },
        brands: {
          total: brandsTotal,
          published: brandsPublished,
        },
        orders: {
          total: ordersTotal,
          recent: recentOrders,
        },
        revenue: {
          total: Number(totalRevenue.toFixed(2)),
        },
        inventory: {
          topProducts: topProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            stock: parseInt(p.stock),
            price: parseFloat(p.price),
            inventoryValue: Number((parseFloat(String(p.inventory_value || 0))).toFixed(2)),
          })),
          lowStock: lowStockProducts.map((p: any) => ({
            id: p.id,
            name: p.name,
            stock: parseInt(p.stock),
          })),
        },
      };
    } catch (error: any) {
      this.logger.error(`Failed to get statistics: ${error.message}`, error.stack);
      return {
        products: { total: 0, published: 0, unpublished: 0 },
        categories: { total: 0, published: 0 },
        brands: { total: 0, published: 0 },
        orders: { total: 0, recent: [] },
        revenue: { total: 0 },
        inventory: { topProducts: [], lowStock: [] },
      };
    }
  }

  private async getCount(query: string): Promise<number> {
    const result = await this.dataSource.query(query);
    if (!result || !result[0]) {
      this.logger.log(`getCount returned empty for: ${query}`);
      return 0;
    }
    const row = result[0];
    // Get first value from row object
    const values = Object.values(row);
    this.logger.log(`getCount result for '${query.substring(0, 50)}...': ${JSON.stringify(row)}`);
    return parseInt(String(values[0] ?? 0));
  }

  async getRecentRequests(limit: number = 20) {
    // If requests are stored in DB (legacy)
    try {
      const requests = await this.dataSource.query(
        `SELECT 
          r.id,
          r.type,
          r.status,
          r.data,
          r.created_at as createdAt
        FROM requests r
        ORDER BY r.created_at DESC
        LIMIT ?`,
        [limit]
      );
      return requests;
    } catch (error) {
      // Table might not exist
      return [];
    }
  }
}
