# AI Suggestions Setup Guide

## Overview
The Circle mobile app now includes AI-powered poll suggestions for activity polls. This feature automatically generates 3 relevant activity options based on the circle's interests when the user clicks the AI suggestions button. Each suggestion is kept short and concise (1-3 words maximum).

## Setup Instructions

### 1. Get OpenRouter API Key
1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Sign up for an account
3. Generate an API key
4. Copy your API key

### 2. Configure Environment Variables
Create a `.env` file in your project root with:

```bash
OPENROUTER_API_KEY=your_actual_api_key_here
```

### 3. Dependencies
The required packages are already installed:
- `dotenv` - for environment variable management
- `expo-constants` - for accessing environment variables
- Built-in `fetch` API - for HTTP requests (no additional package needed)

### 4. Restart Development Server
After adding the `.env` file, restart your Expo development server:

```bash
expo start --clear
```

## How It Works

1. **User opens activity poll creation** in a circle
2. **Clicks "Get AI Suggestions"** button (no question required)
3. **AI analyzes circle interests** automatically
4. **Generates 3 short activity options** (1-3 words each) based on interests
5. **Options are automatically populated** in the poll form
6. **User can edit/modify** the AI suggestions before launching the poll

## Features

- ✅ **Automatic Interest Detection** - Uses circle's existing interests
- ✅ **No Question Required** - AI suggestions work immediately
- ✅ **Exactly 3 Options** - Perfect for quick polls
- ✅ **Short & Concise** - Each option is only 1-3 words
- ✅ **Interest-Based Suggestions** - Relevant to the circle's theme
- ✅ **Only for Activity Polls** - Not available for place polls
- ✅ **Loading States** - Shows spinner while generating
- ✅ **Error Handling** - Graceful fallbacks for API failures
- ✅ **Editable Results** - Users can modify AI suggestions
- ✅ **Uses Built-in Fetch API** - No external dependencies

## Example Output

For a circle with interests like "gaming, movies, food", the AI might generate:
- **Gaming Night**
- **Movie Marathon** 
- **Food Festival**

## Requirements

- Circle must have at least one interest defined
- Only works for activity polls (not place polls)
- Requires valid OpenRouter API key

## Troubleshooting

### API Key Not Found
- Ensure `.env` file exists in project root
- Check that `OPENROUTER_API_KEY` is set correctly
- Restart development server after changes

### API Errors
- Verify your OpenRouter API key is valid
- Check your API usage limits
- Ensure internet connectivity

### No AI Button Showing
- Verify the circle has interests defined
- Ensure you're creating an activity poll (not place poll)
- Check that the circle data is properly loaded

### Suggestions Not Loading
- Check browser console for error messages
- Verify the circle has interests
- Check network tab for failed API requests

### Bundling Issues
- The app now uses the built-in `fetch` API instead of axios
- No external HTTP client dependencies required
- More reliable in React Native/Expo environments
