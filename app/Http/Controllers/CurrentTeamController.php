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
