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
