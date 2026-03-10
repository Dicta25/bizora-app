export function formatCurrency(amount: number): string {
  return `GH₵ ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1_000_000) return `GH₵ ${(amount / 1_000_000).toFixed(1)}M`;
  if (abs >= 10_000) return `GH₵ ${Math.round(amount / 1_000)}K`;
  if (abs >= 1_000) return `GH₵ ${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 86400000;

  if (diff < oneDay && now.getDate() === date.getDate()) return 'Today';
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth()) return 'Yesterday';
  
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}
