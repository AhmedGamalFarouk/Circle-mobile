# AdminConfirmationState Component

This component displays the UI for when voting is complete but the event is waiting for admin confirmation.

## Features

- **Status Indicator**: Shows that the event is pending admin review with a visual indicator
- **Voting Results Summary**: Displays the winning activity and location from the polls
- **Informational Message**: Explains what happens next in the process

## Usage

To use this component in the ContextualPin, set the `currentStage` to `'Waiting for Admin Confirmation'`:

```jsx
<ContextualPin
  currentStage="Waiting for Admin Confirmation"
  eventData={{
    winningActivity: "Movie Night",
    winningPlace: "Central Cinema"
  }}
/>
```

## Props

- `eventData`: Object containing:
  - `winningActivity`: String - The activity that won the poll
  - `winningPlace`: String - The location that won the poll

## Visual Design

- Uses theme colors for consistency
- Warning color scheme to indicate pending status
- Clean, organized layout with clear sections
- Responsive design that works on different screen sizes
- Subtle animations and visual feedback