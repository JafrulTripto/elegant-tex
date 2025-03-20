# Toast Notifications in Elegant-Tex

This document provides an overview of the toast notification system implemented in the Elegant-Tex application.

## Overview

Toast notifications are brief, non-modal messages that appear temporarily on the screen to provide feedback to users about the result of an action. They are useful for displaying success messages, error notifications, warnings, or general information without interrupting the user's workflow.

In Elegant-Tex, we use the [notistack](https://iamhosseindhv.com/notistack) library to implement toast notifications. Notistack is built on top of Material UI's Snackbar component and provides additional features like stacking multiple notifications.

## Implementation

The toast notification system is implemented using the following components:

1. **ToastContext**: A React context that provides the toast notification functionality to the entire application.
2. **ToastProvider**: A provider component that wraps the application and provides the toast notification context.
3. **useToast**: A custom hook that allows components to access the toast notification functionality.

## Usage

### Basic Usage

To use toast notifications in your component:

```tsx
import React from 'react';
import { Button } from '@mui/material';
import { useToast } from '../contexts/ToastContext';

const MyComponent: React.FC = () => {
  const { showToast } = useToast();
  
  const handleClick = () => {
    // Show a success toast notification
    showToast('Operation completed successfully!', 'success');
  };
  
  return (
    <Button onClick={handleClick}>
      Perform Action
    </Button>
  );
};

export default MyComponent;
```

### Available Variants

The `showToast` function accepts two parameters:
1. `message`: The message to display in the toast notification.
2. `variant`: The type of toast notification to display. Available variants are:
   - `default`: Default toast notification (gray)
   - `success`: Success toast notification (green)
   - `error`: Error toast notification (red)
   - `warning`: Warning toast notification (orange/yellow)
   - `info`: Information toast notification (blue)

### Examples

```tsx
// Success notification
showToast('Profile updated successfully', 'success');

// Error notification
showToast('Failed to update profile', 'error');

// Warning notification
showToast('Your session will expire soon', 'warning');

// Info notification
showToast('New features are available', 'info');

// Default notification
showToast('Your notification has been sent');
```

## Configuration

The toast notification system is configured in the `ToastContext.tsx` file. The default configuration includes:

- Maximum of 3 notifications displayed at once
- Positioned at the top-right corner of the screen
- Auto-hide after 3 seconds

To modify these settings, update the `ToastProvider` component in the `ToastContext.tsx` file.

## Example Component

For a complete example of how to use toast notifications, see the `ToastExample.tsx` component in the `components/common` directory. This component demonstrates how to display different types of toast notifications.

## Best Practices

1. **Use appropriate variants**: Choose the appropriate variant based on the type of message you want to convey.
2. **Keep messages concise**: Toast notifications should be brief and to the point.
3. **Use for non-critical information**: Toast notifications are temporary and may be missed by users. For critical information, consider using a modal dialog or a more persistent notification.
4. **Provide actionable information**: When possible, include information about what the user can do next.
5. **Be consistent**: Use toast notifications consistently throughout the application for similar types of feedback.
