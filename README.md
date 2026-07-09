# Circle Mobile - Social Networking App

A React Native mobile application built with Expo that enables users to create and join social circles, participate in polls, and connect with friends through location-based features.

## 🚀 Features

### Core Functionality
- **User Authentication**: Email/password sign-in
- **Social Circles**: Create and join location-based social groups
- **Real-time Polling**: Activity and place voting within circles
- **Friend System**: Send/receive friend requests and manage connections
- **Profile Management**: Customizable profiles with avatar and cover photos
- **Multi-language Support**: English and Arabic with RTL support
- **Dark/Light Theme**: Dynamic theme switching
- **Location Services**: GPS-based circle discovery and mapping

### Advanced Features
- **Flash Circles**: Temporary circles with automatic expiration
- **Event Management**: Create and join events within circles
- **Image Upload**: Cloudinary integration for profile images
- **Push Notifications**: Real-time updates and notifications
- **Moderation System**: User reporting and blocking capabilities
- **Statistics Tracking**: User engagement and activity metrics

## 🛠 Tech Stack

### Frontend
- **React Native** (0.81.5) - Mobile app framework
- **Expo** (^54.0.23) - Development platform
- **React Navigation** (7.x) - Navigation library
- **Redux Toolkit** (2.8.2) - State management
- **React Native Maps** - Location and mapping
- **Expo Image Picker** - Image selection and camera access
- **React** (19.1.0) - UI library

### Backend
- **Firebase** (11.10.0) - Backend as a Service
  - Authentication
  - Firestore Database
  - Cloud Functions
  - Cloud Storage
- **Cloudinary** - Image hosting and optimization

### Development Tools
- **ESLint** - Code linting
- **Babel** - JavaScript compilation
- **Metro** - React Native bundler

## 📱 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd circle-mobile
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Firebase Functions dependencies**
   ```bash
   cd functions
   npm install
   cd ..
   ```

4. **Configure Firebase**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication, Firestore, and Cloud Functions
   - Download `google-services.json` and place it in the project root
   - Update Firebase configuration in `src/firebase/config.js`

5. **Configure Cloudinary**
   - Create a Cloudinary account
   - Update credentials in `functions/index.js`

6. **Start the development server**
   ```bash
   npm start
   ```

## 🏗 Project Structure

```
circle-mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── constants/           # App constants and themes
│   ├── context/            # React Context providers
│   ├── data/               # Static data and configurations
│   ├── firebase/           # Firebase configuration
│   ├── hooks/              # Custom React hooks
│   ├── localization/       # i18n translations
│   ├── navigation/         # Navigation configuration
│   ├── screens/            # Screen components
│   └── utils/              # Utility functions
├── functions/              # Firebase Cloud Functions
├── assets/                 # Static assets (images, icons)
├── android/               # Android-specific files
├── App.js                 # Main app component
└── package.json           # Dependencies and scripts
```

### Key Directories

#### `/src/screens/`
- **Auth Screens/**: Sign-in and sign-up flows
- **Circle/**: Circle viewing and interaction
- **Circle Creation/**: Circle creation workflow
- **Profile/**: User profile management
- **Settings/**: App settings and preferences

#### `/src/utils/`
- **userStatsManager.js**: User statistics and social features
- **userProfileManager.js**: Profile management utilities
- **cloudinaryUpload.js**: Image upload functionality
- **userValidation.js**: Input validation helpers

#### `/functions/`
- **index.js**: Cloud Functions for automated tasks
  - Expired circle cleanup
  - Poll result processing
  - Image upload/deletion

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_API_KEY=your_api_key
```

### Firebase Security Rules
Configure Firestore security rules for proper data access control:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Circles are readable by members
    match /circles/{circleId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || request.auth.uid in resource.data.members);
    }
  }
}
```

## 🚀 Available Scripts

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web

# Deploy Firebase Functions
cd functions && npm run deploy

# Run Firebase Functions locally
cd functions && npm run serve
```

## 📊 Database Structure

### Users Collection
```javascript
{
  username: "unique_username",
  email: "user@example.com",
  phoneNumber: "+1234567890",
  avatarPhoto: "cloudinary_url",
  coverPhoto: "cloudinary_url",
  bio: "User bio",
  dateOfBirth: "2000-01-01T00:00:00.000Z",
  location: "City, Country",
  interests: ["interest1", "interest2"],
  friends: ["userId1", "userId2"],
  friendRequests: {
    sent: ["userId1"],
    received: ["userId2"]
  },
  joinedCircles: ["circleId1"],
  joinedEvents: ["eventId1"],
  stats: {
    circles: 0,
    connections: 0,
    events: 0
  },
  reported: 0,
  isBlocked: false
}
```

### Circles Collection
```javascript
{
  name: "Circle Name",
  description: "Circle description",
  type: "permanent" | "flash",
  location: {
    latitude: 0.0,
    longitude: 0.0,
    address: "Location address"
  },
  members: ["userId1", "userId2"],
  createdBy: "userId",
  createdAt: "timestamp",
  expiryDate: "timestamp", // for flash circles
  isPrivate: false,
  polls: {
    activityPoll: {
      status: "active" | "closed",
      options: [{ text: "Option 1", votes: 0 }],
      deadline: "timestamp",
      votes: { "userId": "optionText" }
    },
    placePoll: { /* similar structure */ }
  }
}
```

## 🌐 Internationalization

The app supports multiple languages with RTL support:

- **English** (default)
- **Arabic** with RTL layout

Translation files are located in `src/localization/translations/`.

### Adding New Languages

1. Create translation file: `src/localization/translations/[language].js`
2. Add language to `i18n.js` configuration
3. Update `getSupportedLanguages()` function

## 🎨 Theming

The app supports dynamic theming with predefined color schemes:

- **Dark Theme**: Default dark mode with glass morphism effects
- **Light Theme**: Clean light mode interface

Theme configuration is in `src/constants/constants.js`.

## 🔐 Security Features

- **Input Validation**: Comprehensive validation for all user inputs
- **Authentication**: Firebase Auth with secure token management
- **Data Privacy**: User data is protected with Firestore security rules
- **Image Security**: Cloudinary handles secure image uploads
- **Moderation**: Built-in reporting and blocking system

## 📱 Platform Support

- **Android**: Full native support with adaptive icons
- **iOS**: Complete iOS integration with proper permissions
- **Web**: Progressive web app capabilities

## 🧪 Testing

```bash
# Run tests (when implemented)
npm test

# Run linting
npm run lint

# Type checking (if TypeScript is added)
npm run type-check
```

## 🚀 Deployment

### Android
1. Build APK: `expo build:android`
2. Upload to Google Play Store

### iOS
1. Build IPA: `expo build:ios`
2. Upload to App Store Connect

### Firebase Functions
```bash
cd functions
npm run deploy
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation in `/docs/`
- Review the troubleshooting guide

## 🔄 Version History

- **v1.0.0**: Initial release with core social features
- **v1.1.0**: Added polling system and flash circles
- **v1.2.0**: Implemented friend system and events

---

Built with ❤️ using React Native and Firebase