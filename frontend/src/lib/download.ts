export function downloadBlob(data: Blob, filename: string): void {
  const url = URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Retain Object URL for 60s so Windows save dialogs & disk streams complete safely
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 60000);
}

