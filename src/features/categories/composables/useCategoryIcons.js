import IconLocalCafe from '@/components/icons/IconLocalCafe.vue'
import IconLunchDining from '@/components/icons/IconLunchDining.vue'
import IconBakeryDining from '@/components/icons/IconBakeryDining.vue'
import IconEggAlt from '@/components/icons/IconEggAlt.vue'
import IconCleaningServices from '@/components/icons/IconCleaningServices.vue'
import IconCategory from '@/components/icons/IconCategory.vue'

/**
 * Static category→icon mapping. Used by the Categories table and the
 * Product form's category display. Falls back to a generic icon for
 * user-created categories.
 */
const MAP = {
  Beverages: IconLocalCafe,
  'Snacks & Instant': IconLunchDining,
  Bakery: IconBakeryDining,
  Staples: IconEggAlt,
  Household: IconCleaningServices,
}

export function useCategoryIcons() {
  function iconFor(name) {
    return MAP[name] || IconCategory
  }
  return { iconFor }
}