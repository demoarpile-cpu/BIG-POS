
import { emailQueue } from './email.queue';
import { ReportService } from '../services/report.service';
import { TemplateService } from '../services/template.service';

/**
 * Initializes all system-wide scheduled jobs
 */
export const initScheduler = async () => {
  console.log('⏰ [Scheduler] Initializing system scheduled jobs...');

  // 1. Daily Performance Report (Runs every day at midnight)
  // Cron: '0 0 * * *'
  await emailQueue.add(
    'daily-performance-report',
    {}, // Data will be fetched during processing to be fresh
    {
      repeat: { pattern: '0 0 * * *' },
      jobId: 'daily-report' // Unique ID to prevent duplicates
    }
  );

  console.log('✅ [Scheduler] Scheduled jobs configured.');
};

/**
 * Logic to process scheduled tasks when they are triggered by the worker
 */
export const processScheduledTask = async (jobName: string) => {
  if (jobName === 'daily-performance-report') {
    console.log('📊 [Scheduler] Generating Daily Performance Report...');
    
    const metrics = await ReportService.getDailyPerformanceMetrics();
    
    await emailQueue.add('send-daily-report', {
      to: 'admin@big.co.rw',
      subject: `📊 Daily Operations Summary - ${new Date().toLocaleDateString()}`,
      html: TemplateService.getDailyPerformanceTemplate(metrics),
      templateType: 'SYSTEM_DAILY_REPORT'
    });
    
    console.log('✅ [Scheduler] Daily Report queued for delivery.');
  }
};
