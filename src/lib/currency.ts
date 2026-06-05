export const countryConfig = {
  ALL: {
    symbol: '$',
    code: 'USD',
    shippingThreshold: 50,
    shippingFee: 5,
  },
  US: {
    symbol: '$',
    code: 'USD',
    shippingThreshold: 50,
    shippingFee: 5,
  },
  UK: {
    symbol: '£',
    code: 'GBP',
    shippingThreshold: 40,
    shippingFee: 4,
  },
};

export function formatPrice(price: number, country: 'US' | 'UK' | 'ALL' | string = 'US') {
  const code = country === 'UK' ? 'UK' : 'US'; // Fallback to US
  const config = countryConfig[code];
  return `${config.symbol}${price.toFixed(2)}`;
}
