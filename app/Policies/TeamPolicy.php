<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class TeamPolicy
{
    use HandlesAuthorization;

    /**
     * Create a new policy instance.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

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
