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
