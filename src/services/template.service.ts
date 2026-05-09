export class TemplateService {
  /**
   * Base wrapper for all emails to ensure consistent branding.
   */
  private static wrap(content: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; }
          .header { background: #6366f1; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; background: #ffffff; }
          .footer { background: #f9fafb; color: #6b7280; padding: 20px; text-align: center; font-size: 12px; }
          .button { background: #6366f1; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; margin-top: 20px; }
          .alert { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
          .info-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .info-table td { padding: 10px; border-bottom: 1px solid #f3f4f6; }
          .info-table td:first-child { font-weight: bold; color: #4b5563; width: 40%; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin:0; font-size: 24px;">BIG Ltd Operations</h1>
          </div>
          <div class="content">
            ${content}
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} BIG Ltd. All rights reserved.</p>
            <p>This is an automated system notification. Please do not reply directly to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Template for onboarding new Retailers/Wholesalers
   */
  static getOnboardingTemplate(name: string, role: string, email: string, tempPass: string): string {
    const content = `
      <h2>Welcome to BIG Ltd, ${name}!</h2>
      <p>An administrator has created your ${role} account on our platform. Below are your temporary login credentials:</p>
      <table class="info-table">
        <tr><td>Email:</td><td>${email}</td></tr>
        <tr><td>Temporary Password:</td><td><code>${tempPass}</code></td></tr>
      </table>
      <p><strong>Security Note:</strong> You will be required to change this password upon your first login.</p>
      <center>
        <a href="${process.env.BACKEND_URL || '#'}/login" class="button">Login to Your Account</a>
      </center>
    `;
    return this.wrap(content);
  }

  /**
   * Template for Low Stock Alerts
   */
  static getLowStockTemplate(productName: string, currentStock: number, threshold: number): string {
    const content = `
      <div class="alert">
        <h2 style="margin-top:0; color: #991b1b;">⚠️ Low Stock Alert</h2>
        <p>Your stock levels for <strong>${productName}</strong> have fallen below the recommended threshold.</p>
      </div>
      <table class="info-table">
        <tr><td>Product:</td><td>${productName}</td></tr>
        <tr><td>Current Stock:</td><td><span style="color: #ef4444; font-weight: bold;">${currentStock} units</span></td></tr>
        <tr><td>Alert Threshold:</td><td>${threshold} units</td></tr>
      </table>
      <p>Please reorder as soon as possible to ensure continuous operation.</p>
      <center>
        <a href="${process.env.BACKEND_URL || '#'}/inventory" class="button">Manage Inventory</a>
      </center>
    `;
    return this.wrap(content);
  }

  /**
   * Template for Wallet/Balance Notifications
   */
  static getWalletNotificationTemplate(type: 'LOW_BALANCE' | 'RECHARGE_SUCCESS', amount: number, balance: number, txRef?: string): string {
    const isLow = type === 'LOW_BALANCE';
    const content = `
      <h2>${isLow ? '⚠️ Wallet Balance Warning' : '✅ Wallet Recharge Successful'}</h2>
      <p>${isLow ? 'Your wallet balance is low. Please recharge to avoid service interruption.' : 'Your wallet has been successfully recharged.'}</p>
      <table class="info-table">
        <tr><td>Current Balance:</td><td><span style="font-size: 18px; font-weight: bold; color: ${isLow ? '#ef4444' : '#10b981'};">${balance.toLocaleString()} RWF</span></td></tr>
        ${txRef ? `<tr><td>Transaction Ref:</td><td>${txRef}</td></tr>` : ''}
        <tr><td>Timestamp:</td><td>${new Date().toLocaleString()}</td></tr>
      </table>
      <center>
        <a href="${process.env.BACKEND_URL || '#'}/wallet" class="button">${isLow ? 'Recharge Now' : 'View Wallet'}</a>
      </center>
    `;
    return this.wrap(content);
  }

  /**
   * Template for Order Confirmation
   */
  static getOrderConfirmationTemplate(orderNumber: string, quantity: number, totalAmount: number): string {
    const content = `
      <h2>✅ Order Confirmation</h2>
      <p>Your stock order has been submitted successfully.</p>
      <table class="info-table">
        <tr><td>Order Number:</td><td>#${orderNumber}</td></tr>
        <tr><td>Quantity:</td><td>${quantity} units</td></tr>
        <tr><td>Total Amount:</td><td>${totalAmount.toLocaleString()} RWF</td></tr>
        <tr><td>Estimated Delivery:</td><td>24-48 Hours</td></tr>
      </table>
      <p>We will notify you once your order has been dispatched.</p>
    `;
    return this.wrap(content);
  }
  /**
   * Template for Daily Performance Reports (Requirement 2.C.iv)
   */
  static getDailyPerformanceTemplate(metrics: { salesCount: number, revenue: number, newRetailers: number, newWholesalers: number, lowStockCount: number, offlineMeters: number, period: string }): string {
    const content = `
      <h2 style="color: #6366f1;">📊 Daily Operations Summary</h2>
      <p>Report Period: <strong>${metrics.period}</strong></p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0;">
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Total Sales</div>
          <div style="font-size: 20px; font-weight: bold;">${metrics.salesCount}</div>
        </div>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; text-align: center;">
          <div style="font-size: 12px; color: #6b7280; text-transform: uppercase;">Total Revenue</div>
          <div style="font-size: 20px; font-weight: bold; color: #10b981;">${metrics.revenue.toLocaleString()} RWF</div>
        </div>
      </div>

      <table class="info-table">
        <tr><td>New Retailers:</td><td>${metrics.newRetailers}</td></tr>
        <tr><td>New Wholesalers:</td><td>${metrics.newWholesalers}</td></tr>
        <tr><td>Products in Low Stock:</td><td><span style="color: #ef4444;">${metrics.lowStockCount}</span></td></tr>
        <tr><td>Offline Smart Meters:</td><td><span style="color: ${metrics.offlineMeters > 0 ? '#ef4444' : '#6b7280'};">${metrics.offlineMeters}</span></td></tr>
      </table>

      <p style="font-size: 13px; color: #6b7280; border-top: 1px solid #eee; padding-top: 15px;">
        This report is generated automatically to provide an overview of system performance and activity.
      </p>
    `;
    return this.wrap(content);
  }

  /**
   * Template for Account Action Alerts (PRD 2.A.iv)
   */
  static getAccountActionTemplate(action: 'SUSPENDED' | 'ACTIVATED', reason?: string): string {
    const isSuspended = action === 'SUSPENDED';
    const content = `
      <div class="alert" style="border-left-color: ${isSuspended ? '#ef4444' : '#10b981'}; background: ${isSuspended ? '#fee2e2' : '#ecfdf5'};">
        <h2 style="margin-top:0; color: ${isSuspended ? '#991b1b' : '#065f46'};">
          ${isSuspended ? '🚨 Account Suspension Notice' : '✅ Account Reactivated'}
        </h2>
        <p>This is an official notification regarding your BIG Ltd business account status.</p>
      </div>
      
      <p>Your account has been <strong>${action.toLowerCase()}</strong> by the system administrator.</p>
      
      <table class="info-table">
        <tr><td>Action:</td><td>${action}</td></tr>
        <tr><td>Timestamp:</td><td>${new Date().toLocaleString()}</td></tr>
        ${reason ? `<tr><td>Reason:</td><td>${reason}</td></tr>` : ''}
      </table>

      <p>${isSuspended 
        ? 'While suspended, you will not be able to process sales, place orders, or access your dashboard. If you believe this is an error, please contact BIG Ltd Support.' 
        : 'You now have full access to your dashboard and can resume normal business operations.'}
      </p>

      <center>
        <a href="${process.env.BACKEND_URL || '#'}/login" class="button">${isSuspended ? 'Contact Support' : 'Login Now'}</a>
      </center>
    `;
    return this.wrap(content);
  }
}
