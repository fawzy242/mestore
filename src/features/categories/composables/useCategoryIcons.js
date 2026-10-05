/**
 * Static category→icon-name mapping. Returns the Iconify name directly;
 * consumers render it with <AppIcon :name="iconFor(name)" />.
 */
const MAP = {
  Beverages: 'local-cafe',
  'Snacks & Instant': 'lunch-dining',
  Bakery: 'bakery-dining',
  Staples: 'egg-alt',
  Household: 'cleaning-services',
}

export function useCategoryIcons() {
  function iconFor(name) {
    return MAP[name] || 'category'
  }
  return { iconFor }
}