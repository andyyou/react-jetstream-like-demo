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
            // NOTE: If you implement profile photo, you should delete as well.
            $user->delete();
        });
        $auth->logout();
        return response('', 409)->header('X-Inertia-Location', url('/'));
    }
}
