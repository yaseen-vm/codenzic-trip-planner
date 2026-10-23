import type { LucideIcon } from 'lucide-react-native';
import { Building2, House, MapPin, Plane, Ship, TrainFront } from 'lucide-react-native';
import type { SavedPlace } from '../../constants/savedPlaces';
import type { PlaceSuggestion } from '../../types/places';

export type ListRow = {
  key: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  item: { kind: 'suggestion'; suggestion: PlaceSuggestion } | { kind: 'saved'; place: SavedPlace };
};

const SAVED_ICONS: Record<SavedPlace['icon'], LucideIcon> = {
  home: House,
  building: Building2,
  ferry: Ship,
  train: TrainFront,
  plane: Plane,
};

const ADDRESS_SEPARATOR = ', ';

/** Saved places whose name or address contains the (already lower-cased) query; all when empty. */
export function filterSavedPlaces(places: readonly SavedPlace[], query: string): SavedPlace[] {
  if (!query) return [...places];
  return places.filter(
    (place) =>
      place.name.toLowerCase().includes(query) || place.address.toLowerCase().includes(query),
  );
}

/** Live suggestions win; otherwise fall back to the saved places matching the query. */
export function buildRows(
  suggestions: readonly PlaceSuggestion[],
  savedPlaces: readonly SavedPlace[],
): ListRow[] {
  if (suggestions.length) {
    return suggestions.map((suggestion) => {
      const [title = suggestion.description, ...rest] =
        suggestion.description.split(ADDRESS_SEPARATOR);
      return {
        key: suggestion.placeId,
        title,
        subtitle: rest.join(ADDRESS_SEPARATOR) || undefined,
        icon: MapPin,
        item: { kind: 'suggestion', suggestion },
      };
    });
  }
  return savedPlaces.map((place) => ({
    key: place.id,
    title: place.name,
    subtitle: place.address,
    icon: SAVED_ICONS[place.icon],
    item: { kind: 'saved', place },
  }));
}
