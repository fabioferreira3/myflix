# MyFlix - Baron iFrame Integration

## Overview

MyFlix is designed to run as an embedded iframe within the Baron application. Users authenticate through Baron, and their session is shared with MyFlix without requiring separate login credentials.

## Architecture

```
┌─────────────────────────────────────────────┐
│              Baron (Main App)               │
│  - User authenticates here                  │
│  - Stores session in SQLite database        │
│  - Embeds MyFlix as iframe                  │
└──────────────┬──────────────────────────────┘
               │ Session ID passed via URL
               ↓
┌─────────────────────────────────────────────┐
│           MyFlix (Iframe App)               │
│  - Reads Baron's session from database      │
│  - Authenticates user automatically         │
│  - No separate login required               │
└─────────────────────────────────────────────┘
```

## How It Works

### 1. Initial Load

When a user clicks "MyFlix" in Baron's navigation:

1. **Baron** renders the MyFlix page component (`/baron/resources/js/pages/MyFlix.vue`)
2. **Baron's backend** (`/baron/routes/web.php`) retrieves the current session ID via `session()->getId()`
3. **Baron's frontend** constructs the iframe URL: `http://localhost:9000?baron_session_id={sessionId}`
4. **MyFlix loads** in the iframe with the session ID as a URL parameter

### 2. Authentication Flow

#### MyFlix Middleware Stack

1. **BaronSessionAuth** (`/myflix/app/Http/Middleware/BaronSessionAuth.php`)
   - Runs on every request
   - Checks for `baron_session_id` parameter in the URL
   - Connects to Baron's SQLite database
   - Queries Baron's `sessions` table
   - Decodes the session payload (base64-encoded serialized data)
   - Extracts user ID from `login_web_*` key
   - Looks up user in MyFlix's database
   - Sets authenticated user for the request via `Auth::setUser($user)`

2. **RequireBaronOrIframe** (`/myflix/app/Http/Middleware/RequireBaronOrIframe.php`)
   - Security layer to prevent unauthorized access
   - Allows access if:
     - Request has `baron_session_id` parameter (initial load)
     - User is authenticated via Baron session
     - Request is from an iframe with Baron as referer
   - Redirects to `/forbidden` if none of the above conditions are met

3. **HandleInertiaRequests** (`/myflix/app/Http/Middleware/HandleInertiaRequests.php`)
   - Shares authenticated user data with frontend
   - Provides fallback to "Guest" user if auth is unavailable on specific requests

### 3. Frontend Handling

The MyFlix frontend (`/myflix/resources/js/Layouts/AuthenticatedLayout.tsx`) gracefully handles cases where user data may not be available on every request by:
- Using a guest user placeholder when `auth.user` is null
- Displaying actual user info when Baron authentication succeeds

## Key Components

### Baron Components

#### 1. MyFlix Route (`/baron/routes/web.php`)
```php
Route::get('myflix', function () {
    return Inertia::render('MyFlix', [
        'sessionId' => session()->getId(),
    ]);
})->middleware(['auth', 'verified'])->name('myflix');
```

#### 2. MyFlix Page Component (`/baron/resources/js/pages/MyFlix.vue`)
```vue
<script setup lang="ts">
interface Props {
    sessionId: string;
}

const props = defineProps<Props>();
const myFlixUrl = computed(() => {
    if (props.sessionId) {
        return `http://localhost:9000?baron_session_id=${props.sessionId}`;
    }
    return 'http://localhost:9000';
});
</script>

<template>
    <iframe :src="myFlixUrl" ... />
</template>
```

### MyFlix Components

#### 1. BaronSessionAuth Middleware
- **Location**: `/myflix/app/Http/Middleware/BaronSessionAuth.php`
- **Purpose**: Read Baron's session and authenticate users
- **Key Logic**:
  - Extracts `baron_session_id` from URL parameter
  - Connects to Baron's database (configured as `baron` connection)
  - Reads session from Baron's `sessions` table
  - Decodes Laravel session format (base64 + serialization)
  - Finds user ID from `login_web_{hash}` key
  - Authenticates user for current request

#### 2. RequireBaronOrIframe Middleware
- **Location**: `/myflix/app/Http/Middleware/RequireBaronOrIframe.php`
- **Purpose**: Security - prevent unauthorized direct access
- **Checks**:
  - Has `baron_session_id` parameter?
  - User authenticated via Baron?
  - Request from iframe with Baron referer?

#### 3. Database Configuration
- **Location**: `/myflix/config/database.php`
- **Baron Connection**:
```php
'baron' => [
    'driver' => 'sqlite',
    'database' => '/baron-database/database.sqlite',
    // Mounted via Docker volume
],
```

#### 4. Docker Volume Mount
- **Location**: `/myflix/docker-compose.yml`
```yaml
volumes:
    - '/home/fabio/projects/baron/database:/baron-database:ro'
```

## Configuration

### MyFlix Configuration Files

#### 1. Authentication Config (`/myflix/config/auth.php`)
```php
'baron_session_cookie' => 'baron_session',
'baron_session_connection' => 'baron',
'baron_session_table' => 'sessions',
```

#### 2. Session Config (`/myflix/config/session.php`)
```php
'same_site' => null,  // Allows cross-origin iframe cookies
'secure' => false,    // Set to true in production with HTTPS
'partitioned' => true,
```

#### 3. Database Config (`/myflix/config/database.php`)
```php
'baron' => [
    'driver' => 'sqlite',
    'database' => '/baron-database/database.sqlite',
],
```

### Required Docker Setup

MyFlix must mount Baron's database directory:

```yaml
volumes:
    - '/home/fabio/projects/baron/database:/baron-database:ro'
```

**Note**: The `:ro` flag makes it read-only for safety.

## Security Considerations

### 1. No Direct Access
- MyFlix cannot be accessed directly at `http://localhost:9000`
- The `RequireBaronOrIframe` middleware blocks unauthorized requests
- Only accessible through Baron's authenticated interface

### 2. Shared User Database
- Both Baron and MyFlix use the **same user IDs**
- User must exist in both databases with matching IDs
- Baron's session user ID is looked up in MyFlix's user table

### 3. Session Security
- Baron's session is read-only from MyFlix
- MyFlix never modifies Baron's session
- Session data is validated before use

### 4. Database Access
- MyFlix has **read-only** access to Baron's database (`:ro` mount)
- Only reads from the `sessions` table
- No write operations possible

## Removed Features

To enable iframe integration, the following features were **removed** from MyFlix:

1. **Login/Logout Routes** - No longer needed (auth via Baron)
2. **Registration** - Users register through Baron
3. **Password Reset** - Managed by Baron
4. **Email Verification** - Managed by Baron
5. **All Auth Controllers** - Removed from `/myflix/app/Http/Controllers/Auth/`
6. **All Auth Pages** - Removed from `/myflix/resources/js/Pages/Auth/`
7. **Auth Routes File** - `/myflix/routes/auth.php` (commented out)

## Troubleshooting

### Issue: 403 Forbidden Page

**Cause**: Baron session ID not being passed or authentication failing

**Solutions**:
1. Check Baron is running and user is logged in
2. Verify Baron's session ID is in the iframe URL
3. Check MyFlix logs: `docker exec myflix-app tail -f storage/logs/laravel.log`
4. Verify Baron database is mounted: `docker exec myflix-app ls -la /baron-database/`

### Issue: "Loading... Authenticating with Baron"

**Cause**: User authentication not completing

**Solutions**:
1. Check user exists in both Baron and MyFlix databases with same ID
2. Verify Baron's session table has the user_id under `login_web_*` key
3. Check MyFlix logs for authentication errors

### Issue: User Shows as "Guest"

**Cause**: Subsequent requests not authenticated (expected behavior)

**Explanation**: This is normal. The first request authenticates, subsequent requests may not have the baron_session_id. The app still functions, just shows "Guest" temporarily.

## Development Setup

### Baron

```bash
# Baron runs with Laravel Sail
cd /home/fabio/projects/baron
./vendor/bin/sail up -d
```

### MyFlix

```bash
# MyFlix runs in Docker
cd /home/fabio/projects/myflix
docker compose up -d

# Verify Baron database is accessible
docker exec myflix-app ls -la /baron-database/
```

### Accessing MyFlix

1. Navigate to Baron: `http://localhost` (or your Baron URL)
2. Login to Baron
3. Click "MyFlix" in the navigation
4. MyFlix loads in an iframe with Baron header still visible

## Production Considerations

### 1. HTTPS Required

For production, both apps must use HTTPS:

```php
// MyFlix: config/session.php
'secure' => true,  // Enable for HTTPS
'same_site' => 'none',  // Required for cross-origin iframes with HTTPS
```

### 2. Domain Configuration

If Baron and MyFlix are on different domains:

```php
// MyFlix: config/session.php
'domain' => '.yourdomain.com',  // Shared domain for cookie access
```

### 3. Database Connection

For production, use a shared database server or API instead of file mounts:

```php
'baron' => [
    'driver' => 'mysql',
    'host' => env('BARON_DB_HOST'),
    'database' => env('BARON_DB_DATABASE'),
    'username' => env('BARON_DB_USERNAME'),
    'password' => env('BARON_DB_PASSWORD'),
],
```

### 4. Security Headers

Configure appropriate CSP headers in Baron to allow MyFlix iframe:

```php
'frame-ancestors' => ['self', 'https://yourdomain.com'],
```

## Technical Notes

### Why This Approach?

1. **Session Cookies Don't Work in Cross-Origin iframes**: Modern browsers block third-party cookies, making traditional session sharing impossible
2. **URL Parameter Solution**: Passing session ID via URL parameter works reliably
3. **Per-Request Authentication**: Each request authenticates independently using the baron_session_id
4. **No Session Persistence in MyFlix**: MyFlix doesn't maintain its own sessions, reducing complexity

### Limitations

1. **Same User IDs Required**: Baron and MyFlix must share user IDs
2. **Database Access Required**: MyFlix needs read access to Baron's sessions table
3. **Guest User Fallback**: Some requests may show "Guest" when auth data isn't available (cosmetic only)

## Maintenance

### Adding New Protected Routes

Add the `baron.iframe` middleware to any new routes that should require authentication:

```php
Route::get('/new-feature', [FeatureController::class, 'index'])
    ->middleware(['baron.iframe'])
    ->name('new-feature');
```

### Updating User Data

Since Baron is the source of truth for authentication:
- User updates should be done in Baron
- MyFlix reads user data from its own database
- Ensure user tables stay synchronized between apps

## Summary

MyFlix successfully operates as an embedded iframe within Baron by:

1. ✅ Receiving Baron's session ID via URL parameter
2. ✅ Reading Baron's session data from its SQLite database
3. ✅ Authenticating users on each request without requiring login
4. ✅ Preventing unauthorized direct access via middleware
5. ✅ Maintaining Baron's header navigation while showing MyFlix content
6. ✅ Providing seamless user experience without additional login steps

