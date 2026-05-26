function parseNumericToken(token: string): number | null {
  const trimmed = token.trim();
  if (!trimmed) return null;

  if (trimmed.includes('/')) {
    const [num, den] = trimmed.split('/');
    const numerator = Number(num);
    const denominator = Number(den);
    if (Number.isFinite(numerator) && Number.isFinite(denominator) && denominator !== 0) {
      return numerator / denominator;
    }
  }

  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

function formatScaledNumber(value: number): string {
  if (value >= 10 || Number.isInteger(value)) {
    return String(Math.round(value * 100) / 100).replace(/\.0+$/, '');
  }

  const commonFractions = [
    { value: 0.25, label: '1/4' },
    { value: 0.33, label: '1/3' },
    { value: 0.5, label: '1/2' },
    { value: 0.66, label: '2/3' },
    { value: 0.75, label: '3/4' },
  ];

  const whole = Math.floor(value);
  const remainder = value - whole;
  const matched = commonFractions.find((item) => Math.abs(item.value - remainder) < 0.04);

  if (matched) {
    return whole > 0 ? `${whole} ${matched.label}` : matched.label;
  }

  return String(Math.round(value * 100) / 100).replace(/\.0+$/, '');
}

function scaleSingleToken(token: string, factor: number): string {
  const parsed = parseNumericToken(token);
  if (parsed === null) return token;
  return formatScaledNumber(parsed * factor);
}

export function getBaseServings(serves: string): number {
  const matches = serves.match(/\d+/g);
  if (!matches?.length) return 2;
  const values = matches.map(Number).filter(Number.isFinite);
  if (!values.length) return 2;
  return Math.max(1, Math.round(values.reduce((sum, value) => sum + value, 0) / values.length));
}

export function scaleQuantity(
  quantity: string,
  servings: number,
  baseServings: number,
): string {
  if (!quantity || baseServings <= 0 || servings <= 0) return quantity;

  const factor = servings / baseServings;
  if (Math.abs(factor - 1) < 0.01 || /to taste/i.test(quantity)) {
    return quantity;
  }

  return quantity.replace(
    /\b\d+(?:\/\d+)?(?:\s*[-–]\s*\d+(?:\/\d+)?)?\b/g,
    (match) => {
      if (match.includes('-') || match.includes('–')) {
        const [left, right] = match.split(/[-–]/).map((part) => part.trim());
        return `${scaleSingleToken(left, factor)}-${scaleSingleToken(right, factor)}`;
      }
      return scaleSingleToken(match, factor);
    },
  );
}

export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
