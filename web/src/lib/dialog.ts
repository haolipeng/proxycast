/**
 * File dialog for web version
 * Replaces Tauri plugin-dialog
 */

export interface OpenDialogOptions {
  multiple?: boolean;
  directory?: boolean;
  filters?: Array<{ name: string; extensions: string[] }>;
  defaultPath?: string;
  title?: string;
}

export interface SaveDialogOptions {
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  title?: string;
}

/**
 * Open file dialog
 * Returns file path(s) or null if cancelled
 */
export async function open(
  options?: OpenDialogOptions
): Promise<string | string[] | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = options?.multiple || false;

    if (options?.filters && options.filters.length > 0) {
      const accept = options.filters
        .flatMap((f) => f.extensions.map((ext) => `.${ext}`))
        .join(",");
      input.accept = accept;
    }

    input.onchange = () => {
      if (!input.files || input.files.length === 0) {
        resolve(null);
        return;
      }

      if (options?.multiple) {
        const paths = Array.from(input.files).map((f) => f.name);
        resolve(paths);
      } else {
        resolve(input.files[0].name);
      }
    };

    input.oncancel = () => resolve(null);
    input.click();
  });
}

/**
 * Save file dialog
 * Returns file path or null if cancelled
 */
export async function save(
  options?: SaveDialogOptions
): Promise<string | null> {
  // Web version: prompt for filename
  const defaultName = options?.defaultPath?.split("/").pop() || "file.txt";
  const filename = prompt("Enter filename:", defaultName);
  return filename;
}
