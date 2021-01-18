# Build Jetstream-like application step by step using Bootstrap 5, Fortify, Inertia, React with Laravel

If you join the Laravel world for short time and not an expert like me, but you want to learn about Jetstream more, it’s for you. This article is quite long and tries to re-implement it to help you understand more. I believe it can help you understand Jetstream in a practical way. This article tries to mimic features of Jetstream from scratch, build the demo step by step. It’s not a best practice but it wants to show you most of the Jetstream features and give you the ability to custom them.

And also, It’s not 100% the same with Jetstream. I pick different frameworks and libraries. Once you understand it you can change anything you want.

The biggest difference is using React and Bootstrap here.

- [Build Jetstream-like application step by step using Bootstrap 5, Fortify, Inertia, React with Laravel](#build-jetstream-like-application-step-by-step-using-bootstrap-5--fortify--inertia--react-with-laravel)
  * [Initialize Project](#initialize-project)
  * [Inertia with React](#inertia-with-react)
    + [Server Side - Laravel](#server-side---laravel)
    + [Client Side](#client-side)
    + [Install Ziggy](#install-ziggy)
  * [Install Bootstrap 5](#install-bootstrap-5)
    + [(Optional) Support @ alias](#-optional--support---alias)
  * [Jetstream-like features](#jetstream-like-features)
    + [Install Fortify](#install-fortify)
    + [Enable VerifyEmail (AWS SES)](#enable-verifyemail--aws-ses-)
    + [Fortify Provider Configuration](#fortify-provider-configuration)
    + [HandleInertiaRequests Middleware](#handleinertiarequests-middleware)
    + [Authentication Views for FortifyServiceProvider](#authentication-views-for-fortifyserviceprovider)
      - [AppLayout.js](#applayoutjs)
      - [Login.js](#loginjs)
      - [Register.js](#registerjs)
      - [ForgotPassword.js](#forgotpasswordjs)
      - [ResetPassword.js](#resetpasswordjs)
      - [VerifyEmail.js](#verifyemailjs)
      - [Dashboard.js](#dashboardjs)
    + [User Profile](#user-profile)
      - [Common components](#common-components)
      - [Profile information](#profile-information)
      - [Update Password](#update-password)
      - [Two-factor Authentication](#two-factor-authentication)
      - [Browser Sessions](#browser-sessions)
      - [Delete Account](#delete-account)
    + [Laravel Sanctum with API Tokens](#laravel-sanctum-with-api-tokens)
    + [Teams & Roles](#teams---roles)

> If you are an experienced developer and want to check out code directly. Please feel free to visit [Github](https://github.com/andyyou/react-jetstream-like-demo). I split steps into the different commits. Hope it can help you.

## Initialize Project

Create a new project

```sh
$ laravel new demo
$ cd demo
$ npm install

# Run
$ php artisan serve
$ npm run watch
```

We will use PostgreSQL here. Let's create database by GUI or command line through `createdb [DATABASE_NAME]`, then edit `.env` for database.

```sh
$ createdb demo
```

```yaml
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=demo
DB_USERNAME=homestead
DB_PASSWORD=secret
```

The `DB_USERNAME` and `DB_PASSWORD` is following homestead settings, you can change to yours.

Next step is run migrations.

```sh
$ php artisan migrate
```

## Inertia with React

### Server Side - Laravel

```sh
$ composer require inertiajs/inertia-laravel
```

Create root template `resources/views/app.blade.php` for Inertia.

```php
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <!-- Styles -->
  <link rel="stylesheet" href="{{ mix('css/app.css') }}">

  <!-- Scripts -->
  <script src="{{ mix('js/app.js') }}" defer></script>
  <title>{{ config('app.name', 'Demo') }}</title>
</head>
<body>
    @inertia
</body>
</html>
```

Generate Inertia middleware.

```sh
$ php artisan inertia:middleware
```

Modify `app/Http/Kernel.php` that add middleware as last option in `web` middleware group.

```php
'web' => [
  // ...
  \App\Http\Middleware\HandleInertiaRequests::class,
],
```

### Client Side

Originally, Jetstream uses Vue with Inertia, but we change to React.

First, install dependencies.

```sh
$ npm i @inertiajs/inertia @inertiajs/inertia-react react react-dom @inertiajs/progress
```

Update `resources/js/app.js` 

```js
import './bootstrap';
import React from 'react';
import { render } from 'react-dom';
import { App } from '@inertiajs/inertia-react';
import { InertiaProgress } from '@inertiajs/progress';

InertiaProgress.init();
const el = document.getElementById('app');

render(
  <App
    initialPage={JSON.parse(el.dataset.page)}
    resolveComponent={(name) => require(`./pages/${name}.js`).default}
  />,
  el
);
```

Remember to change `webpack.mix.js` to support React/JSX syntax.

NOTE: Laravel updates quite fast, if you meet error please check out [official docs](https://laravel.com/docs/8.x/mix#react). 

```js
mix.js('resources/js/app.js', 'public/js')
    .react()
    .postCss('resources/css/app.css', 'public/css', [
        //
    ]);
```

Add a `Welcome` component with simple route to test settings currently.

```js
// resources/js/pages/Welcome.js

import React from 'react';

const Welcome = () => (
  <div>Welcome, React</div>
);

export default Welcome;
```

In `routes/web.php`

```php
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome');
});
```

Run commands for test and you can remove it after test successfully.

```sh
$ php artisan serve
$ npm run watch
```



### Install Ziggy

Install [ziggy](https://github.com/tighten/ziggy) to support `route()` in front end.

```sh
$ composer require tightenco/ziggy
```

Add `@routes` in `app.blade.php` 

```html
<!-- Scripts -->
@routes
<script src="{{ mix('js/app.js') }}" defer></script>
```

To test `route()` we need to have two components at least. You can define anything you want and we can use `route()` in component. The route is defined through Laravel route system which in `app/routes/web.php` means you don't need to build JavaScript version by your self.

```js
// resources/js/pages/Welcome.js

import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';

const Welcome = () => (
  <div>
    Welcome, Visit <InertiaLink href={route('dummy')}>Dummy</InertiaLink>
  </div>
);

export default Welcome;
```

```js
// resources/js/pages/Dummy.js

import React from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';

const Dummy = () => (
  <div>
    Dummy, Visit <InertiaLink href={route('home')}>Welcome</InertiaLink>
  </div>
);

export default Dummy;
```

Remember routes

```php
Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');
Route::get('/dummy', function () {
    return Inertia::render('Dummy');
})->name('dummy');
```



Make sure `APP_URL` of  `.env` is correct, because `route()` will generate the URL contains domain. For more information you can reference to [Ziggy](https://github.com/tighten/ziggy).

```yaml
APP_URL=http://127.0.0.1:8000
```

Most of content above you can find in [Inertia JS docs](https://inertiajs.com/). It's simply a summary.

##  Install Bootstrap 5

Install Bootstrap 5 by npm. For more information please [check out](https://getbootstrap.com/docs/5.0/getting-started/download/)

> Be aware it's in beta and maybe update later.

```sh
$ npm i bootstrap@next @popperjs/core -D
```

In `resources/js/bootstrap.js` import bootstrap.

```js
require('bootstrap');
```

Remove `resources/css` folder and create `resources/sass` folder with `app.scss` instead.

```sh
$ rm -rf resources/css
$ mkdir resources/sass
$ touch resources/sass/app.scss
```

Open `resources/sass/app.scss` and import bootstrap stylesheet

```scss
@import "~bootstrap/scss/bootstrap";
```

Modify `webpack.mix.js`

```js
mix.js('resources/js/app.js', 'public/js')
  .react()
  .sass('resources/sass/app.scss', 'public/css');
```

###  (Optional) Support @ alias

Create a `webpack.config.js`

```sh
$ touch webpack.config.js
```

`webpack.config.js`:

```js
const path = require('path');

module.exports = {
  resolve: {
    alias: {
      '@': path.resolve('resources/js'),
    },
  },
};
```

Modify `webpack.mix.js`

```js
const mix = require('laravel-mix');
// ...
mix.js('resources/js/app.js', 'public/js')
  .react()
  .sass('resources/sass/app.scss', 'public/css')
  .webpackConfig(require('./webpack.config'));
```

After complete this settings, you can import JavaScript with `@` prefix. It references to `resources/js` folder.

For example

```js
import Page from '@/pages/YourPage`;
```

## Jetstream-like features

### Install Fortify

Fortify support our authentication backend implementation. Jetstream support many features, it use Fortify to support authentication.

Install `laravel/fortify` and publish vendor resources.

```sh
$ composer require laravel/fortify
$ php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
$ php artisan migrate
```

Go to `config/app.php` register provider - `App\Providers\FortifyServiceProvider::class`

```php
'providers' => [
    /*
     * Laravel Framework Service Providers...
     */

    // ...

    /*
     * Application Service Providers...
     */
  	// ...
    App\Providers\RouteServiceProvider::class,
    App\Providers\FortifyServiceProvider::class,

],
```

In `config/fortify.php`, uncomment features you need.

```php
'features' => [
    Features::registration(),
    Features::resetPasswords(),
    Features::emailVerification(),
    Features::updateProfileInformation(),
    Features::updatePasswords(),
    Features::twoFactorAuthentication([
        'confirmPassword' => true,
    ]),
],
```

###  Enable VerifyEmail (AWS SES)

In this example we will support email verification and use AWS SES.

Remember uncomment `Features::emailVerification()`. Please feel free to change it if you want to use other solution to handle email service.

Install dependencies for AWS

```sh
$ composer require aws/aws-sdk-php
```

Configure `.env` with values. Ensure `MAIL_MAILER`,  `MAIL_FROM_ADDRESS` and `AWS_*` with value.

```
MAIL_MAILER=ses
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=your@example.com
MAIL_FROM_NAME="${APP_NAME}"


AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=
AWS_BUCKET=
```

Then `User` model should implement `MustVerifyEmail`

```php
namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    // ...
}
```

### Fortify Provider Configuration

Go to `app/Providers/FortifyServiceProvider.php` , in `boot` method add.

```php
Fortify::loginView(function () {
    return Inertia::render('Auth/Login');
});

Fortify::registerView(function () {
    return Inertia::render('Auth/Register');
});

Fortify::requestPasswordResetLinkView(function () {
    return Inertia::render('Auth/ForgotPassword');
});

Fortify::resetPasswordView(function ($request) {
    return Inertia::render('Auth/ResetPassword', [
        'request' => $request,
    ]);
});

Fortify::verifyEmailView(function () {
    return Inertia::render('Auth/VerifyEmail');
});

Fortify::twoFactorChallengeView(function () {
    return Inertia::render('Auth/TwoFactorAuthentication');
});
```

As mention before, Fortify support authentication backend for us, and we can provide custom views with React and Inertia. That's why you can see `Inertia::render` in example. Don't worry for now I will share you code of views later. 

Don't forgot `use Inertia\Inertia;` in provider file.

### HandleInertiaRequests Middleware

To access data in our page components such `user`'s data from backend we can use share data of `app/Http/Middleware/HandleInertiaRequests.php` . If you want to read more example you can reference JetStream's [source code on Github](https://github.com/laravel/jetstream/blob/2.x/src/Http/Middleware/ShareInertiaData.php). That's the secret Jetstream share data in `jetstream` field. For convenient, we share CSRF token and all sessions, but you should minimum share data in real production.

```php
use Illuminate\Support\Facades\Session;

public function share(Request $request)
{
    return array_merge(parent::share($request), [
        'user' => function () use ($request) {
            if (!$request->user()) {
                return;
            }

            return array_merge(
              $request->user()->toArray(),
              [
                'two_factor_enabled' => ! is_null($request->user()->two_factor_secret),
              ]
            );
        },
        '_token' => function () {
            return Session::token();
        },
        '_session' => function () {
            return Session::all();
        },
    ]);
}
```

### Authentication Views for FortifyServiceProvider

Now we can complete features such as login, register, forgot password, reset password etc.

Create folders and components

```sh
$ mkdir resources/js/pages/Auth
$ mkdir resources/js/layouts
$ touch resources/js/layouts/AppLayout.js
$ touch resources/js/pages/Auth/Login.js
$ touch resources/js/pages/Auth/Register.js
$ touch resources/js/pages/Auth/ForgotPassword.js
$ touch resources/js/pages/Auth/ResetPassword.js
$ touch resources/js/pages/Auth/VerifyEmail.js
$ touch resources/js/pages/Dashboard.js

# Install dependencies
$ npm i styled-components react-hook-form
# In very first version, I try build everything without packages but it quite redundant
# So I pick two very common packages.  
```

#### AppLayout.js

Some of `route()` may not define yet, you can use `#` first, once we complete features you can back and update links.

```js
// resources/js/layouts/AppLayout.js
import React, { useCallback } from 'react';
import { createGlobalStyle } from 'styled-components';
import { Inertia } from '@inertiajs/inertia';
import { usePage, InertiaLink } from '@inertiajs/inertia-react';

const GlobalStyle = createGlobalStyle`
  html,
  body,
  #app {
    height: 100%;
    font-family: "Source Sans Pro";
  }
`;

const AppLayout = ({ children }) => {
  const {
    props: {
      user,
    },
  } = usePage();

  const handleLogout = useCallback(async (e) => {
    e.preventDefault();
    Inertia.post(route('logout'));
  }, []);

  return (
    <div className="d-flex flex-column h-100">
      <nav className="navbar navbar-expand-md navbar-light border-bottom">
        <div className="container">
          <InertiaLink className="navbar-brand" href="/">Brand</InertiaLink>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar-content" aria-controls="navbar-content" aria-expanded="false" aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbar-content">
            <ul className="navbar-nav ms-auto me-md-3">
              <li className="nav-item">
                <InertiaLink className="nav-link active" href={route('dashboard')}>Dashboard</InertiaLink>
              </li>
            </ul>
            <ul className="navbar-nav me-auto">
              {!user ? (
                <>
                  <li className="nav-item">
                    <InertiaLink className="nav-link" href={route('register')}>Register</InertiaLink>
                  </li>
                  <li className="nav-item">
                    <InertiaLink className="nav-link" href={route('login')}>Login</InertiaLink>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" id="user-menu" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                      {user.name}
                    </a>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="user-menu">
                      <li><h6 className="dropdown-header">Manage Account</h6></li>
                      <li><InertiaLink className="dropdown-item" href="#">Profile</InertiaLink></li>
                      <li><InertiaLink className="dropdown-item" href="#">API Token</InertiaLink></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><h6 className="dropdown-header">Manage Team</h6></li>
                      <li><InertiaLink className="dropdown-item" href="#">Team Settings</InertiaLink></li>
                      <li><InertiaLink className="dropdown-item" href="#">Create New Team</InertiaLink></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li><h6 className="dropdown-header">Switch Teams</h6></li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <InertiaLink className="dropdown-item" href="#" onClick={handleLogout}>
                          Logout
                        </InertiaLink>
                      </li>
                    </ul>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
      <main className="flex-fill">
        {children}
      </main>
      <footer className="text-center p-4">
        CopyRight@andyyou
      </footer>
      <GlobalStyle />
    </div>
  );
};

export default AppLayout;
```

#### Login.js

```js
// resources/js/pages/Auth/Login.js
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage, InertiaLink } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';

const Login = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
  } = props;

  const {
    _old_input: old = {},
  } = _session;

  const {
    register,
    handleSubmit,
  } = useForm();
  
  const submit = (data) => {
    Inertia.post(route('login'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="container">
      <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Login</h5>
            <hr />

            <form onSubmit={handleSubmit(submit)} noValidate="">
              <div className="mb-3">
                <label htmlFor="email" className={['form-label', errors['email'] ? 'is-invalid' : ''].join(' ')}>Email</label>
                <input type="text" className="form-control" id="email" name="email" defaultValue={old.email} ref={register} />
                {errors['email'] && (
                  <div className="invalid-feedback">
                    {errors['email']}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="password" className={['form-label', errors['password'] ? 'is-invalid' : ''].join(' ')}>Password</label>
                <input type="password" className="form-control" id="password" name="password" ref={register} />
                {errors['password'] && (
                  <div className="invalid-feedback">
                    {errors['password']}
                  </div>
                )}
              </div>

              <div className="mb-3 form-check">
                <input type="checkbox" className="form-check-input" id="remember_me" name="remember_me" defaultChecked={old.remember_me} ref={register} />
                <label className="form-check-label" htmlFor="remember_me">Remember Me</label>
              </div>

              <div className="d-flex justify-content-end align-items-center">
                <InertiaLink href={route('password.request')} className="link-secondary me-3">
                  Forgot Password ?
                </InertiaLink>
                <button type="submit" className="btn btn-sm btn-dark">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

Login.layout = page => <AppLayout children={page} title="Login" />
export default Login;
```

#### Register.js

```js
// resources/js/pages/Auth/Register.js
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage, InertiaLink } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';

const Register = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
  } = props;

  const {
    _old_input: old = {},
  } = _session;

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.post(route('register'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Register</h5>
          <hr />

          <form onSubmit={handleSubmit(submit)} noValidate="">
            <div className="mb-3">
              <label htmlFor="name" className={['form-label', errors['name'] ? 'is-invalid' : ''].join(' ')}>Name</label>
              <input type="text" className="form-control" id="name" name="name" defaultValue={old.name} ref={register} />
              {errors['name'] && (
                <div className="invalid-feedback">
                  {errors['name']}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="email" className={['form-label', errors['email'] ? 'is-invalid' : ''].join(' ')}>Email</label>
              <input type="text" className="form-control" id="email" name="email" defaultValue={old.value} ref={register} />
              {errors['email'] && (
                <div className="invalid-feedback">
                  {errors['email']}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className={['form-label', errors['password'] ? 'is-invalid' : ''].join(' ')}>Password</label>
              <input type="password" className="form-control" id="password" name="password" defaultValue={old.password} ref={register} />
              {errors['password'] && (
                <div className="invalid-feedback">
                  {errors['password']}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password_confirmation" className={['form-label', errors['password_confirmation'] ? 'is-invalid' : ''].join(' ')}>Password Confirmation</label>
              <input type="password" className="form-control" id="password_confirmation" name="password_confirmation" defaultValue={old.password_confirmation} ref={register} />
              {errors['password_confirmation'] && (
                <div className="invalid-feedback">
                  {errors['password_confirmation']}
                </div>
              )}
            </div>
            
            <div className="d-flex justify-content-end align-items-center">
              <InertiaLink href={route('login')} className="link-secondary me-3">
                Already have account?
              </InertiaLink>
              <button type="submit" className="btn btn-sm btn-dark">
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

Register.layout = page => <AppLayout children={page} title="Register" />
export default Register;
```

#### ForgotPassword.js

```js
// resources/js/pages/Auth/ForgotPassword.js
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';

const ForgotPassword = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
  } = props;

  const {
    status,
    _old_input: old = {},
  } = _session;

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.post(route('password.email'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
      <div className="card">
        <div className="card-body">
          <h5>Reset Password</h5>
          <hr />

          {status && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              {status}
              <button type="button" className="btn-close" data-dismiss="alert" aria-label="Close"></button>
            </div>
          )}
          
          <p>
            Forgot your password? No problem. Just let us know your email address and we will email you a password reset link that will allow you to choose a new one.
          </p>

          <form onSubmit={handleSubmit(submit)} noValidate="">
            <div className="mb-3">
              <label htmlFor="email" className={['form-label', errors['email'] ? 'is-invalid' : ''].join(' ')}>Email</label>
              <input type="text" className="form-control" id="email" name="email" defaultValue={old.email} ref={register} />
              {errors['email'] && (
                <div className="invalid-feedback">
                  {errors['email']}
                </div>
              )}
            </div>

            <div className="d-flex justify-content-end align-items-center">
              <button type="submit" className="btn btn-sm btn-dark">
                Send Password Reset Link
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ForgotPassword.layout = page => <AppLayout children={page} title="Forgot Password" />
export default ForgotPassword;
```

#### ResetPassword.js

```js
// resources/js/pages/Auth/ResetPassword.js
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';

const getToken = (url) => {
  const regex = /reset-password\/([\w]+)\?email=([\w@.]+)/;
  const matches = decodeURIComponent(url).match(regex);

  return matches[1];
};

const ResetPassword = () => {
  const {
    props,
    url,
  } = usePage();

  const {
    _session,
    errors,
    request,
  } = props;

  const {
    _old_input: old = {},
  } = _session;

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    const token = getToken(url);
    Inertia.post(route('password.update'), {
      ...data,
      token: token,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Reset Password</h5>
          <hr />

          <form onSubmit={handleSubmit(submit)} noValidate="">
            <div className="mb-3">
              <label htmlFor="email" className={['form-label', errors['email'] ? 'is-invalid' : ''].join(' ')}>Email</label>
              <input type="email" className="form-control" id="email" name="email" defaultValue={old.email || request.email} ref={register} />
              {errors['email'] && (
                <div className="invalid-feedback">
                  {errors['email']}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password" className={['form-label', errors['password'] ? 'is-invalid' : ''].join(' ')}>Password</label>
              <input type="password" className="form-control" id="password" name="password" ref={register} />
              {errors['password'] && (
                <div className="invalid-feedback">
                  {errors['password']}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label htmlFor="password_confirmation" className={['form-label', errors['password_confirmation'] ? 'is-invalid' : ''].join(' ')}>Password Confirm</label>
              <input type="password" className="form-control" id="password_confirmation" name="password_confirmation" value={old.password_confirmation} ref={register} />
              {errors['password_confirmation'] && (
                <div className="invalid-feedback">
                  {errors['password_confirmation']}
                </div>
              )}
            </div>
            
            <div className="d-flex justify-content-end align-items-center">
              <button type="submit" className="btn btn-sm btn-dark">
                Reset Password
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ResetPassword.layout = page => <AppLayout children={page} title="Reset Password" />
export default ResetPassword;
```

#### VerifyEmail.js

```js
// resources/js/pages/Auth/VerifyEmail.js
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';

const VerifyEmail = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
  } = props;

  const {
    status,
  } = _session;

  const handleResendVerification = () => {
    Inertia.post(route('verification.send'), {}, {
      preserveState: false,
    });
  };

  const handleLogout = () => {
    Inertia.post(route('logout'), {}, {
      preserveState: false,
    });
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Verify Your Email</h5>
          <hr />

          {status === 'verification-link-sent' && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              A new verification link has been sent to the email.
              <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
          )}

          <p className="mb-3">
            Thanks for signing up! Before getting started, could you verify your email address by clicking on the link we just emailed to you? If you didn't receive the email, we will gladly send you another.
          </p>

          <div className="d-flex align-items-center justify-content-between">
            <button type="button" className="btn btn-sm btn-dark" onClick={handleResendVerification}>
              Resend Verification Email
            </button>
            
            <button type="button" className="btn btn-sm btn-link link-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
```

#### Dashboard.js

```js
// resources/js/pages/Dashboard.js
import React from 'react';
import AppLayout from '@/layouts/AppLayout';

const Dashboard = (props) => {
  return (
    <div className="container">
      <div className="row">
        <div className="col-12">
          Dashboard
        </div>
      </div>
    </div>
  );
};

Dashboard.layout = page => <AppLayout children={page} />
export default Dashboard;
```

Remember define the route for dashboard in `routes/web.php`.

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function (Request $request) {
        return Inertia::render('Dashboard');
    })->name('dashboard');
});
```

and `HOME` of `app/Providers/RouteServiceProvider.php`

```php
public const HOME = '/dashboard';
```

### User Profile

If you try Jetstream before, I guess you must feel impressive by first glance on **Profile** page. We will start from this page.

Jetstream support 5 features by default in this page which are

* Profile Information
* Update Password
* Two Factor Authentication
* Browser Sessions
* Delete Account

When you use Jetstream first time, you probably run a command and then “BOOM” everything done. Amazing! At the same time with a  little bit afraid of them, seems you may custom them someday, but they look like very complex . Don't worry, this section is for you.

We will not complete all of them 100%. For example, I skip `Features::profilePhotos()` which is feature about upload and manage user avatar. 

But still I will go thourgh most of features andI think once you get concept and complete this section you should have ability to identify where is the feature from, and custom them by yourself.

Let's get start. Create a controller to handle profile features - `UserProfileController`

```sh
$ php artisan make:controller UserProfileController
```

Show profile page 

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class UserProfileController extends Controller
{
    public function show (Request $request)
    {
        return Inertia::render('Profile/Show');
    }
}
```

```php
use App\Http\Controllers\UserProfileController;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function (Request $request) {
        return Inertia::render('Dashboard');
    })->name('dashboard');
		 
    Route::get('/user/profile', [UserProfileController::class, 'show'])
        ->name('profile.show');
});
```

Create `resources/js/pages/Profile/Show.js` for view `Profile/Show` and its components

```js
import React from 'react';
import { usePage } from '@inertiajs/inertia-react';

import AppLayout from '@/layouts/AppLayout';
import UpdateProfileInformationForm from '@/pages/Profile/UpdateProfileInformationForm';
import UpdatePasswordForm from '@/pages/Profile/UpdatePasswordForm';
import TwoFactorAuthenticationForm from '@/pages/Profile/TwoFactorAuthenticationForm';
import LogoutOtherBrowserSessionsForm from '@/pages/Profile/LogoutOtherBrowserSessionsForm';
import DeleteAccountForm from '@/pages/Profile/DeleteAccountForm';

const Show = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
    user,
    sessions,
  } = props;

  return (
    <>
      <div className="container py-5">
        <div className="mb-5">
          <UpdateProfileInformationForm
            user={user}
            errors={errors.updateProfileInformation}
            status={_session.status}
          />
        </div>

        <div className="mb-5">
          <UpdatePasswordForm
            errors={errors.updatePassword}
            status={_session.status}
          />
        </div>

        <div className="mb-5">
          <TwoFactorAuthenticationForm
            user={user}
          />
        </div>

        <div className="mb-5">
          <LogoutOtherBrowserSessionsForm
            sessions={sessions}
            errors={errors.logoutOtherBrowserSessions}
          />
        </div>

        <div className="mb-5">
          <DeleteAccountForm
            errors={errors.deleteUser}
          />
        </div>
      </div>
    </>
  );
};

Show.layout = page => (<AppLayout children={page} title="User Profile" />);
export default Show;
```

#### Common components

There are many small reusful components In Jetstream which follow DRY principle. But here to keep things simple I try to reduce amount of components and extract few components which use too many times. Remember you should create `components` folder.

First component, it will display flash message after operation complete such as update user's name.

```jsx
// resources/js/components/FlashMessage.js
import React, { useEffect, useState } from 'react';

const fadeOut = `
  @keyframes fade-out {
    0% { opacity: 1;}
    99% { opacity: 0.01 ;width: 100%; height: 100%;}
    100% { opacity: 0; width: 0; height: 0;}
  }
`;

const FlashMessage = ({
  duration,
  children,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let t;
    if (isVisible) {
      t = setTimeout(() => {
        setIsVisible(false);
      }, duration * 1000);
    }
    return () => {
      if (t) {
        clearTimeout(t);
      }
    }
  }, [isVisible]);

  return isVisible ? (
    <>
      <style children={fadeOut} />
      <span
        style={{
          animationDuration: `${duration}s`,
          animationIterationCount: 1,
          animationName: 'fade-out',
          animationTimingFunction: 'ease-out',
        }}
      >
        {children}
      </span>
    </>
  ) : null;
};

export default FlashMessage;
```

```jsx
// resources/js/components/Modal.js
import React, { useRef, useEffect } from 'react';
import { Modal as BSModal } from 'bootstrap';

const Modal = ({
  isActive,
  head,
  children,
  footer,
}) => {
  const el = useRef(null);
  const modal = useRef(null);

  useEffect(() => {
    modal.current = new BSModal(el.current, {
      backdrop: 'static',
    });
  }, []);

  useEffect(() => {
    if (!modal.current) {
      return;
    }
    if (isActive) {
      modal.current.show();
    } else {
      modal.current.hide();
    }
  }, [isActive]);

  return (
    <>
      <div className="modal fade" tabIndex="-1" ref={el}>
        <div className="modal-dialog">
          <div className="modal-content">
            {head && (
              <div className="modal-header">
                {head}
              </div>
            )}
            
            <div className="modal-body">
              {children}
            </div>

            {footer && (
              <div className="modal-footer">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Modal;
```

#### Profile information

```js
// resources/js/pages/Profile/UpdateProfileInformationForm.js
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import FlashMessage from '@/components/FlashMessage';

const UpdateProfileInformationForm = ({
  user = {},
  errors = {},
  status,
}) => {
  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.put(route('user-profile-information.update'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Profile Information</h5>
        <p>
          Update your account's profile information and email address.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <form
              id="update-profile-information-form"
              onSubmit={handleSubmit(submit)}
              noValidate=""
            >
              <div className="mb-3">
                <label htmlFor="name" className={['form-label', errors.name ? 'is-invalid' : ''].join(' ')}>Name</label>
                <input type="text" className="form-control" id="name" name="name" defaultValue={user.name} ref={register} />
                {(errors.name) && (
                  <div className="invalid-feedback">
                    {errors.name}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label htmlFor="email" className={['form-label', errors.email ? 'is-invalid' : ''].join(' ')}>Email</label>
                <input type="text" className="form-control" id="email" name="email" defaultValue={user.email} ref={register} />
                {(errors.email) && (
                  <div className="invalid-feedback">
                    {errors.email}
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="card-footer text-end">
            {status === 'profile-information-updated' && (
              <FlashMessage duration={2}>
                <span className="me-3">Saved!</span>
              </FlashMessage>
            )}
            
            <button type="submit" form="update-profile-information-form" className="btn btn-sm btn-dark">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfileInformationForm;
```

#### Update Password

```js
// resources/js/pages/Profile/UpdatePasswordForm.js
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import FlashMessage from '@/components/FlashMessage';

const UpdatePasswordForm = ({
  errors = {},
  status,
}) => {
  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.put(route('user-password.update'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Update Password</h5>
        <p>
          Ensure your account is using a long, random password to stay secure.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <form id="update-password-form" onSubmit={handleSubmit(submit)} noValidate="">
              <div className="mb-3">
                <label htmlFor="current-password" className={['form-label', errors.current_password ? 'is-invalid' : ''].join(' ')}>Current Password</label>
                <input type="password" className="form-control" id="current-password" name="current_password" ref={register} />
                {errors.current_password && (
                  <div className="invalid-feedback">
                    {errors.current_password}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="password" className={['form-label', errors.password ? 'is-invalid' : ''].join(' ')}>New Password</label>
                <input type="password" className="form-control" id="password" name="password" ref={register} />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="password-confirmation" className={['form-label', errors.password_confirmation ? 'is-invalid' : ''].join(' ')}>Confirm Password</label>
                <input type="password" className="form-control" id="password-confirmation" name="password_confirmation" ref={register} />
                {errors.password_confirmation && (
                  <div className="invalid-feedback">
                    {errors.password_confirmation}
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="card-footer text-end">
            {status === 'password-updated' && (
              <FlashMessage duration={2}>
                <span className="me-3">Saved!</span>
              </FlashMessage>
            )}
            
            <button type="submit" form="update-password-form" className="btn btn-sm btn-dark">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdatePasswordForm;
```

#### Two-factor Authentication

Fortify also provide two factor authentication in box, if you are looking for introduction in detail for Fortify, besides official docs,  you can check out [Laravel Fortify: Setting up two factor authentication](https://www.epndavis.com/blog/post/laravel-fortify-two-factor-authentication). The most different with that is I change Vue to React.

To support two factor authentication, first, checkout our `config/fortify.php` should uncomment the feature.

```php
Features::twoFactorAuthentication([
    'confirmPassword' => true,
]),
```

Next, user model should support it.

```php
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable;

    // ...

    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];
}
```

Fortify generates all routes for us in order to enable a user with two factor authentication. The rest of things are we should provide views and make call with those API.

The steps are:

When user wants to enable two factor authentication, he/she should confirms password. And we should check status with

```http
GET /user/confirmed-password-status

// Route Helper
route('password.confirmation')
```

Provide password to confirm with

```http
POST /user/confirm-password
{
  password: 'YOUR_PASSWORD',
}

// Route Helper
route('password.confirm')
```

Enable two factor authentication with 

```http
POST /user/two-factor-authentication
```

Retrieve QR Code with

```http
GET /user/two-factor-qr-code
```

Get recovery codes

```http
GET /user/two-factor-recovery-codes
```

Regenerate recovery codes

```http
POST /user/two-factor-recovery-codes
```

To handle password confirmation we can build a common component

```js
// resources/js/components/ConfirmsPassword.js
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

import Modal from '@/components/Modal';

const ConfirmsPassword = ({
  id,
  children,
  onConfirmed,
}) => {
  const [isActive, setIsActive] = useState(false);

  const handleActive = (active) => {
    return (e) => {
      e.preventDefault();
      if (active) {
        axios.get(route('password.confirmation'))
          .then(response => {
            if (response.data.confirmed) {
              onConfirmed();
            } else {
              setIsActive(true);
            }
          });
      } else {
        setIsActive(false);
      }
    };
  };

  const {
    register,
    handleSubmit,
    setError,
    errors,
  } = useForm();

  const submit = (data) => {
    axios.post(route('password.confirm'), {
      ...data,
    }).then(response => {
      onConfirmed();
      setIsActive(false);
    }).catch(error => {
      const {
        response: {
          data: {
            errors,
          },
        },
      } = error;
      if (errors.password) {
        setError('password', {
          message: errors.password[0],
        });
      }
    });
  };

  return (
    <>
      {React.isValidElement(children) && React.cloneElement(children, {
        onClick: handleActive(true),
      })}

      <Modal
        isActive={isActive}
        head={(
          <>
            <h5>Confirm Password</h5>
            <button className="btn-close" onClick={handleActive(false)}></button>
          </>
        )}
        footer={(
          <>
            <button type="button" className="btn btn-sm btn-secondary" onClick={handleActive(false)}>Nevermind</button>
            <button type="submit" className="btn btn-sm btn-primary" form={`${id}-confirms-password-form`}>Confirm</button>
          </>
        )}
      >
        <>
          <div>For your security, please confirm your password to continue.</div>
          <form id={`${id}-confirms-password-form`} onSubmit={handleSubmit(submit)} noValidate="">
            <div className="mb-3">
              <label htmlFor="password" className={['form-label', errors.password ? 'is-invalid' : ''].join(' ')}>New Password</label>
              <input type="password" className="form-control" id="password" name="password" ref={register} />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>
          </form>
        </>
      </Modal>
    </>
  );
};

export default ConfirmsPassword;
```

Our two factor authentication component

```js
// resources/js/pages/Profile/TwoFactorAuthenticationForm.js
import React, { useReducer } from 'react';
import { Inertia } from '@inertiajs/inertia';

import ConfirmsPassword from '@/components/ConfirmsPassword';

const TwoFactorAuthenticationForm = ({
  user,
}) => {
  const [state, dispatch] = useReducer((state, {
    type,
    payload
  }) => {
    switch (type) {
      case 'SET_QRCODE':
        return {
          ...state,
          qrCode: payload,
        };
      case 'SET_RECOVERY_CODES':
        return {
          ...state,
          recoveryCodes: payload,
        };
    }
  }, {
    qrCode: undefined,
    recoveryCodes: [],
  });

  const {
    qrCode,
    recoveryCodes,
  } = state;

  const handleEnableTwoFactorAuthentication = async () => {
    await Inertia.post('/user/two-factor-authentication');
    let response = await axios.get('/user/two-factor-qr-code');
    dispatch({
      type: 'SET_QRCODE',
      payload: response.data,
    });

    response = await axios.get('/user/two-factor-recovery-codes');
    dispatch({
      type: 'SET_RECOVERY_CODES',
      payload: response.data,
    });
  };

  const handleShowRecoveryCodes = async () => {
    const response = await axios.get('/user/two-factor-recovery-codes');
    dispatch({
      type: 'SET_RECOVERY_CODES',
      payload: response.data,
    });
  };

  const handleRegenerateRecoveryCodes = async () => {
    await axios.post('/user/two-factor-recovery-codes');
    const response = await axios.get('/user/two-factor-recovery-codes');
    dispatch({
      type: 'SET_RECOVERY_CODES',
      payload: response.data,
    });
  };

  const handleDisableTwoFactorAuthentication = async () => {
    await Inertia.delete('/user/two-factor-authentication');
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Two Factor Authentication</h5>
        <p>
          Add additional security to your account using two factor authentication.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            {user.two_factor_enabled ? (
              <h5 className="card-title">You have enabled two factor authentication.</h5>
            ) : (
              <h5 className="card-title">You have not enabled two factor authentication.</h5>
            )}

            <p className="text-muted">
              When two factor authentication is enabled, you will be prompted for a secure, random token during authentication. You may retrieve this token from your phone's Google Authenticator application.
            </p>
            
            <div className="py-3">
              {user.two_factor_enabled ? (
                <>
                  {qrCode && (
                    <>
                      <p>
                        Two factor authentication is now enabled. Scan the following QR code using your phone's authenticator application. 
                      </p>
                      <div dangerouslySetInnerHTML={{ __html: qrCode.svg }} className="mb-3" />
                    </>
                  )}

                  {recoveryCodes.length > 0 && (
                    <>
                      <p>
                        Store these recovery codes in a secure password manager. They can be used to recover access to your account if your two factor authentication device is lost. 
                      </p>
                      <div className="bg-light p-3 mb-3">
                        {recoveryCodes.map((code) => (
                          <div key={code}>
                            {code}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {recoveryCodes.length > 0 ? (
                    <ConfirmsPassword id="regenerate-recorvery-codes" onConfirmed={handleRegenerateRecoveryCodes}>
                      <button className="btn btn-sm btn-light me-2">Regenerate Recovery Codes</button>
                    </ConfirmsPassword>
                  ) : (
                    <ConfirmsPassword id="show-recorvery-codes" onConfirmed={handleShowRecoveryCodes}>
                      <button className="btn btn-sm btn-light me-2">Show Recovery Codes</button>
                    </ConfirmsPassword>
                  )}

                  <ConfirmsPassword id="disable-two-factor-authentication" onConfirmed={handleDisableTwoFactorAuthentication}>
                    <button className="btn btn-sm btn-danger">Disable</button>
                  </ConfirmsPassword>
                </>
              ) : (
                <>
                  <ConfirmsPassword id="enable-two-factor-authentication" onConfirmed={handleEnableTwoFactorAuthentication}>
                    <button className="btn btn-sm btn-dark">Enable</button>
                  </ConfirmsPassword>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthenticationForm;
```

`Fortify::twoFactorChallengeView`

```jsx
// resources/js/pages/Auth/TwoFactorAuthentication.js
import React, { useState, useCallback } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';


const TwoFactorAuthentication = () => {
  const {
    register,
    handleSubmit,
  } = useForm();

  const [isRecovery, setIsRecovery] = useState(false);

  const submit = (data) => {
    Inertia.post(route('two-factor.login'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  const handleToggleRecovery = (e) => {
    e.preventDefault();
    setIsRecovery(isRecovery => !isRecovery);
  };

  return (
    <div className="mx-auto" style={{ maxWidth: 440, marginTop: 40 }}>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Two Factor Authentication</h5>
          <hr />

          {isRecovery ? (
            <p>
              Please confirm access to your account by entering one of your emergency recovery codes.
            </p>
          ) : (
            <p>
              Please confirm access to your account by entering the authentication code provided by your authenticator application.
            </p>
          )}

          <form onSubmit={handleSubmit(submit)}>
            {!isRecovery ? (
              <div className="mb-3">
                <label htmlFor="code" className="form-label">Code</label>
                <input type="text" inputMode="numeric" className="form-control" id="code" name="code" ref={register} key="code" />
              </div>
            ) : (
              <div className="mb-3">
                <label htmlFor="recovery_code" className="form-label">Recovery Code</label>
                <input type="text" className="form-control" id="recovery_code" name="recovery_code" ref={register} key="recovery_code" />
              </div>
            )}
            
            <div className="d-flex justify-content-end align-items-center">
              <button type="button" className="btn btn-link link-secondary mr-3" onClick={handleToggleRecovery}>
                {isRecovery ? "Use an authentication code" : "Use a recovery code"}
              </button>
              <button type="submit" className="btn btn-sm btn-dark">
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

TwoFactorAuthentication.layout = page => <AppLayout children={page} title="Two Factor Authentication" />
export default TwoFactorAuthentication;
```

#### Browser Sessions

This feature comes from [session](https://laravel.com/docs/8.x/session#introduction), and Jetstream implement these for us.

First, change `config/session.php` that file to database. 

```php
'driver' => env('SESSION_DRIVER', 'database'),
```

Modify `.env`

```yaml
SESSION_DRIVER=database
```

Generate migrations

```sh
$ php artisan session:table
$ php artisan migrate
```

Install dependencies

```sh
$ composer require jenssegers/agent
```

Create `OtherBrowserSessionsController`

```sh
$ php artisan make:controller OtherBrowserSessionsController
```

Route

```php
use App\Http\Controllers\OtherBrowserSessionsController;

Route::delete('/user/other-browser-sessions', [OtherBrowserSessionsController::class, 'destroy'])
  ->name('other-browser-sessions.destroy');
```

Controller

```php
<?php

use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class OtherBrowserSessionsController extends Controller
{
    public function destroy(Request $request, StatefulGuard $guard)
    {
        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['This password does not match our records.'],
            ])->errorBag('logoutOtherBrowserSessions');
        }

        $guard->logoutOtherDevices($request->password);

        $this->deleteOtherSessionRecords($request);

        return back(303);
    }

    protected function deleteOtherSessionRecords(Request $request)
    {
        if (config('session.driver') !== 'database') {
            return;
        }

        DB::table(config('session.table', 'sessions'))
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->where('id', '!=', $request->session()->getId())
            ->delete();
    }
}

```

```jsx
// resources/js/pages/Profile/LogoutOtherBrowserSessionsForm.js
import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import Modal from '@/components/Modal';

const LogoutOtherBrowserSessionsForm = ({
  sessions,
  errors = {},
}) => {
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);

  const handleConfirmLogout = (e) => {
    e.preventDefault();
    setIsConfirmingLogout(true);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setIsConfirmingLogout(false);
  };

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.visit(route('other-browser-sessions.destroy'), {
      method: 'delete',
      data,
      preserveState: true,
      onSuccess: (page) => {
        if (! page.props.errors.logoutOtherBrowserSessions) {
          setIsConfirmingLogout(false);
        }
      },
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Browser Sessions</h5>
        <p>
          Manage and logout your active sessions on other browsers and devices.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <p>
              If necessary, you may logout of all of your other browser sessions across all of your devices. Some of your recent sessions are listed below; however, this list may not be exhaustive. If you feel your account has been compromised, you should also update your password.
            </p>

            {sessions.map((session, index) => (
              <div className="d-flex my-3" key={`${session.ip_address}-${index}`}>
                <div style={{ width: 50 }}>
                  {session.agent.is_desktop ? (
                    <svg fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M0 0h24v24H0z" stroke="none"></path><rect x="7" y="4" width="10" height="16" rx="1"></rect><path d="M11 5h2M12 17v.01"></path>
                    </svg>
                  )}
                </div>
                <div className="d-flex flex-column">
                  <div>
                    {`${session.agent.platform} - ${session.agent.browser}`}
                  </div>
                  <div>
                      <small className="text-muted">
                        {`${session.ip_address}, `}
                        {session.is_current_device ? (
                          <>This device</>
                        ) : (
                          <>Last active {session.last_active}</>
                        )}
                      </small>
                  </div>
                </div>
              </div>
            ))}

            <Modal
              isActive={isConfirmingLogout}
              head={(
                <>
                  <h5>Logout Other Browser Sessions</h5>
                  <button className="btn-close" onClick={handleClose}></button>
                </>
              )}
              footer={(
                <>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={handleClose}>Nevermind</button>
                  <button type="submit" className="btn btn-sm btn-primary" form="logout-other-browser-sessions-form">Logout</button>
                </>
              )}
            >
              <form id="logout-other-browser-sessions-form" onSubmit={handleSubmit(submit)}>
                <div>
                  Please enter your password to confirm you would like to logout of your other browser sessions across all of your devices.
                </div>
                <div className="mb-3">
                  <label 
                    htmlFor="password"
                    className={['form-label', errors.password ? 'is-invalid' : ''].join(' ')}
                  >
                    Password
                  </label>
                  <input 
                    type="password"
                    className="form-control" 
                    id="password" 
                    name="password" 
                    ref={register}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password}
                    </div>
                  )}
                </div>
              </form>
            </Modal>

            <button type="button" className="btn btn-sm btn-dark" onClick={handleConfirmLogout}>
              Logout Other Browser Sessions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutOtherBrowserSessionsForm;
```

#### Delete Account

Here I follow design of Jetstream, but you can put the action where you want. I mean you may don't want to create another controller for it.

Create a controller to handle delete account. 

```sh
$ php artisan make:controller CurrentUserController
```

Route

```php
Route::delete('/user', [CurrentUserController::class, 'destroy'])
	->name('current-user.destroy');
```

Controller

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Auth\StatefulGuard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class CurrentUserController extends Controller
{
    public function destroy (Request $request, StatefulGuard $auth)
    {
        if (! Hash::check($request->password, $request->user()->password)) {
            throw ValidationException::withMessages([
                'password' => ['This password does not match our records.'],
            ])->errorBag('deleteUser');
        }
        $user = User::find($request->user()->id);
        DB::transaction(function () use ($user) {
            // $user->teams()->detach();
            // $user->ownedTeams->each(function ($team) {
            //     $team->purge();
            // });
            // NOTE: If you implement profile photo, you should delete as well.
            $user->delete();
        });
        $auth->logout();
        return response('', 409)->header('X-Inertia-Location', url('/'));
    }
}
```

It worth to mention, originally in `vendor/laravel/jetstream/src/Http/Controllers/Inertia/CurrrentUserController.php`, the action use `app(DeletesUsers::class)->delete($request->user()->fresh());`. It refers to `app/Actions/Jetstream/` through IoC Container, it will handle relevant things such as delete teams, profile photo etc.

```js
// resources/js/pages/Profile/DeleteAccountForm.js
import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import Modal from '@/components/Modal';

const DeleteAccountForm = ({
  errors = {},
}) => {
  const [isConfirmingUserDeletion, setIsConfirmingUserDeletion] = useState(false);

  const handleConfirmUserDeletion = (e) => {
    e.preventDefault();
    setIsConfirmingUserDeletion(true);

  }
  const handleClose = (e) => {
    e.preventDefault();
    setIsConfirmingUserDeletion(false);
  };

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.visit(route('current-user.destroy'), {
      method: 'delete',
      data,
      preserveState: true,
      onSuccess: (page) => {
        if (! page.props.errors.deleteUser) {
          setIsConfirmingUserDeletion(false);
        }
      },
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Delete Account</h5>
        <p>Permanently delete your account</p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain. 
            </div>
            <Modal
              isActive={isConfirmingUserDeletion}
              head={(
                <>
                  <h5>Delete Account</h5>
                  <button className="btn-close" onClick={handleClose}></button>
                </>
              )}
              footer={(
                <>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={handleClose}>Nevermind</button>
                  <button type="submit" className="btn btn-sm btn-danger" form="delete-account-form">Delete</button>
                </>
              )}
            >
              <form id="delete-account-form" onSubmit={handleSubmit(submit)}>
                <div>
                Are you sure you want to delete your account? Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.
                </div>
                <div className="mb-3">
                  <label 
                    htmlFor="password"
                    className={['form-label', errors.password ? 'is-invalid' : ''].join(' ')}
                  >
                    Password
                  </label>
                  <input 
                    type="password"
                    className="form-control" 
                    id="password" 
                    name="password" 
                    ref={register}
                  />
                  {errors.password && (
                    <div className="invalid-feedback">
                      {errors.password}
                    </div>
                  )}
                </div>
              </form>
            </Modal>

            <button type="button" className="btn btn-sm btn-danger" onClick={handleConfirmUserDeletion}>
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountForm;
```

Then we should update `UserProfileController`. I don't put everything at first step because I don't want to make you confuse.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Jenssegers\Agent\Agent;
use Inertia\Inertia;

class UserProfileController extends Controller
{
    public function show (Request $request)
    {
        return Inertia::render('Profile/Show', [
            'sessions' => $this->sessions($request)->all(),
        ]);
    }

    public function sessions(Request $request)
    {
        if (config('session.driver') !== 'database') {
            return collect();
        }
        return collect(
            DB::table(config('session.table', 'sessions'))
                ->where('user_id', $request->user()->getAuthIdentifier())
                ->orderBy('last_activity', 'desc')
                ->get()
        )->map(function ($session) use ($request) {
            $agent = $this->createAgent($session);
            return (object) [
                'agent' => [
                    'is_desktop' => $agent->isDesktop(),
                    'platform' => $agent->platform(),
                    'browser' => $agent->browser(),
                ],
                'ip_address' => $session->ip_address,
                'is_current_device' => $session->id === $request->session()->getId(),
                'last_active' => Carbon::createFromTimestamp($session->last_activity)->diffForHumans()
            ];
        });
    }

    protected function createAgent($session)
    {
        return tap(new Agent, function ($agent) use ($session) {
            $agent->setUserAgent($session->user_agent);
        });
    }
}
```

### Laravel Sanctum with API Tokens

[Jetsteam support API authentication system](https://jetstream.laravel.com/1.x/features/api.html#introduction) by [Laravel Sanctum](https://laravel.com/docs/8.x/sanctum). We can reference those docs to implement.

Install Laravel Sanctum

```sh
$ composer require laravel/sanctum
```

Generate configurations and migrations

```sh
$ php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
$ php artisan migrate
```

Change route in `routes/api.php`. from `api` to `sanctum`

```php
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

Management of API token.

```sh
$ php artisan make:controller ApiTokenController
```

Routes in `routes/web.php`

```php
use App\Http\Controllers\ApiTokenController;

Route::get('/user/api-tokens', [ApiTokenController::class, 'index'])->name('api-tokens.index');
Route::post('/user/api-tokens', [ApiTokenController::class, 'store'])->name('api-tokens.store');
Route::put('/user/api-tokens/{token}', [ApiTokenController::class, 'update'])->name('api-tokens.update');
Route::delete('/user/api-tokens/{token}', [ApiTokenController::class, 'destroy'])->name('api-tokens.destroy');
```

`User` model adds `HasApiTokens`

```php
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasApiTokens;
  	// ...
}
```

It worth to mention about permissions. If you dive into source code of Jetstream you will found out `Jetstream::$permissions`. It is configured in `JetstreamServiceProvider`. But to keep it simple I hard code here.

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ApiTokenController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('API/Index', [
            'tokens' => $request->user()->tokens,
            'availablePermissions' => ['create', 'delete', 'read', 'update'],
            'defaultPermissions' => ['read'],
        ]);
    }

    public function store(Request $request)
    {
        Validator::make([
            'name' => $request->name,
        ], [
            'name' => ['required', 'string', 'max:255'],
        ])->validateWithBag('createApiToken');

        $token = $request->user()->createToken(
            $request->name, array_values(array_intersect($request->input('permissions', []), ['create', 'delete', 'read', 'update']))
        );

        return back()->with('_flash', [
            'token' => explode('|', $token->plainTextToken, 2)[1],
        ])->with('status', 'api-token-created');
    }

    public function update(Request $request, $tokenId)
    {
        $token = $request->user()->tokens()->where('id', $tokenId)->firstOrFail();

        $token->forceFill([
            'abilities' => array_values(array_intersect($request->input('permissions', []), ['create', 'delete', 'read', 'update'])),
        ])->save();

        return back();
    }

    public function destroy(Request $request, $tokenId)
    {
        $request->user()->tokens()->where('id', $tokenId)->delete();
        return back();
    }
}
```

```jsx
// resources/pages/API/Index.js
import React, { useReducer, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';
import FlashMessage from '@/components/FlashMessage';
import Modal from '@/components/Modal';

const Index = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
    availablePermissions = [],
    defaultPermissions,
    tokens = [],
  } = props;

  const {
    _old_inputs: old = {},
  } = _session;

  // State
  const [state, dispatch] = useReducer((state, action) => {
    const {
      type,
      payload,
    } = action;

    switch (type) {
      case 'UPDATE':
        return {
          ...state,
          ...payload,
        };
    }
  }, {
    isApiTokenCreated: false,
    isDisplayingToken: false,
    isEditingToken: false,
    isDeletingToken: false,
    willDeleteToken: undefined,
  });

  const {
    isApiTokenCreated,
    isDisplayingToken,
    isEditingToken,
    isDeletingToken,
    willDeleteToken,
  } = state;

  // Create Api Token
  const {
    register: createApiTokenRegister,
    handleSubmit: handleCreateApiTokenSubmit,
  } = useForm({
    defaultValues: {
      name: old.name,
      permissions: defaultPermissions,
    },
  });

  const onCreateApiToken = (data) => {
    Inertia.post(route('api-tokens.store'), {
      ...data,
    }, {
      preserveState: false,
    });
  };

  const handleCreateApiTokenModal = (active) => {
    return (e) => {
      e.preventDefault();
      dispatch({
        type: 'UPDATE',
        payload: {
          isDisplayingToken: active,
        },
      });
    };
  };

  // Update Api Token
  const {
    register: updateApiTokenRegister,
    handleSubmit: handleUpdateApiTokenSubmit,
    setValue: setUpdateApiTokenValue,
  } = useForm();

  const onUpdateApiToken = ({
    token_id,
    permissions,
  }) => {
    Inertia.put(route('api-tokens.update', token_id), {
      permissions,
    }, {
      preserveState: true,
      onFinish: () => {
        dispatch({
          type: 'UPDATE',
          payload: {
            isEditingToken: false,
          },
        });
      },
    });
  };

  const handleUpdateApiTokenModal = (active) => {
    return (e) => {
      e.preventDefault();
      dispatch({
        type: 'UPDATE',
        payload: {
          isEditingToken: active,
        },
      });
    };
  };

  const handleUpdateApiTokenPermissions = (token) => {
    return (e) => {
      e.preventDefault();
      setUpdateApiTokenValue('token_id', token.id);
      setUpdateApiTokenValue('permissions', token.abilities);

      dispatch({
        type: 'UPDATE',
        payload: {
          isEditingToken: true,
        },
      });
    };
  };

  // Delete Api Token
  const handleDeleteApiTokenModal = (active) => {
    return (e) => {
      e.preventDefault();
      dispatch({
        type: 'UPDATE',
        payload: {
          isDeletingToken: active,
        },
      });
    };
  };

  const handleChangeDeleteApiToken = (token) => {
    return (e) => {
      e.preventDefault();
      dispatch({
        type: 'UPDATE',
        payload: {
          willDeleteToken: token,
          isDeletingToken: true,
        },
      });
    };
  };

  const handleDeleteApiToken = (e) => {
    e.preventDefault();
    Inertia.delete(route('api-tokens.destroy', willDeleteToken), {
      preserveState: false,
      onFinish: () => {
        dispatch({
          type: 'UPDATE',
          payload: {
            willDeleteToken: undefined,
            isDeletingToken: false,
          },
        });
      },
    });
  };

  // Handle Inertia status
  useEffect(() => {
    switch (_session.status) {
      case 'api-token-created':
        dispatch({
          type: 'UPDATE',
          payload: {
            isApiTokenCreated: true,
            isDisplayingToken: true,
          },
        });
        break;
    }
  }, [_session]);

  return (
    <>
      <div className="container py-5">

        {/* Create API Token  */}
        <div className="row mb-5">
          <div className="col-4">
            <h5>Create API Token</h5>
            <p>
              API tokens allow third-party services to authenticate with our application on your behalf.
            </p>
          </div>
          <div className="col-8">
            <div className="card">
              <div className="card-body">
                <form id="create-api-token" onSubmit={handleCreateApiTokenSubmit(onCreateApiToken)} noValidate="">
                  <div className="mb-3">
                    <label htmlFor="name" className={['form-label', errors['createApiToken'] && errors['createApiToken']['name'] ? 'is-invalid' : ''].join(' ')}>Name</label>
                    <input type="text" className="form-control" id="name" name="name" ref={createApiTokenRegister} />
                    {(errors['createApiToken'] && errors['createApiToken']['name']) && (
                      <div className="invalid-feedback">
                        {errors['createApiToken']['name']}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Permissions</label>
                    <div>
                      {availablePermissions.map((permission) => (
                        <div className="form-check form-check-inline" key={`available-permission-${permission}`}>
                          <input
                            type="checkbox"
                            className="form-check-input"
                            name="permissions"
                            id={`available-permission-${permission}`}
                            value={permission}
                            ref={createApiTokenRegister}
                          />
                          <label className="form-check-label" htmlFor={`available-permission-${permission}`}>
                            {permission.charAt(0).toUpperCase() + permission.slice(1)}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* API Token Modal */}
                    <Modal 
                      isActive={isDisplayingToken}
                      head={(
                        <>
                          <h5>API Token</h5>
                          <button className="btn-close" onClick={handleCreateApiTokenModal(false)}></button>
                        </>
                      )}
                      footer={(
                        <>
                          <button type="button" className="btn btn-sm btn-primary" onClick={handleCreateApiTokenModal(false)}>Close</button>
                        </>
                      )}
                    >
                      <>
                        <div className="mb-3">
                          Please copy your new API token. For your security, it won't be shown again. 
                        </div>
                        <div className="bg-light p-2 rounded">
                          {_session._flash.token}
                        </div>
                      </>
                    </Modal>
                  </div>
                </form>
              </div>
              <div className="card-footer text-end">
                {isApiTokenCreated && (
                  <FlashMessage
                    duration={2}
                  >
                    <span className="me-3">Created!</span>
                  </FlashMessage>
                )}
                
                <button type="submit" form="create-api-token" className="btn btn-sm btn-dark">
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Manage API Tokens.  */}
        {tokens.length > 0 && (
          <div className="row mb-5">
            <div className="col-4">
              <h5>Manage API Tokens</h5>
              <p>
                You may delete any of your existing tokens if they are no longer needed.
              </p>
            </div>
            <div className="col-8">
              <div className="card">
                <div className="card-body">
                  <Modal 
                    isActive={isEditingToken}
                    head={(
                      <>
                        <h5>API Token Permissions</h5>
                        <button className="btn-close" onClick={handleUpdateApiTokenModal(false)}></button>
                      </>
                    )}
                    footer={(
                      <>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={handleUpdateApiTokenModal(false)}>Nevermind</button>
                        <button type="submit" className="btn btn-sm btn-primary" form="update-api-token-form">Confirm</button>
                      </>
                    )}
                  >
                    <form id="update-api-token-form" onSubmit={handleUpdateApiTokenSubmit(onUpdateApiToken)} noValidate="">
                      <input type="hidden" name="token_id" ref={updateApiTokenRegister} />
                      {availablePermissions.map((permission) => (
                        <div className="form-check form-check-inline" key={`update-api-token-${permission}`}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            name="permissions"
                            id={`update-api-token-${permission}`}
                            value={permission}
                            ref={updateApiTokenRegister}
                          />
                          <label className="form-check-label" htmlFor={`update-api-token-${permission}`}>
                            {permission.charAt(0).toUpperCase() + permission.slice(1)}
                          </label>
                        </div>
                      ))}
                    </form>
                  </Modal>

                  <Modal 
                    isActive={willDeleteToken && isDeletingToken}
                    head={(
                      <>
                        <h5>Delete API Token</h5>
                        <button className="btn-close" onClick={handleDeleteApiTokenModal(false)}></button>
                      </>
                    )}
                    footer={(
                      <>
                        <button type="button" className="btn btn-sm btn-secondary" onClick={handleDeleteApiTokenModal(false)}>Nevermind</button>
                        <button type="button" className="btn btn-sm btn-primary" onClick={handleDeleteApiToken}>Confirm</button>
                      </>
                    )}
                  >
                    <div>
                      Are you sure you would like to delete this API ({willDeleteToken && willDeleteToken.name}) token? 
                    </div>
                  </Modal>
                  
                  {/* Token List */}
                  {[...tokens].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).map((token) => (
                    <div className="d-flex justify-content-between py-2" key={token.id}>
                      <div>{token.name}</div>
                      <div className="d-inline-flex align-items-center">
                        <button
                          className="btn btn-sm btn-light me-1"
                          type="button"
                          onClick={handleUpdateApiTokenPermissions(token)}
                        >
                          Permissions
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={handleChangeDeleteApiToken(token)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </>
  );
};

Index.layout = page => (<AppLayout children={page} title="API Tokens" />);
export default Index;
```

Modify `AppLayout.js` to add link

```jsx
<li><InertiaLink className="dropdown-item" href={route('api-tokens.index')}>API Token</InertiaLink></li>
```

### Teams & Roles

Teams feature is fully support by Jetstream, hence we have to completely build it by ourself.

```sh
$ php artisan make:model Team --migration
```

```php
Schema::create('teams', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->index();
    $table->string('name');
    $table->boolean('personal_team');
    $table->timestamps();
});
```

```sh
$ php artisan make:migration create_team_user_table
```

```php
Schema::create('team_user', function (Blueprint $table) {
    $table->id();
    $table->foreignId('team_id');
    $table->foreignId('user_id');
    $table->string('role')->nullable();
    $table->timestamps();

    $table->unique(['team_id', 'user_id']);
});
```

```sh
$ php artisan make:model Membership
$ php artisan migrate
```

`Membership` is  pivot model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class Membership extends Pivot
{
    protected $table = 'team_user';

    public $incrementing = true;
}
```

Add migration for `User` because we need to add fields.

```php
$ php artisan make:migration add_current_team_to_users_table
```

```php
/**
 * Run the migrations.
 *
 * @return void
 */
public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->foreignId('current_team_id')->nullable();
    });
}

/**
 * Reverse the migrations.
 *
 * @return void
 */
public function down()
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropForeign(['current_team_id']);
    });
}
```

Add methods for `User` model. The `$roles` in Jetstream is place in config and provider that you can change easily. But again, this example is use for explaination not 100% production ready so we place in user model.

```php
<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable, TwoFactorAuthenticatable, HasApiTokens;

    public static $roles = [
        'owner' => [
            'key' => 'owner',
            'name' => 'Owner',
            'permissions' => ['*'],
            'description' => ['Super User for owner'],
        ],
        'admin' => [
            'key' => 'admin',
            'name' => 'Administrator',
            'permissions' => ['create', 'read', 'update', 'delete'],
            'description' => 'Administrator users can perform any action.'
        ],
        'editor' => [
            'key' => 'editor',
            'name' => 'Editor',
            'permissions' => ['create', 'read', 'update'],
            'description' => 'Editor users have the ability to read, create, and update.'
        ]
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for arrays.
     *
     * @var array
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    public function isCurrentTeam($team)
    {
        return $team->id === $this->currentTeam->id;
    }

    public function currentTeam()
    {
        if (is_null($this->current_team_id) && $this->id) {
            $this->switchTeam($this->personalTeam());
        }
        return $this->belongsTo(Team::class, 'current_team_id');
    }

    public function switchTeam($team)
    {
        if (! $this->belongsToTeam($team)) {
            return false;
        }

        $this->forceFill([
            'current_team_id' => $team->id,
        ])->save();

        $this->setRelation('currentTeam', $team);

        return true;
    }

    public function allTeams()
    {
        return $this->ownedTeams->merge($this->teams)->sortBy('name');
    }

    public function ownedTeams()
    {
        return $this->hasMany(Team::class);
    }

    public function teams()
    {
        return $this->belongsToMany(Team::class, Membership::class)
            ->withPivot('role')
            ->withTimestamps()
            ->as('membership');
    }

    public function personalTeam()
    {
        return $this->ownedTeams->where('personal_team', true)->first();
    }

    public function ownsTeam($team)
    {
        return $this->id == $team->user_id;
    }

    public function belongsToTeam($team)
    {
        return $this->teams->contains(function ($t) use ($team) {
            return $t->id === $team->id;
        }) || $this->ownsTeam($team);
    }

    public function teamRole($team)
    {
        if ($this->ownsTeam($team)) {
            return static::$roles['owner'];
        }

        if (! $this->belongsToTeam($team)) {
            return;
        }

        $key = $team->users->where(
            'id', $this->id
        )->first()->membership->role ?? null;
        return static::$roles[$key];
    }

    public function hasTeamRole($team, string $role)
    {
        if ($this->ownsTeam($team)) {
            return true;
        }
        $key = $team->users->where('id', $this->id)->first()->membership->role ?? null;

        return $this->belongsToTeam($team) && optional(static::roles[$key])['key'] === $role;
    }

    public function teamPermissions($team)
    {
        if ($this->ownsTeam($team)) {
            return ['*'];
        }

        if (! $this->belongsToTeam($team)) {
            return [];
        }

        return $this->teamRole($team)->permissions;
    }

    public function hasTeamPermission($team, string $permission)
    {
        if ($this->ownsTeam($team)) {
            return true;
        }

        if (! $this->belongsToTeam($team)) {
            return false;
        }

        if (in_array(HasApiTokens::class, class_uses_recursive($this)) &&
            ! $this->tokenCan($permission) &&
            $this->currentAccessToken() !== null) {
            return false;
        }

        $permissions = $this->teamPermissions($team);

        return in_array($permission, $permissions) ||
               in_array('*', $permissions) ||
               (Str::endsWith($permission, ':create') && in_array('*:create', $permissions)) ||
               (Str::endsWith($permission, ':update') && in_array('*:update', $permissions));

    }
}

```

`Team` model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    use HasFactory;

    protected $casts = [
        'personal_team' => 'boolean',
    ];

    protected $fillable = [
        'name',
        'personal_team',
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function allUsers()
    {
        return $this->users->merge([$this->owner]);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, Membership::class)
            ->withPivot('role')
            ->withTimestamps()
            ->as('membership');
    }

    public function hasUser($user)
    {
        return $this->users->contains($user) || $user->ownsTeam($this);
    }

    public function hasUserWithEmail(string $email)
    {
        return $this->allUsers()->contains(function ($user) use ($email) {
            return $user->email === $email;
        });
    }

    public function userHasPermission($user, $permission)
    {
        return $user->hasTeamPermission($this, $permission);
    }

    public function removeUser($user)
    {
        if ($user->current_team_id === $this->id) {
            $user->forceFill([
                'current_team_id' => null,
            ])->save();
        }

        $this->users()->detach($user);
    }

    public function purge()
    {
        $this->owner()->where('current_team_id', $this->id)
            ->update(['current_team_id' => null]);
        $this->users()->where('current_team_id', $this->id)
            ->update(['current_team_id' => null]);
        $this->users()->detach();
        $this->delete();
    }
}
```

After complete models we can modify `app/Actions/Fortify/CreateNewUser.php` to implement default behavior when register account.

```php
<?php

namespace App\Actions\Fortify;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array  $input
     * @return \App\Models\User
     */
    public function create(array $input)
    {
        Validator::make($input, [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique(User::class),
            ],
            'password' => $this->passwordRules(),
        ])->validate();

        return DB::transaction(function () use ($input) {
            return tap(User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => Hash::make($input['password']),
            ]), function (User $user) {
                $this->createTeam($user);
            });
        });
    }

    protected function createTeam(User $user)
    {
        $user->ownedTeams()->save(Team::forceCreate([
            'user_id' => $user->id,
            'name' => explode(' ', $user->name, 2)[0]."'s Team",
            'personal_team' => true,
        ]));
    }
}
```

Team's policy

```sh
$ php artisan make:policy TeamPolicy
```

```php
<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TeamPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user)
    {
        return true;
    }

    public function view(User $user, Team $team)
    {
        return $user->belongsToTeam($team);
    }

    public function create(User $user)
    {
        return true;
    }

    public function update(User $user, Team $team)
    {
        return $user->ownsTeam($team);
    }

    public function addTeamMember(User $user, Team $team)
    {
        return $user->ownsTeam($team);
    }

    public function updateTeamMember(User $user, Team $team)
    {
        return $user->ownsTeam($team);
    }

    public function removeTeamMember(User $user, Team $team)
    {
        return $user->ownsTeam($team);
    }

    public function delete(User $user, Team $team)
    {
        return $user->ownsTeam($team);
    }
}

```

Register in `app/Providers/AuthServiceProvider。php` 

```php
use App\Models\Team;
use App\Policies\TeamPolicy;

class AuthServiceProvider extends ServiceProvider
{
  	protected $policies = [
        // 'App\Models\Model' => 'App\Policies\ModelPolicy',
        Team::class => TeamPolicy::class,
    ];
}
```

Add team data in `HandleInertiaRequests.php` middleware.

```php
public function share(Request $request)
{   
    return array_merge(parent::share($request), [
        'user' => function () use ($request) {
            if (!$request->user()) {
                return;
            }

            if ($request->user()) {
                $request->user()->currentTeam;
            }

            return array_merge($request->user()->toArray(), array_filter([
                'all_teams' => $request->user()->allTeams() ?? null,
            ]), [
                'two_factor_enabled' => ! is_null($request->user()->two_factor_secret),
            ]);
        },
        '_token' => function () {
            return Session::token();
        },
        '_session' => function () {
            return Session::all();
        },
    ]);
}
```

Controllers

```sh
$ php artisan make:controller TeamController
$ php artisan make:controller CurrentTeamController
$ php artisan make:controller TeamMemberController
```

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Team;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamController extends Controller
{
    public function create(Request $request)
    {
        return Inertia::render('Teams/Create');
    }

    public function store(Request $request)
    {
        Gate::forUser($request->user())->authorize('create', new Team);

        Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255']
        ])->validateWithBag('createTeam');

        $request->user()->ownedTeams()->create([
            'name' => $request->input('name'),
            'personal_team' => false,
        ]);

        return redirect(config('fortify.home'));
    }

    public function show(Request $request, $teamId)
    {
        $team = (new Team)->findOrFail($teamId);

        if (Gate::denies('view', $team)) {
            abort(403);
        }
        return Inertia::render('Teams/Show', [
            'team' => $team->load('owner', 'users'),
            'availableRoles' => array_values(User::$roles),
            'availablePermissions' => ['create', 'delete', 'read', 'update'],
            'defaultPermissions' => ['read'],
            'permissions' => [
                'canAddTeamMembers' => Gate::check('addTeamMember', $team),
                'canDeleteTeam' => Gate::check('delete', $team),
                'canRemoveTeamMembers' => Gate::check('removeTeamMember', $team),
                'canUpdateTeam' => Gate::check('update', $team),
            ],
        ]);
    }

    public function update(Request $request, $teamId)
    {
        $team = (new Team)->findOrFail($teamId);

        Gate::forUser($request->user())->authorize('update', $team);

        Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
        ])->validateWithBag('updateTeam');

        $team->forceFill([
            'name' => $request->input('name'),
        ])->save();

        return back(303)->with('status', 'team-updated');
    }

    public function destroy(Request $request, $teamId)
    {
        $team = (new Team)->findOrFail($teamId);
        $user = $request->user();

        Gate::forUser($user)->authorize('delete', $team);

        if ($team->personal_team) {
            throw ValidationException::withMessages([
                'team' => __('You may not delete your personal team.'),
            ]);
        }

        $team->purge();

        return redirect(config('fortify.home'))->with('status', 'team-deleted');
    }
}
```

```php
<?php

namespace App\Http\Controllers;

use App\Models\Team;
use Illuminate\Http\Request;

class CurrentTeamController extends Controller
{
    public function update(Request $request)
    {
        $team = (new Team)->findOrFail($request->team_id);
        
        if (! $request->user()->switchTeam($team)) {
            abort(403);
        }

        return redirect(config('fortify.home'), 303);
    }
}

```

```php
<?php

namespace App\Http\Controllers;

use App\Models\Team;
use App\Models\User;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\Request;

class TeamMemberController extends Controller
{
    public function store(Request $request, $teamId)
    {
        $team = (new Team)->findOrFail($teamId);
        $user = $request->user();

        Gate::forUser($user)->authorize('addTeamMember', $team);

        $email = $request->input('email') ?? "";
        $role = $request->input('role') ?? "";

        Validator::make([
            'email' => $email,
            'role' => $role,
        ], [
            'email' => ['required', 'email', 'exists:users'],
            'role' => ['required', 'string', 'in:admin,editor'],
        ], [
            'email.exists' => 'We were unable to find a registered user with this email address.'
        ])->after(function ($validator) use ($team, $email) {
            $validator->errors()->addIf(
                $team->hasUserWithEmail($email),
                'email',
                __('This user already belongs to the team.')
            );
        })->validateWithBag('addTeamMember');
        $newMember = (new User)->where('email', $email)->firstOrFail();
        $team->users()->attach(
            $newMember,
            ['role' => $role]
        );

        return back(303)->with('status', 'team-member-added');
    }

    public function update(Request $request, $teamId, $userId)
    {
        $team = (new Team)->findOrFail($teamId);
        $user = $request->user();
        $role = $request->role;
        
        Gate::forUser($user)->authorize('updateTeamMember', $team);

        Validator::make([
            'role' => $role,
        ], [
            'role' => ['required', 'string', 'in:admin,editor'],
        ])->validateWithBag('updateTeamMember');
        // NOTE: $userId is belongs to team member
        $team->users()->updateExistingPivot($userId, [
            'role' => $role,
        ]);
        
        return back(303)->with('status', 'team-member-updated');
    }

    public function destroy(Request $request, $teamId, $userId)
    {
        $team = (new Team)->findOrFail($teamId);
        $user = $request->user();
        $teamMember = (new User)->findOrFail($userId);

        If (! Gate::forUser($user)->check('removeTeamMember', $team) &&
            $user->id !== $teamMember->id
        ) {
            throw new AuthorizationException;
        }

        if ($teamMember->id === $team->owner->id) {
            throw ValidationException::withMessages([
                'team' => [__('You may not leave a team that you created.')],
            ])->errorBag('removeTeamMember');
        }

        $team->removeUser($teamMember);

        if ($user->id === $teamMember->id) {
            return redirect(config('fortify.home'));
        }

        return back(303)->with('status', 'team-member-removed');
    }
}

```

Routes

```php
use App\Http\Controllers\TeamController;
use App\Http\Controllers\CurrentTeamController;
use App\Http\Controllers\TeamMemberController;


Route::get('/teams/create', [TeamController::class, 'create'])->name('teams.create');
Route::post('/teams', [TeamController::class, 'store'])->name('teams.store');
Route::get('/teams/{team}', [TeamController::class, 'show'])->name('teams.show');
Route::put('/teams/{team}', [TeamController::class, 'update'])->name('teams.update');
Route::delete('/teams/{team}', [TeamController::class, 'destroy'])->name('teams.destroy');
Route::put('/current-team', [CurrentTeamController::class, 'update'])->name('current-team.update');
Route::post('/teams/{team}/members', [TeamMemberController::class, 'store'])->name('team-members.store');
Route::put('/teams/{team}/members/{user}', [TeamMemberController::class, 'update'])->name('team-members.update');
Route::delete('/teams/{team}/members/{user}', [TeamMemberController::class, 'destroy'])->name('team-members.destroy');
```

Views

```jsx
// resources/js/pages/Teams/Create.js
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { usePage } from '@inertiajs/inertia-react';
import { useForm } from 'react-hook-form';

import AppLayout from '@/layouts/AppLayout';

const Create = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
    user,
  } = props;

  const {
    _old_input: old = {},
  } = _session;

  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.post(route('teams.store'), {
      ...data
    });
  };

  return (
    <div className="container py-5">
      <div className="row mb-5">
        <div className="col-4">
          <h5>Team Details</h5>
          <p>
            Create a new team to collaborate with others on projects.
          </p>
        </div>
        <div className="col-8">
          <div className="card">
            <div className="card-body">
              <form id="create-team" onSubmit={handleSubmit(submit)}>
                <div className="mb-3">
                  <label className="form-label">Team Owner</label>
                  <div>
                    {user.name}
                    <div>
                      <small className="text-muted">{user.email}</small>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="name" className={['form-label', errors.createTeam && errors.createTeam.name ? 'is-invalid' : ''].join(' ')}>Team Name</label>
                  <input type="text" className="form-control" id="name" name="name" defaultValue={old.name} ref={register} />
                  {(errors.createTeam && errors.createTeam.name) && (
                    <div className="invalid-feedback">
                      {errors.createTeam.name}
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="card-footer text-end">
              <button type="submit" form="create-team" className="btn btn-sm btn-dark">Create</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Create.layout = page => (<AppLayout children={page} title="Create Team" />);
export default Create;
```

```jsx
// resources/js/pages/Teams/Show.js
import React from 'react';
import { usePage } from '@inertiajs/inertia-react';

import AppLayout from '@/layouts/AppLayout';
import UpdateTeamNameForm from '@/pages/Teams/UpdateTeamNameForm';
import AddTeamMemberForm from '@/pages/Teams/AddTeamMemberForm';
import TeamMembersForm from '@/pages/Teams/TeamMembersForm';
import DeleteTeamForm from '@/pages/Teams/DeleteTeamForm';

const Show = () => {
  const {
    props,
  } = usePage();

  const {
    _session,
    errors,
    team,
    user,
    availableRoles,
    permissions,
  } = props;

  const {
    _old_input: old = {},
  } = _session;

  return (
    <div className="container py-5">
      <div className="mb-5">
        <UpdateTeamNameForm
          errors={errors.updateTeam}
          status={_session.status}
          user={user}
          team={team}
        />
      </div>

      <div className="mb-5">
        <AddTeamMemberForm
          errors={errors.addTeamMember}
          status={_session.status}
          team={team}
          old={old}
          availableRoles={availableRoles.filter(role => role.key !== 'owner')}
        />
      </div>

      {team.users.length > 0 && (
        <div className="mb-5">
          <TeamMembersForm
            errors={errors.updateTeamMember}
            team={team}
            availableRoles={availableRoles.filter(role => role.key !== 'owner')}
          />
        </div>
      )}

      {(permissions.canDeleteTeam && !team.personal_team) && (
        <div className="mb-5">
          <DeleteTeamForm
            team={team}
          />
        </div>
      )}
    </div>
  );
};

Show.layout = page => (<AppLayout children={page} title="Team Settings" />);
export default Show;
```

```jsx
// resources/js/pages/Teams/UpdateTeamNameForm.js
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import FlashMessage from '@/components/FlashMessage';

const UpdateTeamNameForm = ({
  errors = {},
  status,
  user,
  team,
}) => {
  const {
    register,
    handleSubmit,
  } = useForm();

  const submit = (data) => {
    Inertia.put(route('teams.update', team), {
      ...data
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Team Name</h5>
        <p>
          The team's name and owner information.
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <form id="update-team-name-form" onSubmit={handleSubmit(submit)}>
              <div className="mb-3">
                <label className="form-label">Team Owner</label>
                <div>{user.name}</div>
                <div><small className="text-muted">{user.email}</small></div>
              </div>

              <div className="mb-3">
                <label htmlFor="name" className={['form-label', errors.name ? 'is-invalid' : ''].join(' ')}>Team Name</label>
                <input type="text" className="form-control" id="name" name="name" defaultValue={team.name} ref={register} />
                {errors.name && (
                  <div className="invalid-feedback">
                    {errors.name}
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="card-footer text-end">
            {status === 'team-updated' && (
              <FlashMessage duration={2}>
                <span className="me-3">Updated!</span>
              </FlashMessage>
            )}

            <button type="submit" form="update-team-name-form" className="btn btn-sm btn-dark">
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateTeamNameForm;
```

```jsx
// resources/js/pages/Teams/AddTeamMemberForm.js
import React from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import FlashMessage from '@/components/FlashMessage';

const AddTeamMemberForm = ({
  old,
  team,
  availableRoles,
  errors = {},
  status,
}) => {
  const {
    register,
    handleSubmit,
    watch,
  } = useForm();

  const watchRole = watch('role');
  
  const submit = (data) => {
    Inertia.post(route('team-members.store', team), {
      ...data
    }, {
      preserveState: false,
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Add Team Member</h5>
        <p>
          Add a new team member to your team, allowing them to collaborate with you. 
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              Please provide the email address of the person you would like to add to this team. The email address must be associated with an existing account.
            </div>
            <form id="add-team-member-form" onSubmit={handleSubmit(submit)}>
              <div className="mb-3">
                <label htmlFor="email" className={['form-label', errors.email ? 'is-invalid' : ''].join(' ')}>Email</label>
                <input type="text" className="form-control" id="email" name="email" defaultValue={old.email} ref={register} />
                {errors.email && (
                  <div className="invalid-feedback">
                    {errors.email}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <ul className={['list-group', errors.role ? 'is-invalid' : ''].join(' ')}>
                  {availableRoles.map((role) => (
                    <label
                      key={role.key}
                      htmlFor={role.key}
                      className={['list-group-item', 'list-group-item-action', watchRole === role.key ? 'active' : ''].join(' ')}
                    >
                      <div className="d-flex align-items-center">
                        {role.name}
                        {watchRole === role.key && (
                          <svg className="me-2" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        )}
                        <input
                          className="d-none"
                          type="radio"
                          name="role"
                          id={role.key}
                          value={role.key}
                          ref={register}
                        />
                      </div>
                      
                      <div className={[watchRole === role.key ? 'text-white-50' : 'text-black-50']}>
                        {role.description}
                      </div>
                    </label> 
                  ))}
                </ul>
                {errors.role && (
                  <div className="invalid-feedback">
                    {errors.role}
                  </div>
                )}
              </div>
            </form>
          </div>
          <div className="card-footer text-end">
            {status === 'team-member-added' && (
              <FlashMessage duration={2}>
                <span className="me-3">Added!</span>
              </FlashMessage>
            )}

            <button type="submit" form="add-team-member-form" className="btn btn-sm btn-dark">Add</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTeamMemberForm;
```

```jsx
// resources/js/pages/Teams/TeamMembersForm.js
import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { useForm } from 'react-hook-form';

import Modal from '@/components/Modal';

const TeamMembersForm = ({
  team,
  availableRoles,
  errors = {},
}) => {
  const [isManagingTeamMember, setIsManagingTeamMember] = useState(false);

  const handleManageTeamMember = (member) => {
    return (e) => {
      e.preventDefault();
      setValue('member', member.id);
      setValue('role', member.membership.role);
      setIsManagingTeamMember(true);
    }
  };

  const handleClose = (e) => {
    e.preventDefault();
    setIsManagingTeamMember(false);
  };

  const handleDeleteTeamMember = (member) => {
    return (e) => {
      e.preventDefault();
      Inertia.delete(route('team-members.destroy', [team, member.id]), {
        preserveScroll: true,
        preserveState: true,
      });
    };
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
  } = useForm();

  const watchRole = watch('role');

  const submit = (data) => {
    Inertia.put(route('team-members.update', [team, data.member]), {
      role: data.role,
    }, {
      preserveState: true,
      onSuccess: (page) => {
        if (! page.props.errors.updateTeamMember) {
          setIsManagingTeamMember(false);
        }
      },
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Team Members</h5>
        <p>
          All of the people that are part of this team. 
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            {team.users.map((user) => (
              <div className="d-flex justify-content-between py-2" key={user.id}>
                <span>{user.name}</span>
                <div className="d-flex align-items-center">
                  <button className="btn btn-sm btn-light me-2" onClick={handleManageTeamMember(user)}>{user.membership.role}</button>
                  <button className="btn btn-sm btn-danger" onClick={handleDeleteTeamMember(user)}>Delete</button>
                </div>
              </div>
            ))}

            <Modal
              isActive={isManagingTeamMember}
              head={(
                <>
                  <h5>Manage Role</h5>
                  <button className="btn-close" onClick={handleClose}></button>
                </>
              )}
              footer={(
                <>
                  <button type="button" className="btn btn-sm btn-secondary" onClick={handleClose}>Nevermind</button>
                  <button type="submit" className="btn btn-sm btn-primary" form="update-team-member-form">Confirm</button>
                </>
              )}
            >
              <form id="update-team-member-form" onSubmit={handleSubmit(submit)}>
                <input type="hidden" name="member" ref={register} />
                <div className="mb-3">
                  <ul className={['list-group', errors.role ? 'is-invalid' : ''].join(' ')}>
                    {availableRoles.map((role) => (
                      <label
                        key={role.key}
                        htmlFor={`team-members-form-${role.key}`}
                        className={['list-group-item', 'list-group-item-action', watchRole === role.key ? 'active' : ''].join(' ')}
                      >
                        <div className="d-flex align-items-center">
                          {role.name}
                          {watchRole === role.key && (
                            <svg className="ms-2" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          )}
                          <input
                            className="d-none"
                            type="radio"
                            name="role"
                            id={`team-members-form-${role.key}`}
                            value={role.key}
                            ref={register}
                          />
                        </div>
                        
                        <div className={[watchRole === role.key ? 'text-white-50' : 'text-black-50']}>
                          {role.description}
                        </div>
                      </label>
                    ))}
                  </ul>
                  {errors.role && (
                    <div className="invalid-feedback">
                      {errors.role}
                    </div>
                  )}
                </div>
              </form>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMembersForm;
```

```js
// resources/js/pages/Teams/DeleteTeamForm.js
import React, { useState } from 'react';
import { Inertia } from '@inertiajs/inertia';

import Modal from '@/components/Modal';

const DeleteTeamForm = ({
  team,
}) => {
  const [isConfirmingTeamDeletion, setIsConfirmingTeamDeletion] = useState(false);

  const handleConfirmTeamDeletion = (e) => {
    e.preventDefault();
    setIsConfirmingTeamDeletion(true);
  };

  const handleClose = (e) => {
    e.preventDefault();
    setIsConfirmingTeamDeletion(false);
  };

  const handleConfirmed = (e) => {
    e.preventDefault();
    Inertia.delete(route('teams.destroy', team), {
      preserveState: false,
    });
  };

  return (
    <div className="row">
      <div className="col-4">
        <h5>Delete Team</h5>
        <p>
          Permanently delete this team. 
        </p>
      </div>
      <div className="col-8">
        <div className="card">
          <div className="card-body">
            <div className="mb-3">
              Once a team is deleted, all of its resources and data will be permanently deleted. Before deleting this team, please download any data or information regarding this team that you wish to retain. 
            </div>
            <button className="btn btn-sm btn-danger" onClick={handleConfirmTeamDeletion}>Delete</button>
            <Modal
              isActive={isConfirmingTeamDeletion}
              head={(
                <>
                  <h5>Delete Team</h5>
                  <button className="btn-close" onClick={handleClose}></button>
                </>
              )}
              footer={(
                <>
                  <button className="btn btn-sm btn-secondary" onClick={handleClose}>Nevermind</button>
                  <button className="btn btn-sm btn-primary" onClick={handleConfirmed}>Confirm</button>
                </>
              )}
            >
              <p>
                Are you sure you want to delete this team? Once a team is deleted, all of its resources and data will be permanently deleted. 
              </p>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteTeamForm;
```

Go to `AppLayout.js`, change nabber links.

```jsx
<li><InertiaLink className="dropdown-item" href={route('teams.show', user.current_team)}>Team Settings</InertiaLink></li>
<li><InertiaLink className="dropdown-item" href={route('teams.create')}>Create New Team</InertiaLink></li>
<li><hr className="dropdown-divider" /></li>
<li><h6 className="dropdown-header">Switch Teams</h6></li>
{Object.values(user.all_teams).map(team => (
  <li key={team.id}>
    <a href="#" className="dropdown-item" onClick={(e) => {
      e.preventDefault();
      Inertia.put(route('current-team.update'), {
        'team_id': team.id,
      }, {
        preserveState: false,
      });
    }}>
      {team.id === user.current_team_id && (
        <svg className="me-2 text-green-400" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
      )}

      {team.name}
    </a>
  </li>
))}
```



## Source Code

* [Github](https://github.com/andyyou/react-jetstream-like-demo)