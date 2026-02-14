import {
  batchTagOperation,
  renameTag,
  mergeTags,
  deleteTags,
  batchCheck,
} from "../api-client.js";
import type { Dida365Tag } from "../types.js";

/**
 * Service for managing tags
 * Uses private API endpoints
 */
export class TagService {
  /**
   * List all tags (via batch sync)
   */
  async listAll(): Promise<Dida365Tag[]> {
    const data = await batchCheck();
    return data.tags || [];
  }

  /**
   * Create a single tag
   */
  async create(tag: Dida365Tag): Promise<unknown> {
    return batchTagOperation({ add: [tag] });
  }

  /**
   * Create multiple tags at once
   */
  async createBatch(tags: Dida365Tag[]): Promise<unknown> {
    return batchTagOperation({ add: tags });
  }

  /**
   * Update a tag's properties (color, sortOrder, sortType, parent)
   */
  async update(tag: Dida365Tag): Promise<unknown> {
    return batchTagOperation({ update: [tag] });
  }

  /**
   * Update multiple tags at once
   */
  async updateBatch(tags: Dida365Tag[]): Promise<unknown> {
    return batchTagOperation({ update: tags });
  }

  /**
   * Rename a tag
   * @param oldName - Current tag name
   * @param newName - New tag name
   */
  async rename(oldName: string, newName: string): Promise<unknown> {
    return renameTag(oldName, newName);
  }

  /**
   * Set tag color
   * @param name - Tag name
   * @param color - Color string (e.g., "#ff0000")
   */
  async setColor(name: string, color: string): Promise<unknown> {
    return batchTagOperation({
      update: [{ name, color }],
    });
  }

  /**
   * Set tag parent (nesting)
   * @param name - Tag name
   * @param parent - Parent tag name (empty string to remove parent)
   */
  async setParent(name: string, parent: string): Promise<unknown> {
    return batchTagOperation({
      update: [{ name, parent }],
    });
  }

  /**
   * Merge one tag into another
   * All tasks with fromTag will be updated to toTag
   * @param fromTag - Tag to merge from (will be deleted)
   * @param toTag - Tag to merge into (will remain)
   */
  async merge(fromTag: string, toTag: string): Promise<unknown> {
    return mergeTags(fromTag, toTag);
  }

  /**
   * Delete a single tag
   */
  async delete(tagName: string): Promise<unknown> {
    return deleteTags([tagName]);
  }

  /**
   * Delete multiple tags at once
   */
  async deleteBatch(tagNames: string[]): Promise<unknown> {
    return deleteTags(tagNames);
  }
}
