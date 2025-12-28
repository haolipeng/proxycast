/**
 * Shell operations for web version
 * Replaces Tauri plugin-shell
 */

/**
 * Open URL in browser
 */
export async function open(url: string): Promise<void> {
  window.open(url, "_blank", "noopener,noreferrer");
}
