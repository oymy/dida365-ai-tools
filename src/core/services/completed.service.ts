import { getCompletedTasks } from "../api-client.js";
import type { Dida365Task, CompletedTasksParams } from "../types.js";

/**
 * Service for managing completed tasks
 * Uses private API endpoints - may change without notice
 */
export class CompletedTaskService {
  /**
   * Get completed tasks for a specific date
   * @param date - The date to query
   * @param timezone - Optional timezone (default: Asia/Shanghai)
   * @returns List of completed tasks
   */
  async getByDate(date: Date, timezone?: string): Promise<Dida365Task[]> {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    return this.getByDateRange(start, end, timezone);
  }

  /**
   * Get completed tasks within a date range
   * @param startDate - Start date
   * @param endDate - End date
   * @param timezone - Optional timezone (default: Asia/Shanghai)
   * @returns List of completed tasks
   */
  async getByDateRange(
    startDate: Date,
    endDate: Date,
    timezone?: string
  ): Promise<Dida365Task[]> {
    // Validate date range
    if (startDate > endDate) {
      throw new Error("Start date must be before or equal to end date");
    }

    // Convert to UTC (simple implementation - can be enhanced with timezone libraries)
    const fromUTC = this.toUTC(startDate, timezone);
    const toUTC = this.toUTC(endDate, timezone);

    // Format dates for API
    const params: CompletedTasksParams = {
      from: this.formatDate(fromUTC),
      to: this.formatDate(toUTC),
      limit: 100,
    };

    return getCompletedTasks(params);
  }

  /**
   * Get completed tasks for today
   * @param timezone - Optional timezone (default: Asia/Shanghai)
   * @returns List of completed tasks
   */
  async getToday(timezone?: string): Promise<Dida365Task[]> {
    return this.getByDate(new Date(), timezone);
  }

  /**
   * Get completed tasks for yesterday
   * @param timezone - Optional timezone (default: Asia/Shanghai)
   * @returns List of completed tasks
   */
  async getYesterday(timezone?: string): Promise<Dida365Task[]> {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return this.getByDate(yesterday, timezone);
  }

  /**
   * Get completed tasks for this week
   * @param timezone - Optional timezone (default: Asia/Shanghai)
   * @returns List of completed tasks
   */
  async getThisWeek(timezone?: string): Promise<Dida365Task[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
    endOfWeek.setHours(23, 59, 59, 999);

    return this.getByDateRange(startOfWeek, endOfWeek, timezone);
  }

  /**
   * Convert a date interpreted in the given timezone to UTC.
   * Uses Intl API (no external dependencies).
   */
  private toUTC(date: Date, timezone: string = "Asia/Shanghai"): Date {
    const localStr = date.toLocaleString("en-US", { timeZone: timezone });
    const localDate = new Date(localStr);
    const offset = date.getTime() - localDate.getTime();
    return new Date(date.getTime() + offset);
  }

  /**
   * Format date for API query
   * @param date - Date to format
   * @returns Formatted string in 'YYYY-MM-DD HH:mm:ss' format
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}
