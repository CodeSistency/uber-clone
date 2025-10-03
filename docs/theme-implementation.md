## Theme System (Light/Dark) - Implementation Notes

### Color Palette

- primary: `#FFFFFF`
- primary-dark: `#363531`
- secondary (brand yellow): `#FFE014`
- terciary: `#000000`
- accent: `#737268`

Exposed in Tailwind as `brand.primary`, `brand.primaryDark`, `brand.secondary`, `brand.tertiary`, `brand.accent`.

### Tailwind/NativeWind

- Enabled `darkMode: 'class'` in `tailwind.config.js`.
- Added brand palette under `extend.colors.brand`.

### State and Persistence

- Added `themeStorage` in `app/lib/storage.ts` with key `APP_THEME`.
- Expanded `useUIStore` with fields and actions:
  - `theme: 'light' | 'dark'`
  - `systemTheme: 'light' | 'dark'`
  - `setTheme(theme: 'light' | 'dark' | 'system')`
  - `toggleTheme()`
  - `loadTheme()`

On app start, `UIWrapper` calls `loadTheme()` and sets a top-level `View` class to `dark` when active. This allows `dark:` prefixed Tailwind classes.

### Components Updated

- `CustomButton`: Uses brand yellow as primary background; text adapts (`text-black dark:text-white`).
- `InputField`: Labels and inputs adopt `dark` colors and placeholders; container uses `brand.primaryDark` in dark mode.

### Auth Screens Themed

- `(auth)/welcome.tsx`, `(auth)/sign-in.tsx`, `(auth)/sign-up.tsx` now use brand backgrounds and dark variants. Indicators/buttons follow brand yellow for emphasis.

### Usage

Use the UI hook:

```tsx
import { useUI } from "@/components/UIWrapper";

const { theme, toggleTheme, setTheme } = useUI();
```

Optionally add a toggle in any header:

```tsx
<TouchableOpacity onPress={toggleTheme}>
  <Text className="text-black dark:text-white">
    {theme === "dark" ? "☀️" : "🌙"}
  </Text>
</TouchableOpacity>
```

### Design Mapping

- Light mode: surfaces `brand.primary` (white), text `brand.tertiary` (black), accents `brand.secondary` (yellow).
- Dark mode: surfaces `brand.primaryDark` (363531), text `#FFFFFF`, accents `brand.secondary`.

### Future Work

- Extend to tabs, headers, map overlays, and marketplace cards.
- Extract a `ThemeToggle` component and place in global app header.
- Audit icon assets for dark backgrounds.
