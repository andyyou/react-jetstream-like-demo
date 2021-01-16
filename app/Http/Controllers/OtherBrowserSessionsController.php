<?php

namespace App\Http\Controllers;

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
