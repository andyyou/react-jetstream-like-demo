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
