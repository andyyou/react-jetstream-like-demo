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
