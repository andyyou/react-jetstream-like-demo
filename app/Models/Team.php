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