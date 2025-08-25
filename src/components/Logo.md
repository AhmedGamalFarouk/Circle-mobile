# Circle Logo Component

A React Native SVG logo component for the Circle mobile application.

## Features

- **React Native Compatible**: Uses `react-native-svg` instead of web SVG
- **Theme Integration**: Automatically adapts to light/dark themes using the app's ThemeContext
- **Customizable Size**: Accepts width and height props for different use cases
- **Gradient Support**: Features a modern gradient design with concentric circles
- **Accessible**: Includes proper accessibility support

## Usage

### Basic Usage

```jsx
import Logo from '../components/Logo';

// Default size (48x48)
<Logo />
```

### Custom Sizes

```jsx
// Small logo for navigation
<Logo width={24} height={24} />

// Medium logo for headers
<Logo width={48} height={48} />

// Large logo for splash screens
<Logo width={96} height={96} />
```

### With Additional Props

```jsx
// Pass additional SVG props
<Logo 
  width={60} 
  height={60} 
  style={{ margin: 10 }}
/>
```

## Design Elements

- **Outer Circle**: Gradient stroke using primary and accent colors
- **C Shape**: Abstract "C" representing "Circle" using text color
- **Central Dot**: Solid circle using primary color
- **Gradient**: Linear gradient from primary to accent color

## Theme Colors Used

- `colors.primary`: Main brand color for gradient start and central dot
- `colors.accent`: Secondary brand color for gradient end
- `colors.text`: Text color for the "C" shape

## Dependencies

- `react-native-svg`: For SVG rendering in React Native
- `../context/ThemeContext`: For theme-aware color management

## Testing

To see the logo in different sizes, navigate to the `LogoExample` screen in the app:

```jsx
// In your navigation or testing
import LogoExample from '../components/LogoExample';
```

## Migration from Web SVG

This component was refactored from a web-based SVG component with the following changes:

1. **Import Changes**: 
   - From: `<svg>` HTML element
   - To: `react-native-svg` components

2. **Props Changes**:
   - From: `className` and CSS variables
   - To: `width`/`height` props and theme context

3. **Color Management**:
   - From: CSS custom properties (`var(--color-primary)`)
   - To: Theme context colors (`colors.primary`)

4. **Accessibility**:
   - Maintained through proper component structure
   - Can be enhanced with additional accessibility props as needed